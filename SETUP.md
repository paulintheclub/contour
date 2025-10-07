# Инструкция по первому запуску

## ⚠️ Важно!

Перед запуском проекта необходимо настроить базу данных PostgreSQL.

## Шаг 1: Создайте базу данных PostgreSQL

### Вариант 1: Через командную строку
```bash
createdb contour
```

### Вариант 2: Через psql
```bash
psql -U postgres
```
```sql
CREATE DATABASE contour;
\q
```

### Вариант 3: Используйте Docker
```bash
docker run --name contour-postgres \
  -e POSTGRES_PASSWORD=yourpassword \
  -e POSTGRES_DB=contour \
  -p 5432:5432 \
  -d postgres:16
```

## Шаг 2: Настройте .env файл

Откройте файл `.env` и обновите строку подключения к базе данных:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/contour?schema=public"
```

**Замените:**
- `username` - ваше имя пользователя PostgreSQL (обычно `postgres`)
- `password` - ваш пароль
- `localhost:5432` - хост и порт (если база на другом сервере)

**Также обновите NEXTAUTH_SECRET:**

Сгенерируйте случайный секрет:
```bash
openssl rand -base64 32
```

И вставьте результат в `.env`:
```env
NEXTAUTH_SECRET="ваш_сгенерированный_секрет"
```

## Шаг 3: Примените схему базы данных

```bash
npm run db:push
```

Эта команда создаст все необходимые таблицы в базе данных.

## Шаг 4: Заполните базу тестовыми данными

```bash
npm run db:seed
```

Это создаст:
- ✅ Суперадминистратора (admin@contour.com / admin123)
- ✅ Тестовую организацию
- ✅ Пользователей с разными ролями
- ✅ Несколько тестовых туров

## Шаг 5: Запустите проект

```bash
npm run dev
```

Откройте в браузере: http://localhost:3000

## 🔐 Тестовые аккаунты

### Суперадминистратор
- Email: `admin@contour.com`
- Пароль: `admin123`
- Страница: http://localhost:3000/login → перенаправит на `/super-admin`

### Администратор организации
- Email: `org-admin@test.com`
- Пароль: `admin123`
- Страница: http://localhost:3000/login → перенаправит на `/dashboard`

### Менеджер
- Email: `manager@test.com`
- Пароль: `manager123`

### Гид
- Email: `guide@test.com`
- Пароль: `guide123`

## 🎯 Что дальше?

1. **Войдите как суперадмин** и создайте свою организацию
2. **Добавьте пользователей** в организацию
3. **Войдите как администратор организации** и изучите панель управления

## 🐛 Возможные проблемы

### Ошибка подключения к базе данных
```
Error: Can't reach database server
```
**Решение**: Убедитесь, что PostgreSQL запущен и доступен по указанному адресу.

### Ошибка при миграции
```
Error: relation already exists
```
**Решение**: База уже содержит таблицы. Можно удалить базу и создать заново, или использовать `prisma migrate reset`.

### Ошибка при seed
```
Error: Unique constraint failed
```
**Решение**: Seed уже был выполнен. Пользователи уже существуют в базе.

## 📚 Дополнительно

### Prisma Studio
Визуальный редактор базы данных:
```bash
npm run db:studio
```

### Очистка и повторный seed
```bash
npm run db:push -- --force-reset
npm run db:seed
```

**⚠️ Внимание**: Это удалит все данные из базы!

## ✅ Готово!

Теперь вы можете начать работу с проектом. Удачи! 🚀

