'use client';

interface User {
  id: string;
  email: string;
  name: string | null;
  role: 'ADMIN' | 'MANAGER' | 'GUIDE';
}

interface UserManagementCardProps {
  user: User;
  isEditing: boolean;
  onEdit: () => void;
  onUpdate: (data: { name: string; role: 'ADMIN' | 'MANAGER' | 'GUIDE' }) => void;
  onCancelEdit: () => void;
  onDelete: () => void;
  isUpdating: boolean;
  error?: string;
  currentUserId: string;
  currentUserRole: 'ADMIN' | 'MANAGER' | 'GUIDE';
}

export function UserManagementCard({
  user,
  isEditing,
  onEdit,
  onUpdate,
  onCancelEdit,
  onDelete,
  isUpdating,
  error,
  currentUserId,
  currentUserRole,
}: UserManagementCardProps) {
  const isCurrentUser = user.id === currentUserId;

  // Определяем права доступа
  const canEdit = (() => {
    if (currentUserRole === 'ADMIN') {
      // Админ может редактировать всех (включая себя)
      return true;
    }
    // Менеджер и Гид могут редактировать только себя
    return isCurrentUser;
  })();

  const canDelete = (() => {
    if (isCurrentUser) {
      // Никто не может удалить себя
      return false;
    }
    if (currentUserRole === 'ADMIN') {
      // Админ может удалять всех (кроме себя)
      return true;
    }
    // Менеджер и Гид не могут удалять других
    return false;
  })();
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    onUpdate({
      name: formData.get('name') as string,
      role: formData.get('role') as 'ADMIN' | 'MANAGER' | 'GUIDE',
    });
  };

  const getRoleBadge = (role: string) => {
    const styles = {
      ADMIN: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200',
      MANAGER: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
      GUIDE: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
    };
    const labels = {
      ADMIN: 'Администратор',
      MANAGER: 'Менеджер',
      GUIDE: 'Гид',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[role as keyof typeof styles]}`}>
        {labels[role as keyof typeof labels]}
      </span>
    );
  };

  if (isEditing) {
    return (
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Имя
              </label>
              <input
                type="text"
                name="name"
                defaultValue={user.name || ''}
                disabled={isUpdating}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Роль
              </label>
              <select
                name="role"
                defaultValue={user.role}
                disabled={isUpdating || currentUserRole !== 'ADMIN'}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm disabled:opacity-50"
              >
                <option value="ADMIN">Администратор</option>
                <option value="MANAGER">Менеджер</option>
                <option value="GUIDE">Гид</option>
              </select>
              {currentUserRole !== 'ADMIN' && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Только администраторы могут изменять роли
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={isUpdating}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {isUpdating ? 'Сохранение...' : 'Сохранить'}
            </button>
            <button
              type="button"
              onClick={onCancelEdit}
              disabled={isUpdating}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white text-sm font-medium rounded-lg transition-colors"
            >
              Отмена
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <p className="font-medium text-gray-900 dark:text-white">
              {user.name || 'Без имени'}
            </p>
            {getRoleBadge(user.role)}
            {isCurrentUser && (
              <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded">
                Вы
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 break-all">{user.email}</p>
        </div>
        {(canEdit || canDelete) && (
          <div className="flex flex-wrap gap-2">
            {canEdit && (
              <button
                onClick={onEdit}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
              >
                Редактировать
              </button>
            )}
            {canDelete && !isCurrentUser && (
              <button
                onClick={onDelete}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
              >
                Удалить
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

