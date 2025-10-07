/**
 * Скрипт для просмотра email настроек всех организаций
 * 
 * Запуск: npx tsx server/email/list-email-configs.ts
 */

import 'dotenv/config';
import { prisma } from '@/lib/prisma';

async function listEmailConfigs() {
  console.log('📋 Email настройки организаций\n');
  console.log('=' .repeat(80));
  console.log('');

  try {
    const organizations = await prisma.organization.findMany({
      select: {
        id: true,
        name: true,
        emailEnabled: true,
        emailUser: true,
        emailHost: true,
        emailPort: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (organizations.length === 0) {
      console.log('ℹ️  Нет организаций в базе данных');
      console.log('   Создайте организацию через Super Admin панель\n');
      return;
    }

    console.log(`Всего организаций: ${organizations.length}\n`);

    organizations.forEach((org, index) => {
      console.log(`${index + 1}. ${org.name}`);
      console.log(`   ID: ${org.id}`);
      console.log(`   Email интеграция: ${org.emailEnabled ? '✅ Включена' : '❌ Отключена'}`);
      
      if (org.emailEnabled && org.emailUser) {
        console.log(`   Email: ${org.emailUser}`);
        console.log(`   IMAP: ${org.emailHost}:${org.emailPort}`);
        console.log(`   📝 Тест: npx tsx server/email/test-organization-email.ts ${org.id}`);
      } else if (!org.emailUser) {
        console.log(`   ⚠️  Email не настроен`);
      }
      
      console.log('');
    });

    // Статистика
    const enabledCount = organizations.filter(o => o.emailEnabled).length;
    const configuredCount = organizations.filter(o => o.emailEnabled && o.emailUser).length;

    console.log('=' .repeat(80));
    console.log('\n📊 Статистика:');
    console.log(`   • Организаций с включенным email: ${enabledCount}/${organizations.length}`);
    console.log(`   • Полностью настроенных: ${configuredCount}/${organizations.length}`);
    console.log('');

  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listEmailConfigs();

