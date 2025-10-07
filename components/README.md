# Структура компонентов

## Организация

Компоненты организованы по функциональным областям приложения:

```
components/
├── public/              # Компоненты для публичных страниц
├── super-admin/         # Компоненты для панели суперадмина
├── organizations/       # Компоненты для панели организаций
└── reusable/           # Переиспользуемые UI компоненты
```

## Super Admin компоненты

### StatCard
**Файл**: `components/super-admin/StatCard.tsx`

Карточка статистики для отображения метрик.

**Props**:
- `title`: string - заголовок
- `value`: string | number - значение
- `color`: 'indigo' | 'green' | 'purple' | 'blue' | 'red' - цвет
- `isLoading?`: boolean - состояние загрузки

**Использование**:
```tsx
<StatCard
  title="Всего организаций"
  value={10}
  color="indigo"
  isLoading={false}
/>
```

### OrganizationCard
**Файл**: `components/super-admin/OrganizationCard.tsx`

Карточка организации со статистикой и действиями.

**Props**:
- `organization`: объект с данными организации
- `onDelete`: (id: string) => void - обработчик удаления
- `isDeleteConfirm`: boolean - состояние подтверждения

**Использование**:
```tsx
<OrganizationCard
  organization={org}
  onDelete={handleDelete}
  isDeleteConfirm={deleteConfirm === org.id}
/>
```

### CreateOrganizationForm
**Файл**: `components/super-admin/CreateOrganizationForm.tsx`

Форма создания новой организации.

**Использование**:
```tsx
<CreateOrganizationForm />
```

### PageHeader
**Файл**: `components/super-admin/PageHeader.tsx`

Заголовок страницы с опциональной кнопкой действия.

**Props**:
- `title`: string - заголовок
- `description?`: string - описание
- `action?`: { label: string; href: string } - кнопка действия

**Использование**:
```tsx
<PageHeader
  title="Организации"
  description="Управление всеми организациями"
  action={{
    label: 'Создать',
    href: '/super-admin/organizations/create'
  }}
/>
```

### EmptyState
**Файл**: `components/super-admin/EmptyState.tsx`

Состояние пустого списка с призывом к действию.

**Props**:
- `title`: string - заголовок
- `description?`: string - описание
- `actionLabel`: string - текст кнопки
- `actionHref`: string - ссылка кнопки

**Использование**:
```tsx
<EmptyState
  title="Нет организаций"
  actionLabel="Создать первую"
  actionHref="/create"
/>
```

### LoadingSpinner
**Файл**: `components/super-admin/LoadingSpinner.tsx`

Индикатор загрузки.

**Использование**:
```tsx
{isLoading && <LoadingSpinner />}
```

### OrganizationInfo
**Файл**: `components/super-admin/OrganizationInfo.tsx`

Блок информации об организации с inline редактированием.

**Props**:
- `organization`: { id: string; name: string } - данные организации
- `onUpdate`: (name: string) => Promise<void> - обработчик обновления
- `isUpdating`: boolean - состояние загрузки
- `error?`: string - ошибка

**Использование**:
```tsx
<OrganizationInfo
  organization={org}
  onUpdate={handleUpdate}
  isUpdating={isUpdating}
  error={error}
/>
```

### AddUserForm
**Файл**: `components/super-admin/AddUserForm.tsx`

Форма добавления нового пользователя в организацию.

**Props**:
- `onSubmit`: (data) => void - обработчик отправки
- `onCancel`: () => void - обработчик отмены
- `isSubmitting`: boolean - состояние загрузки
- `error?`: string - ошибка

**Использование**:
```tsx
<AddUserForm
  onSubmit={handleAddUser}
  onCancel={() => setShow(false)}
  isSubmitting={isSubmitting}
  error={error}
/>
```

### UserCard
**Файл**: `components/super-admin/UserCard.tsx`

Карточка пользователя с inline редактированием и действиями.

**Props**:
- `user`: User - данные пользователя
- `isEditing`: boolean - режим редактирования
- `onEdit`: () => void - начать редактирование
- `onUpdate`: (data) => void - сохранить изменения
- `onCancelEdit`: () => void - отменить редактирование
- `onChangePassword`: () => void - изменить пароль
- `onDelete`: () => void - удалить пользователя
- `isUpdating`: boolean - состояние загрузки
- `error?`: string - ошибка

**Использование**:
```tsx
<UserCard
  user={user}
  isEditing={editingUser === user.id}
  onEdit={() => setEditingUser(user.id)}
  onUpdate={handleUpdate}
  onCancelEdit={() => setEditingUser(null)}
  onChangePassword={() => setChangingPassword(user.id)}
  onDelete={() => handleDelete(user.id)}
  isUpdating={isUpdating}
/>
```

### ChangePasswordForm
**Файл**: `components/super-admin/ChangePasswordForm.tsx`

Форма изменения пароля пользователя.

**Props**:
- `userName`: string - имя пользователя
- `onSubmit`: (password: string) => void - обработчик отправки
- `onCancel`: () => void - обработчик отмены
- `isSubmitting`: boolean - состояние загрузки

**Использование**:
```tsx
<ChangePasswordForm
  userName={user.name}
  onSubmit={handleChangePassword}
  onCancel={() => setChanging(null)}
  isSubmitting={isSubmitting}
/>
```

## Reusable компоненты

### Button
Универсальная кнопка с вариантами стилей и размеров.

### Input
Поле ввода с label и обработкой ошибок.

### Select
Выпадающий список с label.

### Card
Набор компонентов для создания карточек (Card, CardHeader, CardBody, CardFooter).

### Alert
Компонент уведомлений с разными типами (success, error, warning, info).

## Принципы использования

### 1. Разделение логики и представления

**❌ Плохо** - всё в page.tsx:
```tsx
export default function Page() {
  const [data, setData] = useState();
  // 200 строк JSX разметки
}
```

**✅ Хорошо** - логика в page, разметка в компонентах:
```tsx
export default function Page() {
  const { data } = useData();
  return <MyComponent data={data} />;
}
```

### 2. Prop-based компоненты

Компоненты получают данные через props, не содержат бизнес-логику:

```tsx
// Хорошо
function OrganizationCard({ organization, onDelete }) {
  return <div>...</div>;
}

// Плохо - логика внутри
function OrganizationCard({ id }) {
  const { data } = trpc.organization.getById.useQuery({ id });
  return <div>...</div>;
}
```

### 3. Композиция над наследованием

Создавайте маленькие, переиспользуемые компоненты:

```tsx
// Хорошо
<PageHeader title="..." />
<OrganizationCard organization={...} />

// Плохо - монолитный компонент
<OrganizationsPageContent ... />
```

### 4. Типизация

Всегда используйте TypeScript интерфейсы для props:

```tsx
interface MyComponentProps {
  title: string;
  isActive?: boolean;
}

export function MyComponent({ title, isActive }: MyComponentProps) {
  // ...
}
```

## Добавление новых компонентов

### Шаг 1: Определите область

Компонент специфичен для:
- **public** - публичных страниц
- **super-admin** - панели супер-админа  
- **organizations** - панели организации
- **reusable** - используется везде

### Шаг 2: Создайте компонент

```tsx
// components/super-admin/MyComponent.tsx
interface MyComponentProps {
  // props
}

export function MyComponent({ ...props }: MyComponentProps) {
  return <div>...</div>;
}
```

### Шаг 3: Экспортируйте в index.ts

```tsx
// components/super-admin/index.ts
export { MyComponent } from './MyComponent';
```

### Шаг 4: Используйте

```tsx
import { MyComponent } from '@/components/super-admin';
```

## Best Practices

✅ **DO:**
- Делайте компоненты маленькими и сфокусированными
- Используйте TypeScript для типизации
- Добавляйте адаптивность (responsive design)
- Следуйте принципу единственной ответственности
- Экспортируйте через index.ts

❌ **DON'T:**
- Не создавайте монолитные компоненты
- Не смешивайте логику API с UI
- Не дублируйте код - выносите в reusable
- Не забывайте про accessibility
- Не игнорируйте темную тему

## Примеры рефакторинга

### До:
```tsx
// app/page.tsx - 150 строк
export default function Page() {
  const [name, setName] = useState('');
  const mutation = trpc.create.useMutation();
  
  return (
    <div>
      <h1>Title</h1>
      <form>
        <input value={name} onChange={...} />
        <button>Submit</button>
      </form>
      {/* 100+ строк JSX */}
    </div>
  );
}
```

### После:
```tsx
// app/page.tsx - 10 строк
import { CreateForm } from '@/components/feature';

export default function Page() {
  return <CreateForm />;
}

// components/feature/CreateForm.tsx
export function CreateForm() {
  // логика здесь
}
```

## Поддержка

При добавлении новых компонентов обновляйте этот README с примерами использования.

