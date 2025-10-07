/**
 * Тестовый скрипт для проверки IMAP подключения
 * 
 * Запуск: npx tsx server/email/test-email.ts
 */

import 'dotenv/config'; // Загружаем .env
import { EmailService } from './services/EmailService';
import { EmailConfig } from './types/email.types';

async function testEmailConnection() {
  console.log('🚀 Тестирование IMAP подключения...\n');

  // Конфигурация (замените на свои данные)
  const config: EmailConfig = {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    password: process.env.EMAIL_PASSWORD || 'your-app-password',
    host: process.env.EMAIL_HOST || 'imap.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '993'),
    tls: true,
    tlsOptions: {
      rejectUnauthorized: false,
    },
  };

  console.log('📧 Конфигурация:');
  console.log(`   Email: ${config.user}`);
  console.log(`   Host: ${config.host}:${config.port}`);
  console.log(`   TLS: ${config.tls}\n`);

  const emailService = new EmailService(config);

  try {
    // Тест 1: Подключение
    console.log('📡 Тест 1: Проверка подключения...');
    const isConnected = await emailService.testConnection();
    
    if (!isConnected) {
      console.error('❌ Не удалось подключиться к почтовому серверу');
      process.exit(1);
    }
    console.log('✅ Подключение успешно!\n');

    // Тест 2: Чтение последних писем
    console.log('📨 Тест 2: Чтение последних 3 писем...');
    const allEmails = await emailService.fetchAllEmails(3);
    
    console.log(`✅ Получено писем: ${allEmails.length}\n`);
    
    allEmails.forEach((email, index) => {
      console.log(`📧 Письмо ${index + 1}:`);
      console.log(`   From: ${email.from}`);
      console.log(`   Subject: ${email.subject}`);
      console.log(`   Date: ${email.date}`);
      console.log(`   Message-ID: ${email.messageId}`);
      console.log(`   Text preview: ${email.text.substring(0, 100)}...`);
      console.log('');
    });

    // Тест 3: Непрочитанные письма
    console.log('📬 Тест 3: Проверка непрочитанных писем...');
    const unreadEmails = await emailService.fetchUnreadEmails(5);
    console.log(`✅ Непрочитанных писем: ${unreadEmails.length}\n`);

    if (unreadEmails.length > 0) {
      console.log('Непрочитанные письма:');
      unreadEmails.forEach((email, index) => {
        console.log(`${index + 1}. ${email.subject} (от: ${email.from})`);
      });
    }

    console.log('\n✅ Все тесты пройдены успешно!');
    
    // Отключение
    emailService.disconnect();
    
  } catch (error) {
    console.error('\n❌ Ошибка при тестировании:', error);
    process.exit(1);
  }
}

// Запуск тестов
testEmailConnection();

