interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const tracker = new Map<string, RateLimitRecord>();

/**
 * Utilitário de Limitação de Taxa (Rate Limit) por IP para rotas Next.js App Router
 * @param ip IP do cliente
 * @param limit Número máximo de solicitações permitidas no intervalo
 * @param windowMs Duração da janela em milissegundos
 */
export function rateLimit(ip: string, limit: number = 5, windowMs: number = 60 * 1000): { success: boolean; remaining: number } {
  const now = Date.now();
  const record = tracker.get(ip);

  // Limpeza de memória a cada 100 entradas para evitar memory leaks
  if (tracker.size > 5000) {
    for (const [key, value] of tracker.entries()) {
      if (value.resetTime < now) {
        tracker.delete(key);
      }
    }
  }

  if (!record || record.resetTime < now) {
    tracker.set(ip, { count: 1, resetTime: now + windowMs });
    return { success: true, remaining: limit - 1 };
  }

  if (record.count >= limit) {
    return { success: false, remaining: 0 };
  }

  record.count += 1;
  return { success: true, remaining: limit - record.count };
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }
  return '127.0.0.1';
}
