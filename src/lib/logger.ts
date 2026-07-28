export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogContext {
  requestId?: string;
  path?: string;
  method?: string;
  userId?: string;
  execution_time_ms?: number;
  [key: string]: any;
}

// aqui a gente define quais campos são sensíveis pra mascarar nos logs e ficar 100% de acordo com a LGPD
const SENSITIVE_KEYS = [
  'cpf',
  'senha',
  'password',
  'email',
  'telefone',
  'celular',
  'phone',
  'endereco',
  'cartao',
  'card',
  'token',
  'turnstiletoken',
  'secret',
  'access_token',
  'authorization',
  'qrcode',
  'qrcodebase64',
];

// essa função limpa e esconde dados pessoais dentro de qualquer objeto ou lista antes de salvar o log
export function sanitizePII(data: any): any {
  if (data === null || data === undefined) return data;

  if (typeof data === 'string') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizePII(item));
  }

  if (typeof data === 'object') {
    const sanitized: Record<string, any> = {};

    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();

      const isSensitive = SENSITIVE_KEYS.some((sensitiveKey) =>
        lowerKey.includes(sensitiveKey)
      );

      if (isSensitive) {
        if (typeof value === 'string') {
          if (lowerKey.includes('cpf')) {
            sanitized[key] = '***.***.***-**';
          } else if (lowerKey.includes('email')) {
            const parts = value.split('@');
            if (parts.length === 2) {
              sanitized[key] = `${parts[0].slice(0, 2)}***@${parts[1]}`;
            } else {
              sanitized[key] = '***@***.com';
            }
          } else if (lowerKey.includes('telefone') || lowerKey.includes('phone') || lowerKey.includes('celular')) {
            sanitized[key] = '(**) *****-****';
          } else {
            sanitized[key] = '[REDACTED_LGPD]';
          }
        } else {
          sanitized[key] = '[REDACTED_LGPD]';
        }
      } else {
        sanitized[key] = sanitizePII(value);
      }
    }

    return sanitized;
  }

  return data;
}

// aqui fica o nosso logger estruturado em JSON pra facilitar o monitoramento em produção
class Logger {
  private log(level: LogLevel, message: string, context?: LogContext) {
    const timestamp = new Date().toISOString();
    const sanitizedContext = context ? sanitizePII(context) : {};

    const logEntry = {
      timestamp,
      level: level.toUpperCase(),
      message,
      environment: process.env.NODE_ENV || 'development',
      ...sanitizedContext,
    };

    const jsonString = JSON.stringify(logEntry);

    switch (level) {
      case 'error':
        console.error(jsonString);
        break;
      case 'warn':
        console.warn(jsonString);
        break;
      case 'debug':
        console.debug(jsonString);
        break;
      case 'info':
      default:
        console.log(jsonString);
        break;
    }
  }

  info(message: string, context?: LogContext) {
    this.log('info', message, context);
  }

  warn(message: string, context?: LogContext) {
    this.log('warn', message, context);
  }

  error(message: string, context?: LogContext) {
    this.log('error', message, context);
  }

  debug(message: string, context?: LogContext) {
    this.log('debug', message, context);
  }

  // essa função mede quanto tempo uma busca no banco ou chamada de API demorou e avisa se passar de 500ms
  async measureTime<T>(
    operationName: string,
    fn: () => Promise<T>,
    context: LogContext = {}
  ): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      const durationMs = Math.round(performance.now() - start);

      if (durationMs > 500) {
        this.warn(`⚠️ ALERTA DE PERFORMANCE: ${operationName} demorou ${durationMs}ms`, {
          ...context,
          operationName,
          execution_time_ms: durationMs,
          slow_query_alert: true,
        });
      } else {
        this.info(`${operationName} concluído em ${durationMs}ms`, {
          ...context,
          operationName,
          execution_time_ms: durationMs,
        });
      }

      return result;
    } catch (error: any) {
      const durationMs = Math.round(performance.now() - start);
      this.error(`❌ ERRO EM: ${operationName}`, {
        ...context,
        operationName,
        execution_time_ms: durationMs,
        errorMessage: error.message || String(error),
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      });
      throw error;
    }
  }
}

export const logger = new Logger();
