# 📧 Email Integration System

Система автоматической обработки бронирований через email для Contour App.

## 📂 Структура

```
server/email/
├── services/
│   └── EmailService.ts        # IMAP клиент для чтения писем
├── utils/
│   ├── encryption.ts          # Шифрование/расшифровка паролей
│   └── getOrganizationEmailConfig.ts  # Получение настроек из БД
├── types/
│   └── email.types.ts         # TypeScript типы
├── test-email.ts              # Тест с .env (разработка)
├── test-organization-email.ts # Тест организации из БД (production)
├── list-email-configs.ts      # Просмотр настроек всех организаций
├── EMAIL_SETUP.md             # Инструкция по настройке Gmail App Password
├── TESTING.md                 # Инструкция по тестированию
└── README.md                  # Этот файл
```

## 🚀 Быстрый старт

### 1. Настроить организацию

**Через Super Admin панель:**
1. Войти: `/super-admin`
2. Создать или редактировать организацию
3. Включить "Email интеграция"
4. Ввести Gmail App Password ([как получить](./EMAIL_SETUP.md))
5. Сохранить

### 2. Протестировать

**Просмотреть настройки:**
```bash
npx tsx server/email/list-email-configs.ts
```

**Протестировать подключение:**
```bash
npx tsx server/email/test-organization-email.ts <organization-id>
```

Подробнее: [TESTING.md](./TESTING.md)

## 🔧 API

### EmailService

```typescript
import { EmailService } from '@/server/email/services/EmailService';
import { getOrganizationEmailConfig } from '@/server/email/utils/getOrganizationEmailConfig';

// Получить конфигурацию организации из БД
const config = await getOrganizationEmailConfig(organizationId);

if (config) {
  // Создать сервис
  const emailService = new EmailService(config);
  
  // Подключиться
  await emailService.connect();
  
  // Получить непрочитанные письма
  const emails = await emailService.fetchUnreadEmails(10);
  
  // Обработать письма
  for (const email of emails) {
    console.log(email.subject, email.from);
    // ... парсинг и создание букинга
    
    // Пометить как прочитанное
    await emailService.markAsRead(email.messageId);
  }
  
  // Отключиться
  emailService.disconnect();
}
```

### Encryption Utils

```typescript
import { encryptPassword, decryptPassword } from '@/server/email/utils/encryption';

// Шифрование (для сохранения в БД)
const encrypted = encryptPassword('my-app-password');

// Расшифровка (для использования)
const decrypted = decryptPassword(encrypted);
```

### Get Organization Config

```typescript
import { getOrganizationEmailConfig } from '@/server/email/utils/getOrganizationEmailConfig';

const config = await getOrganizationEmailConfig('org-id');
// → { user, password, host, port, tls } или null
```

## 🔐 Безопасность

- ✅ Пароли **шифруются** перед сохранением (AES-256-CBC)
- ✅ Ключ шифрования в `.env` (`EMAIL_ENCRYPTION_KEY`)
- ✅ Только Super Admin может настраивать email
- ✅ Каждая организация изолирована
- ✅ Используются Gmail App Passwords (не основной пароль)

## 📋 Требования

**Обязательно в `.env`:**
```env
# Ключ шифрования (автоматически генерируется)
EMAIL_ENCRYPTION_KEY=your-32-char-encryption-key
```

**Для тестирования (опционально):**
```env
EMAIL_USER=test@gmail.com
EMAIL_PASSWORD=app-password
EMAIL_HOST=imap.gmail.com
EMAIL_PORT=993
```

## 🛠️ Разработка

### Структура базы данных

```prisma
model Organization {
  emailUser     String?  // Email адрес
  emailPassword String?  // Зашифрованный пароль
  emailHost     String?  @default("imap.gmail.com")
  emailPort     Int?     @default(993)
  emailEnabled  Boolean  @default(false)
}
```

### Тестовые команды

```bash
# Список организаций
npm run email:list

# Тест организации
npm run email:test <org-id>

# Тест с .env
npm run email:test-dev
```

_(Добавить в package.json):_
```json
{
  "scripts": {
    "email:list": "tsx server/email/list-email-configs.ts",
    "email:test": "tsx server/email/test-organization-email.ts",
    "email:test-dev": "tsx server/email/test-email.ts"
  }
}
```

## 📚 Документация

- [EMAIL_SETUP.md](./EMAIL_SETUP.md) - Настройка Gmail App Password
- [TESTING.md](./TESTING.md) - Инструкции по тестированию

## 🔄 Roadmap

- [x] IMAP подключение
- [x] Шифрование паролей
- [x] UI для настройки
- [x] Тестовые скрипты
- [ ] Парсеры (Booking.com, Airbnb, GetYourGuide)
- [ ] Автоматическая обработка букингов
- [ ] Email scheduler (cron)
- [ ] Уведомления об ошибках

## 🆘 Помощь

**Не работает подключение?**
→ См. [TESTING.md](./TESTING.md)

**Как получить App Password?**
→ См. [EMAIL_SETUP.md](./EMAIL_SETUP.md)

**Нужна помощь с настройкой?**
→ Проверьте `list-email-configs.ts` и `test-organization-email.ts`

