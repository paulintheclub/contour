import { PrismaClient } from '../app/generated/prisma';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Начинаем сид базы данных...');

  // Создаем суперадминистратора
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@contour.com' },
    update: {},
    create: {
      email: 'admin@contour.com',
      name: 'Супер Администратор',
      password: hashedPassword,
      isSuperAdmin: true,
    },
  });

  console.log('✅ Создан суперадминистратор:', superAdmin.email);

  // Создаем тестовую организацию
  const testOrg = await prisma.organization.upsert({
    where: { id: 'test-org-id' },
    update: {},
    create: {
      id: 'test-org-id',
      name: 'Тестовая организация',
    },
  });

  console.log('✅ Создана тестовая организация:', testOrg.name);

  // Создаем администратора организации
  const orgAdminPassword = await bcrypt.hash('admin123', 10);
  const orgAdmin = await prisma.user.upsert({
    where: { email: 'org-admin@test.com' },
    update: {},
    create: {
      email: 'org-admin@test.com',
      name: 'Админ Организации',
      password: orgAdminPassword,
      organizationId: testOrg.id,
      role: 'ADMIN',
    },
  });

  console.log('✅ Создан администратор организации:', orgAdmin.email);

  // Создаем менеджера
  const managerPassword = await bcrypt.hash('manager123', 10);
  const manager = await prisma.user.upsert({
    where: { email: 'manager@test.com' },
    update: {},
    create: {
      email: 'manager@test.com',
      name: 'Менеджер Тестовый',
      password: managerPassword,
      organizationId: testOrg.id,
      role: 'MANAGER',
    },
  });

  console.log('✅ Создан менеджер:', manager.email);

  // Создаем гида
  const guidePassword = await bcrypt.hash('guide123', 10);
  const guide = await prisma.user.upsert({
    where: { email: 'guide@test.com' },
    update: {},
    create: {
      email: 'guide@test.com',
      name: 'Гид Тестовый',
      password: guidePassword,
      organizationId: testOrg.id,
      role: 'GUIDE',
    },
  });

  console.log('✅ Создан гид:', guide.email);

  // Создаем пару тестовых туров
  const tour1 = await prisma.tour.create({
    data: {
      name: 'Экскурсия по Старому городу',
      capacity: 15,
      tourTag: 'old-city-tour',
      listNames: ['Основной список', 'VIP список'],
      organizationId: testOrg.id,
    },
  });

  const tour2 = await prisma.tour.create({
    data: {
      name: 'Вечерний тур на катере',
      capacity: 20,
      tourTag: 'evening-boat-tour',
      listNames: ['Стандарт', 'Премиум', 'Семейный'],
      organizationId: testOrg.id,
    },
  });

  console.log('✅ Созданы тестовые туры:', tour1.name, 'и', tour2.name);

  // Создаем тестовые слоты для туров
  const slot1 = await prisma.tourSlot.create({
    data: {
      tourId: tour1.id,
      date: '2025-10-15',
      time: '10:00',
      language: 'RU',
      isPrivate: false,
      adults: 2,
      childs: 0,
      availableGuides: {
        connect: [{ id: guide.id }],
      },
      assignedGuides: {
        connect: [{ id: guide.id }],
      },
    },
  });

  const slot2 = await prisma.tourSlot.create({
    data: {
      tourId: tour1.id,
      date: '2025-10-15',
      time: '14:00',
      language: 'EN',
      isPrivate: false,
      adults: 4,
      childs: 2,
      availableGuides: {
        connect: [{ id: guide.id }],
      },
    },
  });

  const slot3 = await prisma.tourSlot.create({
    data: {
      tourId: tour2.id,
      date: '2025-10-16',
      time: '18:00',
      language: 'RU',
      isPrivate: true,
      adults: 6,
      childs: 0,
      availableGuides: {
        connect: [{ id: guide.id }],
      },
      assignedGuides: {
        connect: [{ id: guide.id }],
      },
    },
  });

  console.log('✅ Созданы тестовые слоты туров:', slot1.date, slot2.date, slot3.date);

  console.log('\n🎉 Сид базы данных завершён!');
  console.log('\n📝 Тестовые учетные данные:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Суперадминистратор:');
  console.log('  Email: admin@contour.com');
  console.log('  Пароль: admin123');
  console.log('\nАдминистратор организации:');
  console.log('  Email: org-admin@test.com');
  console.log('  Пароль: admin123');
  console.log('\nМенеджер:');
  console.log('  Email: manager@test.com');
  console.log('  Пароль: manager123');
  console.log('\nГид:');
  console.log('  Email: guide@test.com');
  console.log('  Пароль: guide123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch((e) => {
    console.error('❌ Ошибка при сиде базы данных:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

