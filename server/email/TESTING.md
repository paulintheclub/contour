# 🧪 Тестирование Email интеграции

## 📋 Доступные тестовые скрипты

### 1. **Просмотр email настроек** 📊

Показывает список всех организаций и их email конфигурации:

```bash
npx tsx server/email/list-email-configs.ts
```

**Результат:**
```
📋 Email настройки организаций
================================================================================

Всего организаций: 2

1. Моя туристическая компания
   ID: cm2abc123def456
   Email интеграция: ✅ Включена
   Email: bookings@mytours.com
   IMAP: imap.gmail.com:993
   📝 Тест: npx tsx server/email/test-organization-email.ts cm2abc123def456

2. Другая организация
   ID: cm2xyz789ghi012
   Email интеграция: ❌ Отключена
   
================================================================================

📊 Статистика:
   • Организаций с включенным email: 1/2
   • Полностью настроенных: 1/2
```

---

### 2. **Тест с .env** (для разработки) 🔧

Использует переменные из `.env` файла:

```bash
npx tsx server/email/test-email.ts
```

**Требуется в `.env`:**
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_HOST=imap.gmail.com
EMAIL_PORT=993
```

**Результат:**
```
🚀 Тестирование IMAP подключения...

📧 Конфигурация:
   Email: bookings@example.com
   Host: imap.gmail.com:993
   TLS: true

📡 Тест 1: Проверка подключения...
✅ IMAP подключение установлено
📬 Открыт ящик: INBOX (42 писем)
✅ Подключение успешно!

📨 Тест 2: Чтение последних 3 писем...
✅ Получено писем: 3

📧 Письмо 1:
   From: Booking.com <noreply@booking.com>
   Subject: Новое бронирование #123456
   Date: 2025-10-07T10:30:00.000Z
   Preview: Здравствуйте! У вас новое бронирование...

📬 Тест 3: Проверка непрочитанных писем...
✅ Непрочитанных писем: 2

✅ Все тесты пройдены успешно!
```

---

### 3. **Тест организации из БД** (production-ready) ✅

Использует email настройки организации из базы данных (зашифрованные):

```bash
npx tsx server/email/test-organization-email.ts <organization-id>
```

**Примеры:**

Если запустить без ID - покажет доступные организации:
```bash
npx tsx server/email/test-organization-email.ts
```

Результат:
```
❌ Укажите ID организации:

Использование: npx tsx server/email/test-organization-email.ts <organization-id>

📋 Доступные организации с включенным email:
   • Моя туристическая компания (cm2abc123def456)
     Email: bookings@mytours.com
```

С конкретным ID:
```bash
npx tsx server/email/test-organization-email.ts cm2abc123def456
```

Результат:
```
🚀 Тестирование email интеграции организации...

📌 Организация: Моя туристическая компания
📧 Email: bookings@mytours.com
🔌 Email интеграция: ✅ Включена

🔐 Получение email конфигурации из БД...
✅ Конфигурация получена
   Host: imap.gmail.com:993
   TLS: true

📡 Тест 1: Проверка подключения...
✅ Подключение успешно!

📨 Тест 2: Чтение последних 5 писем...
✅ Получено писем: 5

📧 Письмо 1:
   From: Booking.com <noreply@booking.com>
   Subject: Новое бронирование
   ...

📬 Тест 3: Проверка непрочитанных писем...
✅ Непрочитанных писем: 2

✅ Все тесты пройдены успешно!

🎉 Email интеграция работает корректно для организации: Моя туристическая компания
```

---

## 🔧 Workflow для настройки и тестирования

### **Шаг 1: Создать организацию с email**
1. Войти в Super Admin панель
2. Создать организацию или отредактировать существующую
3. Включить "Email интеграция"
4. Ввести email настройки и App Password
5. Сохранить

### **Шаг 2: Проверить настройки**
```bash
npx tsx server/email/list-email-configs.ts
```

### **Шаг 3: Протестировать подключение**
Скопировать команду из вывода предыдущего шага:
```bash
npx tsx server/email/test-organization-email.ts <organization-id>
```

---

## ❌ Типичные ошибки

### **Error: Invalid credentials**
```
❌ IMAP ошибка: Invalid credentials (Failure)
```

**Причины:**
- ❌ Неверный App Password
- ❌ App Password скопирован с пробелами
- ❌ 2FA не включена в Google
- ❌ Email не совпадает с аккаунтом

**Решение:**
1. Создайте новый App Password: https://myaccount.google.com/apppasswords
2. Скопируйте **без пробелов** (16 символов)
3. Обновите в Super Admin панели
4. Повторите тест

### **Error: No configuration found**
```
❌ Не удалось получить email конфигурацию
```

**Причины:**
- Email интеграция отключена
- Не указан email или пароль
- Пароль не расшифровывается

**Решение:**
1. Откройте организацию в Super Admin
2. Убедитесь, что чекбокс "Включить email интеграцию" включен
3. Заполните все поля (Email, Password, Host, Port)
4. Сохраните и повторите тест

### **Error: Connection timeout**
```
❌ IMAP ошибка: connect ETIMEDOUT
```

**Решение:**
- Проверьте интернет-соединение
- Проверьте firewall (разрешите порт 993)
- Убедитесь, что IMAP Host правильный

---

## 🔐 Безопасность

### ✅ Production (БД)
- Пароли автоматически **шифруются** перед сохранением
- Используется **AES-256-CBC** шифрование
- Ключ хранится в `.env` (`EMAIL_ENCRYPTION_KEY`)
- Только Super Admin видит настройки

### ⚠️ Development (.env)
- **НИКОГДА** не коммитьте `.env` в git
- Используйте **App Password**, не основной пароль Gmail
- Регулярно обновляйте App Password

---

## 📚 Что дальше?

После успешного тестирования:

1. ✅ Email интеграция настроена и работает
2. ⏭️ Создать парсеры для Booking.com, Airbnb, GetYourGuide
3. ⏭️ Автоматическая обработка букингов
4. ⏭️ Scheduler (cron) для регулярной проверки писем

---

## 🆘 Полезные команды

```bash
# Просмотр всех организаций с email
npx tsx server/email/list-email-configs.ts

# Тест с .env (разработка)
npx tsx server/email/test-email.ts

# Тест конкретной организации из БД
npx tsx server/email/test-organization-email.ts <org-id>

# Просмотр .env переменных
grep EMAIL_ .env
```

