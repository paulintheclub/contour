# Архитектура аутентификации

## Обзор

Проект использует упрощенную, но надежную систему аутентификации на базе **NextAuth.js** с **JWT токенами** и **Credentials провайдером**.

## Компоненты

### 1. NextAuth.js конфигурация

**Файл**: `server/auth.ts`

```typescript
{
  providers: [CredentialsProvider], // Email + пароль
  session: { strategy: 'jwt' },     // JWT вместо database sessions
}
```

### 2. Хранение паролей

- **Алгоритм**: bcrypt
- **Раунды**: 10
- **Соль**: Генерируется автоматически для каждого пароля

```typescript
const hashedPassword = await bcrypt.hash(password, 10);
```

### 3. JWT токены

**Содержимое токена**:
```typescript
{
  id: string;              // ID пользователя
  email: string;           // Email
  isSuperAdmin: boolean;   // Флаг суперадмина
  organizationId: string?; // ID организации
  role: UserRole?;         // Роль в организации
}
```

**Хранение**: HTTP-only cookie (автоматически через NextAuth)

**Время жизни**: 30 дней (по умолчанию NextAuth)

### 4. Защита роутов

**Файл**: `middleware.ts`

Middleware проверяет:
- ✅ Наличие JWT токена
- ✅ Роль пользователя (суперадмин / пользователь организации)
- ✅ Принадлежность к организации
- ✅ Автоматическое перенаправление

**Защищенные маршруты**:
- `/super-admin/*` - только суперадминистраторы
- `/dashboard/*`, `/tours/*`, etc. - только пользователи организаций

## Почему JWT, а не Database Sessions?

### Преимущества JWT в нашем случае:

1. **Простота**
   - Не нужны таблицы Session, Account, VerificationToken
   - Меньше запросов к базе данных
   - Проще масштабирование

2. **Производительность**
   - Нет запроса к БД при каждой проверке сессии
   - Токен содержит всю нужную информацию

3. **Stateless**
   - Работает в serverless окружении
   - Легко масштабируется горизонтально
   - Не требует shared session store

4. **Достаточно для нашей задачи**
   - Один тип провайдера (Credentials)
   - Не нужна мгновенная инвалидация сессий
   - Простой flow входа/выхода

### Когда стоит переходить на Database Sessions:

- Нужна мгновенная инвалидация токенов
- Добавляется OAuth (Google, GitHub)
- Требуется отслеживание активных сессий
- Нужен функционал "выйти со всех устройств"

## Безопасность

### Что защищено:

✅ **Хранение паролей**: bcrypt с 10 раундами  
✅ **JWT токены**: Подписаны секретом (`NEXTAUTH_SECRET`)  
✅ **HTTP-only cookies**: Защита от XSS  
✅ **CSRF защита**: Автоматически через NextAuth  
✅ **Валидация входных данных**: Zod на уровне API  
✅ **Изоляция данных**: Middleware проверяет organizationId  

### Что НЕ реализовано (пока):

⚠️ Rate limiting на логин  
⚠️ Двухфакторная аутентификация (2FA)  
⚠️ История входов  
⚠️ Email верификация  
⚠️ Восстановление пароля  
⚠️ Автоматический logout после N неудачных попыток  

## Flow аутентификации

### Вход в систему

```
1. Пользователь → /login
2. Ввод email + password
3. signIn('credentials', { email, password })
4. NextAuth:
   - Проверяет данные в БД
   - Проверяет bcrypt.compare(password, hash)
   - Генерирует JWT токен
   - Сохраняет в HTTP-only cookie
5. Middleware:
   - Читает токен
   - Проверяет роль
   - Перенаправляет на нужную панель
```

### Проверка доступа

```
1. Запрос на защищенный маршрут
2. Middleware:
   - Извлекает JWT из cookie
   - Проверяет подпись токена
   - Проверяет роль и organizationId
   - Разрешает/отклоняет доступ
```

### Выход из системы

```
1. signOut({ callbackUrl: '/' })
2. NextAuth:
   - Удаляет JWT cookie
   - Перенаправляет на главную
```

## API защита (tRPC)

### Типы процедур:

```typescript
// Публичная - без проверки
publicProcedure

// Требует авторизации
protectedProcedure

// Только суперадминистраторы
superAdminProcedure

// Только администраторы организации
orgAdminProcedure
```

### Проверка в процедурах:

```typescript
protectedProcedure.use(async ({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({ ctx });
});
```

## Переменные окружения

```env
# Обязательные
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="random-32-char-string"

# Опциональные
NEXTAUTH_URL="http://localhost:3000"  # auto-detect в production
NODE_ENV="development"
```

**⚠️ Важно**: Используйте надежный `NEXTAUTH_SECRET` в production:

```bash
openssl rand -base64 32
```

## Типы TypeScript

**Файл**: `types/next-auth.d.ts`

Расширенные типы NextAuth с нашими полями:

```typescript
interface Session {
  user: {
    id: string;
    email: string;
    name?: string;
    isSuperAdmin: boolean;
    organizationId?: string;
    role?: UserRole;
  };
}
```

Это обеспечивает полную типобезопасность при работе с сессией.

## Производительность

### Запросы к БД при проверке аутентификации:

- **JWT стратегия**: 0 запросов (всё в токене)
- **Database стратегия**: 1-2 запроса на каждый запрос

### Размер JWT токена:

~200-300 байт (сжатый и подписанный)

### Кеширование:

NextAuth автоматически кеширует session на клиенте с помощью `useSession()` хука.

## Заключение

Текущая архитектура:
- ✅ Проста в поддержке
- ✅ Безопасна для production
- ✅ Производительна
- ✅ Легко масштабируется
- ✅ Достаточна для текущих требований

При необходимости можно добавить:
- OAuth провайдеры
- Database sessions
- 2FA
- Email верификацию

Но для MVP этого вполне достаточно! 🚀

