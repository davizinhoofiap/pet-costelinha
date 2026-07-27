import crypto from 'crypto';

/**
 * Utilitário de Criptografia Simétrica AES-256-GCM (Nativo do Node.js)
 * Conforme exigências da LGPD (Art. 46 - Medidas de Segurança e Criptografia de Dados Pessoais).
 */

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96 bits recomendado para GCM
const AUTH_TAG_LENGTH = 16; // 128 bits para tag de autenticação

// Obter chave de criptografia de 32 bytes (256 bits) das variáveis de ambiente
function getMasterKey(): Buffer {
  const secret = process.env.ENCRYPTION_KEY || process.env.JWT_SECRET || 'pet_costelinha_aes256_master_key_32bytes!';
  return crypto.createHash('sha256').update(secret).digest();
}

/**
 * Criptografa um texto sensível (ex: CPF, Telefone) retornando string no formato iv:authTag:ciphertext
 */
export function encryptData(text: string | null | undefined): string | null {
  if (!text) return null;

  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const key = getMasterKey();
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag().toString('hex');

    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  } catch (error) {
    console.error('❌ Erro na criptografia AES-256-GCM:', error);
    throw new Error('Falha na proteção de dados sensíveis.');
  }
}

/**
 * Descriptografa uma string codificada iv:authTag:ciphertext
 */
export function decryptData(encryptedString: string | null | undefined): string | null {
  if (!encryptedString) return null;

  try {
    const parts = encryptedString.split(':');
    if (parts.length !== 3) {
      // Retorna o texto caso não esteja no formato criptografado (retrocompatibilidade)
      return encryptedString;
    }

    const [ivHex, authTagHex, cipherTextHex] = parts;

    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const key = getMasterKey();

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(cipherTextHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('❌ Erro na descriptografia dos dados:', error);
    return encryptedString; // Fallback de integridade
  }
}
