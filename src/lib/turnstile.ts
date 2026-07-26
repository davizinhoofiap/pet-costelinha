/**
 * Validação de Token Anti-Bot do Cloudflare Turnstile
 * Documentação Oficial: https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 */

const CLOUDFLARE_TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

// Chave secreta de teste padrão da Cloudflare que SEMPRE PASSA (para ambiente de dev local)
const TEST_SECRET_KEY = '1x0000000000000000000000000000000AA';

export async function verifyTurnstileToken(token: string, remoteIp?: string): Promise<{ success: boolean; message?: string }> {
  // Se nenhum token for enviado na requisição
  if (!token || typeof token !== 'string' || token.trim() === '') {
    return { success: false, message: 'Validação Anti-Bot do Turnstile é obrigatória.' };
  }

  const secretKey = process.env.TURNSTILE_SECRET_KEY || TEST_SECRET_KEY;

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
      console.error(`❌ Cloudflare Turnstile API retornou erro HTTP ${response.status}`);
      // Em dev ou em caso de erro temporário da API Cloudflare, autorizar fallback seguro se for chave de teste
      if (secretKey === TEST_SECRET_KEY) {
        return { success: true };
      }
      return { success: false, message: 'Falha na comunicação com o serviço anti-bot da Cloudflare.' };
    }

    const outcome = await response.json();

    if (outcome.success) {
      return { success: true };
    }

    console.warn('⚠️ Cloudflare Turnstile rejeitou o token:', outcome['error-codes']);
    return {
      success: false,
      message: 'Desafio anti-bot inválido ou expirado. Por favor, tente novamente.',
    };
  } catch (error) {
    console.error('❌ Erro inesperado ao validar Turnstile:', error);
    // Em dev local sem internet/serviço, liberar se chave for de teste
    if (secretKey === TEST_SECRET_KEY) {
      return { success: true };
    }
    return { success: false, message: 'Erro interno ao validar o desafio anti-bot.' };
  }
}
