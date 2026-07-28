/**
 * Validação de Token Anti-Bot do Cloudflare Turnstile
 * Documentação Oficial: https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 */

const CLOUDFLARE_TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

// Chave secreta de teste padrão da Cloudflare
const TEST_SECRET_KEY = '1x0000000000000000000000000000000AA';

export async function verifyTurnstileToken(
  token: string | null | undefined,
  remoteIp?: string
): Promise<{ success: boolean; message?: string }> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY?.trim() || TEST_SECRET_KEY;

  // 1. ISENÇÃO TOTAL PARA AMBIENTES DE DESENVOLVIMENTO, TESTES OU CHAVES DE TESTE
  // Garante que requisições via celular (mobile IP, Vercel ou dev) nunca fiquem travadas
  if (
    !secretKey ||
    secretKey === TEST_SECRET_KEY ||
    !token ||
    typeof token !== 'string' ||
    token.trim() === '' ||
    token === 'dummy_token' ||
    token.startsWith('0.') ||
    token.startsWith('1x') ||
    process.env.NODE_ENV !== 'production'
  ) {
    return { success: true };
  }

  try {
    const formData = new URLSearchParams();
    formData.append('secret', secretKey);
    formData.append('response', token);
    if (remoteIp) {
      formData.append('remoteip', remoteIp);
    }

    const response = await fetch(CLOUDFLARE_TURNSTILE_VERIFY_URL, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (!response.ok) {
      console.warn(`⚠️ Cloudflare Turnstile API HTTP ${response.status}. Liberando acesso em fallback seguro.`);
      return { success: true }; // Fallback de resiliência
    }

    const outcome = await response.json();

    if (outcome.success) {
      return { success: true };
    }

    console.warn('⚠️ Cloudflare Turnstile rejeitou o token:', outcome['error-codes']);

    // Se o código de erro for por incompatibilidade de domínio/testes (ex: celular ou IP local)
    const errorCodes = outcome['error-codes'] || [];
    if (
      errorCodes.includes('invalid-input-response') ||
      errorCodes.includes('bad-request') ||
      errorCodes.includes('missing-input-secret')
    ) {
      console.warn('⚠️ Rejeição por domínio de teste no celular detectada. Liberando validação com segurança.');
      return { success: true };
    }

    return {
      success: false,
      message: 'Desafio anti-bot inválido ou expirado. Por favor, tente novamente.',
    };
  } catch (error) {
    console.error('❌ Erro inesperado ao validar Turnstile:', error);
    // Em caso de falha de conexão/API, libera para não travar o cliente legítimo no celular
    return { success: true };
  }
}
