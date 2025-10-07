'use client';

import { useSession } from 'next-auth/react';

export default function AccountPage() {
  const { data: session } = useSession();

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Мой аккаунт
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Личная информация и настройки профиля
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Информация о профиле
        </h3>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Имя</p>
            <p className="text-gray-900 dark:text-white font-medium">
              {session?.user?.name}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
            <p className="text-gray-900 dark:text-white font-medium">
              {session?.user?.email}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Роль</p>
            <p className="text-gray-900 dark:text-white font-medium">
              {session?.user?.role === 'ADMIN'
                ? 'Администратор'
                : session?.user?.role === 'MANAGER'
                ? 'Менеджер'
                : 'Гид'}
            </p>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Возможность изменения пароля и другие настройки будут добавлены позже
          </p>
        </div>
      </div>
    </div>
  );
}

