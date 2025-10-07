# ⚡ Email Integration - Быстрый старт

## 🎯 Что это?

Система автоматической обработки бронирований через email. Каждая организация имеет свои email настройки, хранящиеся в зашифрованном виде в БД.

---

## 🚀 Как протестировать за 3 шага

### **Шаг 1: Просмотр настроек** 📋

```bash
npm run email:list
```

**Результат:**
```
📋 Email настройки организаций
================================================================================

1. Моя туристическая компания
   ID: cm2abc123def456
   Email интеграция: ✅ Включена
   Email: bookings@mytours.com
   📝 Тест: npm run email:test cm2abc123def456
```

---

### **Шаг 2: Протестировать организацию** ✅

Скопируйте ID из предыдущего шага:

```bash
npm run email:test test-org-id
```

**Результат:**
```
✅ Подключение успешно!
📨 Получено писем: 5
✅ Непрочитанных писем: 2
🎉 Email интеграция работает!
```

---

### **Шаг 3: Тест с .env (разработка)** 🔧

```bash
npm run email:test-dev
```

Использует переменные из `.env`:
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

---

## 📦 Доступные команды

| Команда | Описание |
|---------|----------|
| `npm run email:list` | Показать все организации и их email настройки |
| `npm run email:test <org-id>` | Протестировать email организации из БД |
| `npm run email:test-dev` | Тест с переменными из .env (разработка) |

---

## 🔧 Настройка новой организации

### **1. Получить Gmail App Password**

1. Включить 2FA: https://myaccount.google.com/security
2. Создать App Password: https://myaccount.google.com/apppasswords
   - Выбрать: **Mail** → **Other (Custom name)**
   - Ввести: **Contour Tours**
3. **Скопировать 16 символов** (без пробелов)

### **2. Настроить в Super Admin**

1. Войти: `/super-admin`
2. Создать или редактировать организацию
3. В секции **"Email интеграция"**:
   - ✅ Включить чекбокс
   - 📧 Email: `bookings@example.com`
   - 🔑 App Password: `abcdefghijklmnop`
   - 🌐 IMAP Host: `imap.gmail.com`
   - 🔌 Port: `993`
4. Нажать **Сохранить**

✅ Пароль автоматически зашифруется!

### **3. Протестировать**

```bash
npm run email:list
npm run email:test <organization-id>
```

---

## ❌ Что делать при ошибках?

### **Invalid credentials**
```
❌ IMAP ошибка: Invalid credentials
```

**Решение:**
1. Создайте новый App Password
2. Скопируйте **БЕЗ пробелов** (16 символов)
3. Обновите в Super Admin
4. Повторите тест

### **No configuration found**
```
❌ Не удалось получить email конфигурацию
```

**Решение:**
1. Откройте организацию в Super Admin
2. Убедитесь, что чекбокс "Включить email интеграцию" ✅
3. Заполните все поля
4. Сохраните

### **Connection timeout**
```
❌ IMAP ошибка: connect ETIMEDOUT
```

**Решение:**
- Проверьте интернет
- Разрешите порт 993 в firewall
- Проверьте IMAP Host

---

## 📚 Дополнительная документация

- [EMAIL_SETUP.md](./EMAIL_SETUP.md) - Как получить Gmail App Password
- [TESTING.md](./TESTING.md) - Детальное тестирование
- [README.md](./README.md) - API и архитектура

---

## 🔥 Примеры использования

### В коде (tRPC/API):

```typescript
import { getOrganizationEmailConfig } from '@/server/email/utils/getOrganizationEmailConfig';
import { EmailService } from '@/server/email/services/EmailService';

// Получить конфигурацию организации
const config = await getOrganizationEmailConfig(organizationId);

if (config) {
  const emailService = new EmailService(config);
  await emailService.connect();
  
  // Получить непрочитанные письма
  const emails = await emailService.fetchUnreadEmails(10);
  
  for (const email of emails) {
    console.log('Новое письмо:', email.subject);
    // ... парсинг и создание букинга
    
    await emailService.markAsRead(email.messageId);
  }
  
  emailService.disconnect();
}
```

---

## ✅ Checklist для production

- [ ] Создана организация в Super Admin
- [ ] Получен Gmail App Password
- [ ] Email интеграция включена
- [ ] Все поля заполнены и сохранены
- [ ] Тест пройден: `npm run email:test <org-id>`
- [ ] Email получает письма от Booking.com/Airbnb
- [ ] Готово к внедрению парсеров!

---

## 🆘 Нужна помощь?

**Проблемы с настройкой?**
→ См. [EMAIL_SETUP.md](./EMAIL_SETUP.md)

**Ошибки при тестировании?**
→ См. [TESTING.md](./TESTING.md)

**Вопросы по архитектуре?**
→ См. [README.md](./README.md)

