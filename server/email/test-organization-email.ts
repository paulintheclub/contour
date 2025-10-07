/**
 * Тестовый скрипт для проверки email интеграции организации из БД
 * 
 * Запуск: npx tsx server/email/test-organization-email.ts <organization-id>
 */

import 'dotenv/config';
import { EmailService } from './services/EmailService';
import { getOrganizationEmailConfig } from './utils/getOrganizationEmailConfig';
import { prisma } from '@/lib/prisma';

async function testOrganizationEmail() {
  const organizationId = process.argv[2];

  if (!organizationId) {
    console.error('❌ Укажите ID организации:\n');
    console.log('Использование: npx tsx server/email/test-organization-email.ts <organization-id>\n');
    
    // Показать доступные организации
    const orgs = await prisma.organization.findMany({
      where: { emailEnabled: true },
      select: { id: true, name: true, emailUser: true },
    });

    if (orgs.length > 0) {
      console.log('📋 Доступные организации с включенным email:');
      orgs.forEach((org) => {
        console.log(`   • ${org.name} (${org.id})`);
        console.log(`     Email: ${org.emailUser}`);
      });
    } else {
      console.log('ℹ️  Нет организаций с включенным email.');
      console.log('   Создайте организацию через Super Admin панель.');
    }
    
    process.exit(1);
  }

  console.log('🚀 Тестирование email интеграции организации...\n');

  try {
    // Получить организацию
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { id: true, name: true, emailEnabled: true, emailUser: true },
    });

    if (!org) {
      console.error('❌ Организация не найдена');
      process.exit(1);
    }

    console.log('📌 Организация:', org.name);
    console.log('📧 Email:', org.emailUser);
    console.log('🔌 Email интеграция:', org.emailEnabled ? '✅ Включена' : '❌ Отключена');
    console.log('');

    if (!org.emailEnabled) {
      console.error('❌ Email интеграция отключена для этой организации');
      console.log('ℹ️  Включите email интеграцию в Super Admin панели\n');
      process.exit(1);
    }

    // Получить конфигурацию
    console.log('🔐 Получение email конфигурации из БД...');
    const config = await getOrganizationEmailConfig(organizationId);

    if (!config) {
      console.error('❌ Не удалось получить email конфигурацию');
      console.log('ℹ️  Проверьте настройки email в Super Admin панели\n');
      process.exit(1);
    }

    console.log('✅ Конфигурация получена');
    console.log(`   Host: ${config.host}:${config.port}`);
    console.log(`   TLS: ${config.tls}\n`);

    // Создать Email Service
    const emailService = new EmailService(config);

    // Тест 1: Подключение
    console.log('📡 Тест 1: Проверка подключения...');
    const isConnected = await emailService.testConnection();

    if (!isConnected) {
      console.error('❌ Не удалось подключиться к почтовому серверу');
      console.log('ℹ️  Проверьте App Password в настройках организации\n');
      process.exit(1);
    }
    console.log('✅ Подключение успешно!\n');

    // Тест 2: Чтение последних писем
    console.log('📨 Тест 2: Чтение последних 5 писем...');
    await emailService.connect();
    const allEmails = await emailService.fetchAllEmails(5);
    
    console.log(`✅ Получено писем: ${allEmails.length}\n`);
    
    if (allEmails.length > 0) {
      allEmails.forEach((email, index) => {
        console.log(`📧 Письмо ${index + 1}:`);
        console.log(`   From: ${email.from}`);
        console.log(`   Subject: ${email.subject}`);
        console.log(`   Date: ${email.date}`);
        console.log(`   Message-ID: ${email.messageId}`);
        if (email.text) {
          console.log(`   Preview: ${email.text.substring(0, 80)}...`);
        }
        console.log('');
      });
    }

    // Тест 3: Непрочитанные письма
    console.log('📬 Тест 3: Проверка непрочитанных писем...');
    const unreadEmails = await emailService.fetchUnreadEmails(10);
    console.log(`✅ Непрочитанных писем: ${unreadEmails.length}\n`);

    if (unreadEmails.length > 0) {
      console.log('📋 Список непрочитанных писем:');
      unreadEmails.forEach((email, index) => {
        console.log(`   ${index + 1}. ${email.subject}`);
        console.log(`      От: ${email.from}`);
        console.log(`      Дата: ${email.date}`);
      });
      console.log('');
    }

    console.log('✅ Все тесты пройдены успешно!');
    console.log('\n🎉 Email интеграция работает корректно для организации:', org.name);
    
    // Отключение
    emailService.disconnect();
    
  } catch (error) {
    console.error('\n❌ Ошибка при тестировании:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Запуск тестов
testOrganizationEmail();

