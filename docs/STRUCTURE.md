# Структура проекта

## Route Groups в Next.js App Router

Проект организован с использованием [Route Groups](https://nextjs.org/docs/app/building-your-application/routing/route-groups) для логического разделения функциональных зон.

### Что такое Route Groups?

**Route Groups** - это папки, имена которых заключены в скобки `(название)`. Они позволяют организовать файлы проекта логически, **не влияя на URL структуру**.

### Структура app/

```
app/
├── layout.tsx                    # Корневой layout (провайдеры, fonts)
├── globals.css                   # Глобальные стили
│
├── (public)/                     # 🌍 ПУБЛИЧНАЯ ЗОНА
│   ├── layout.tsx                # Layout для публичных страниц
│   ├── page.tsx                  # → "/" (главная страница)
│   └── login/
│       └── page.tsx              # → "/login" (страница входа)
│
├── (super-admin)/                # 👑 ЗОНА СУПЕРАДМИНА
│   ├── layout.tsx                # Layout с навигацией суперадмина
│   ├── page.tsx                  # → "/super-admin" (главная супер-админа)
│   └── organizations/
│       ├── page.tsx              # → "/super-admin/organizations" (список)
│       ├── create/
│       │   └── page.tsx          # → "/super-admin/organizations/create"
│       └── [id]/
│           └── page.tsx          # → "/super-admin/organizations/:id"
│
├── (organization)/               # 🏢 ЗОНА ОРГАНИЗАЦИИ
│   ├── layout.tsx                # Layout с навигацией организации
│   ├── dashboard/
│   │   └── page.tsx              # → "/dashboard"
│   ├── tours/
│   │   └── page.tsx              # → "/tours"
│   ├── schedule/
│   │   └── page.tsx              # → "/schedule"
│   ├── reports/
│   │   └── page.tsx              # → "/reports"
│   ├── booking-mails/
│   │   └── page.tsx              # → "/booking-mails"
│   ├── no-shows/
│   │   └── page.tsx              # → "/no-shows"
│   ├── settings/
│   │   └── page.tsx              # → "/settings"
│   └── account/
│       └── page.tsx              # → "/account"
│
└── api/                          # 🔌 API ENDPOINTS
    ├── auth/[...nextauth]/
    │   └── route.ts              # NextAuth.js endpoint
    └── trpc/[trpc]/
        └── route.ts              # tRPC endpoint
```

## Преимущества такой структуры

### 1. Логическое разделение

- ✅ Код разделен по **функциональным зонам**
- ✅ Легко понять, где что находится
- ✅ Новый разработчик сразу поймет структуру

### 2. Shared Layouts

Каждая Route Group имеет свой layout:

- `(public)/layout.tsx` - минималистичный для публичных страниц
- `(super-admin)/layout.tsx` - с навигацией суперадмина
- `(organization)/layout.tsx` - с навигацией организации

### 3. Масштабируемость

Легко добавлять новые разделы:

```
app/
├── (organization)/
│   ├── new-feature/     # ← Просто добавляем новую папку
│   │   └── page.tsx     # → Автоматически доступно по /new-feature
```

### 4. Изоляция кода

- Компоненты публичных страниц не смешиваются с админкой
- Логика суперадмина отделена от логики организаций
- Проще рефакторить и поддерживать

## Маппинг URL → Файлы

| URL | Файл | Группа |
|-----|------|--------|
| `/` | `app/(public)/page.tsx` | Public |
| `/login` | `app/(public)/login/page.tsx` | Public |
| `/super-admin` | `app/(super-admin)/page.tsx` | Super Admin |
| `/super-admin/organizations` | `app/(super-admin)/organizations/page.tsx` | Super Admin |
| `/dashboard` | `app/(organization)/dashboard/page.tsx` | Organization |
| `/tours` | `app/(organization)/tours/page.tsx` | Organization |
| `/settings` | `app/(organization)/settings/page.tsx` | Organization |

## Layout Hierarchy

```
Root Layout (app/layout.tsx)
├── Providers (NextAuth, tRPC)
├── Fonts (Geist Sans, Geist Mono)
│
├── Public Layout (app/(public)/layout.tsx)
│   └── Pass-through (no UI)
│
├── Super Admin Layout (app/(super-admin)/layout.tsx)
│   ├── Header (logo, user email, logout)
│   └── Navigation (Главная, Организации)
│
└── Organization Layout (app/(organization)/layout.tsx)
    ├── Header (logo, user info, logout)
    └── Navigation (8 пунктов меню)
```

## Middleware и защита роутов

Middleware (`middleware.ts`) проверяет доступ:

```typescript
// Публичные (всем)
'/' ✅
'/login' ✅

// Суперадмин (только isSuperAdmin: true)
'/super-admin/*' → проверка isSuperAdmin

// Организация (только пользователи организаций)
'/dashboard/*' → проверка organizationId
'/tours/*' → проверка organizationId
... и т.д.
```

## Best Practices

### ✅ DO (Делайте)

- Используйте Route Groups для логического разделения
- Создавайте shared layout на уровне группы
- Держите компоненты специфичные для группы внутри неё
- Используйте понятные имена для групп

### ❌ DON'T (Не делайте)

- Не создавайте слишком много уровней вложенности
- Не дублируйте логику между группами (используйте shared компоненты)
- Не смешивайте публичный и приватный код в одной группе
- Не добавляйте бизнес-логику в layout файлы

## Добавление новой страницы

### В публичную зону:

```bash
# Создать файл
app/(public)/about/page.tsx

# Доступно по URL
/about
```

### В панель организации:

```bash
# Создать файл
app/(organization)/clients/page.tsx

# Доступно по URL
/clients

# Layout автоматически применится!
```

### В панель суперадмина:

```bash
# Создать файл
app/(super-admin)/analytics/page.tsx

# Доступно по URL
/super-admin/analytics
```

## Итог

Route Groups дают нам:
- 📁 **Чистую структуру** - код организован логически
- 🎨 **Shared Layouts** - переиспользуемые обёртки
- 🚀 **Быстрое развитие** - легко добавлять новые разделы
- 🛡️ **Изоляцию** - разные зоны не пересекаются
- 📖 **Читаемость** - сразу понятно, где что находится

Это современный паттерн организации Next.js приложений! 🎉

