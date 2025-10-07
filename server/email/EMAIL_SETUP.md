# 📧 Настройка Email IMAP для организаций

## 🎯 Архитектура

В Contour App каждая организация имеет свои **собственные email настройки**, которые хранятся в базе данных в **зашифрованном** виде.

### 🔒 Безопасность
- Пароли шифруются с помощью AES-256-CBC перед сохранением
- Ключ шифрования хранится в `.env` (`EMAIL_ENCRYPTION_KEY`)
- Только Super Admin может настраивать email для организаций

---

## 📋 Настройка для организации (Super Admin)

### **Шаг 1: Получить Gmail App Password**

1. Включить 2FA: https://myaccount.google.com/security
2. Создать App Password: https://myaccount.google.com/apppasswords
   - Выбрать: "Mail" → "Other (Custom name)"
   - Ввести: "Contour Tours - [Название организации]"
   - Нажать "Generate"
3. **Скопировать 16-значный пароль** (без пробелов)

### **Шаг 2: Настроить в Super Admin панели**

1. Войти в **Super Admin** панель
2. Создать или отредактировать организацию
3. В разделе **"Email интеграция"**:
   - ✅ Включить чекбокс "Включить email интеграцию"
   - 📧 Email: `bookings@example.com`
   - 🔑 App Password: `abcdefghijklmnop` (16 символов)
   - 🌐 IMAP Host: `imap.gmail.com`
   - 🔌 Port: `993`
4. Нажать **"Сохранить"**

✅ Пароль автоматически зашифруется перед сохранением в БД!

---

## 🧪 Тестирование (для разработки)

### **Использование тестового скрипта**

Для тестирования IMAP подключения используйте переменные в `.env`:

```env
# Email Configuration for IMAP Testing (DEV only)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop  # 16-значный App Password (без пробелов)
EMAIL_HOST=imap.gmail.com
EMAIL_PORT=993
EMAIL_TLS=true

# Email Encryption Key (auto-generated)
EMAIL_ENCRYPTION_KEY=your-32-char-encryption-key
```

### **Запустить тест**

```bash
npx tsx server/email/test-email.ts
```

### **Ожидаемый результат**

```
✅ IMAP подключение установлено
📬 Открыт ящик: INBOX (42 писем)
📨 Получено писем: 3

--- Email ID: <...> ---
From: Booking.com <noreply@booking.com>
Subject: Новое бронирование #123456
Date: 2025-10-07T10:30:00.000Z
```

---

## 🔧 Другие почтовые сервисы

### **Outlook/Office 365**
```
Email: your-email@outlook.com
Password: App Password
Host: outlook.office365.com
Port: 993
```

### **Yahoo Mail**
```
Email: your-email@yahoo.com
Password: App Password
Host: imap.mail.yahoo.com
Port: 993
```

### **Custom Domain (cPanel/Plesk)**
```
Email: info@yourdomain.com
Password: Email password
Host: mail.yourdomain.com (или imap.yourdomain.com)
Port: 993
```

---

## ❌ Типичные ошибки

### **Error: Invalid credentials**
```
❌ IMAP ошибка: Invalid credentials (Failure)
```
**Решение:**
- ✅ Проверьте App Password (16 символов **без пробелов**)
- ✅ Убедитесь, что 2FA включена в Google
- ✅ Проверьте EMAIL_USER (должен быть полный email)

### **Error: Connection timeout**
```
❌ IMAP ошибка: connect ETIMEDOUT
```
**Решение:**
- ✅ Проверьте интернет-соединение
- ✅ Проверьте firewall (разрешите порт 993)
- ✅ Попробуйте другой IMAP хост

### **Error: Too many connections**
```
❌ IMAP ошибка: [ALERT] Too many simultaneous connections
```
**Решение:**
- ✅ Закройте другие почтовые клиенты
- ✅ Подождите 1-2 минуты

---

## 🔐 Безопасность

### **Production (в БД)**
- ✅ Пароли автоматически шифруются (AES-256-CBC)
- ✅ Только Super Admin видит настройки
- ✅ Каждая организация изолирована

### **Development (.env)**
- ❌ **НИКОГДА** не коммитьте `.env` в git
- ✅ Используйте App Password, не основной пароль
- ✅ Храните пароли в менеджере (1Password, Bitwarden)
- ✅ Регулярно обновляйте App Password

---

## 🚀 Следующие шаги

После настройки email для организации:

1. ✅ Email настроен и зашифрован в БД
2. ⏭️ Создать парсеры для Booking.com, Airbnb, GetYourGuide
3. ⏭️ Автоматическая обработка букингов
4. ⏭️ Scheduler для регулярной проверки писем (cron)

---

## 📚 Полезные ссылки

- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)
- [IMAP настройки Gmail](https://support.google.com/mail/answer/7126229)
- [Outlook IMAP](https://support.microsoft.com/en-us/office/pop-imap-and-smtp-settings-8361e398-8af4-4e97-b147-6c6c4ac95353)

---

## 🏗️ Архитектура Email Service

```
Organization (DB)
├── emailUser: "bookings@example.com"
├── emailPassword: "encrypted_password_here" 🔒
├── emailHost: "imap.gmail.com"
├── emailPort: 993
└── emailEnabled: true

EmailService
├── connect(organizationConfig) → IMAP connection
├── fetchEmails() → ParsedEmail[]
├── markAsRead(messageId)
└── disconnect()

EmailProcessor
├── detectSource(email) → BOOKING_COM | AIRBNB | ...
├── detectActionType(email) → CREATE | UPDATE | CANCEL
├── parseBookingData(email) → BookingData
└── processEmail() → Create/Update Booking in DB
```
