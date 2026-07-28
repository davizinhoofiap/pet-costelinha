import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const requestId = req.headers.get('x-request-id') || crypto.randomUUID();
  const startTime = performance.now();

  let dbStatus = 'disconnected';
  let dbLatencyMs = 0;
  let mpStatus = 'unknown';

  // 1. Verificação de Saúde do Banco de Dados (Prisma MySQL/Aiven)
  try {
    const dbStart = performance.now();
    await prisma.$queryRaw`SELECT 1`;
    dbLatencyMs = Math.round(performance.now() - dbStart);
    dbStatus = 'healthy';
  } catch (err: any) {
    dbStatus = 'unhealthy';
    logger.error('Erro no Health Check do Banco de Dados', {
      requestId,
      error: err.message,
    });
  }

  // 2. Verificação de Saúde da API do Mercado Pago
  try {
    const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    if (token) {
      const mpRes = await fetch('https://api.mercadopago.com/v1/payment_methods', {
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(3000), // Timeout de 3s
      });
      mpStatus = mpRes.ok ? 'healthy' : `error_http_${mpRes.status}`;
    } else {
      mpStatus = 'unconfigured';
    }
  } catch (err: any) {
    mpStatus = 'unreachable';
  }

  const memoryUsage = process.memoryUsage();
  const totalExecutionTimeMs = Math.round(performance.now() - startTime);

  const healthData = {
    status: dbStatus === 'healthy' ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    request_id: requestId,
    execution_time_ms: totalExecutionTimeMs,
    uptime_seconds: Math.floor(process.uptime()),
    database: {
      status: dbStatus,
      latency_ms: dbLatencyMs,
    },
    services: {
      mercado_pago_api: mpStatus,
    },
    system_memory: {
      rss_mb: Math.round((memoryUsage.rss / 1024 / 1024) * 100) / 100,
      heap_used_mb: Math.round((memoryUsage.heapUsed / 1024 / 1024) * 100) / 100,
      heap_total_mb: Math.round((memoryUsage.heapTotal / 1024 / 1024) * 100) / 100,
    },
  };

  logger.info('Health Check Executado', {
    requestId,
    healthStatus: healthData.status,
    dbLatencyMs,
    totalExecutionTimeMs,
  });

  return NextResponse.json(healthData, {
    status: healthData.status === 'ok' ? 200 : 503,
    headers: {
      'X-Request-ID': requestId,
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    },
  });
}
