import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

/**
 * Sistema de Rate Limiting com Upstash Redis + Fallback Resiliente em Memória
 * Limita requisições abusivas por IP (ex: 10 requisições a cada 60s).
 */

const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

let upstashRatelimit: Ratelimit | null = null;

if (upstashUrl && upstashToken && !upstashUrl.includes('SUA_URL_AQUI')) {
  try {
    const redis = new Redis({
      url: upstashUrl,
      token: upstashToken,
    });

    upstashRatelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '60 s'),
      analytics: true,
      prefix: '@upstash/ratelimit/petshop',
    });

    console.log('✅ Upstash Redis Rate Limiting inicializado com sucesso.');
  } catch (err) {
    console.error('⚠️ Falha ao conectar ao Upstash Redis. Ativando fallback em memória:', err);
    upstashRatelimit = null;
  }
}

// Memory fallback para ambiente local quando Upstash ainda não está configurado no .env
const memoryTracker = new Map<string, { count: number; resetTime: number }>();

export async function checkRateLimit(
  identifier: string,
  limit: number = 10,
  windowSeconds: number = 60
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  // 1. Se o Upstash Redis estiver configurado, utilizar a borda (Edge)
  if (upstashRatelimit) {
    try {
      const res = await upstashRatelimit.limit(identifier);
      return {
        success: res.success,
        limit: res.limit,
        remaining: res.remaining,
        reset: res.reset,
      };
    } catch (err) {
      console.error('Erro na chamada do Upstash Redis. Usando fallback:', err);
    }
  }

  // 2. Fallback resiliente em memória
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const record = memoryTracker.get(identifier);

  // Limpeza periódica
  if (memoryTracker.size > 2000) {
    for (const [key, val] of memoryTracker.entries()) {
      if (val.resetTime < now) memoryTracker.delete(key);
    }
  }

  if (!record || record.resetTime < now) {
    memoryTracker.set(identifier, { count: 1, resetTime: now + windowMs });
    return {
      success: true,
      limit,
      remaining: limit - 1,
      reset: now + windowMs,
    };
  }

  if (record.count >= limit) {
    return {
      success: false,
      limit,
      remaining: 0,
      reset: record.resetTime,
    };
  }

  record.count += 1;
  return {
    success: true,
    limit,
    remaining: limit - record.count,
    reset: record.resetTime,
  };
}
