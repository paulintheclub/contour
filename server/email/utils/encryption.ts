import crypto from 'crypto';

// Получаем ключ шифрования из переменных окружения
const ENCRYPTION_KEY = process.env.EMAIL_ENCRYPTION_KEY || 'default-32-char-secret-key-change-me!!'; // Должен быть 32 символа
const ALGORITHM = 'aes-256-cbc';

/**
 * Зашифровать пароль
 */
export function encryptPassword(password: string): string {
  if (!password) return '';
  
  const iv = crypto.randomBytes(16);
  const key = Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').substring(0, 32));
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(password, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  // Возвращаем IV + зашифрованные данные
  return iv.toString('hex') + ':' + encrypted;
}

/**
 * Расшифровать пароль
 */
export function decryptPassword(encryptedPassword: string): string {
  if (!encryptedPassword) return '';
  
  try {
    const parts = encryptedPassword.split(':');
    if (parts.length !== 2) {
      throw new Error('Неверный формат зашифрованного пароля');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    const key = Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').substring(0, 32));
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Ошибка расшифровки пароля:', error);
    return '';
  }
}

