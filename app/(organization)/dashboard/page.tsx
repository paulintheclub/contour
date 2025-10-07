'use client';

import { useSession } from 'next-auth/react';
import { trpc } from '@/lib/trpc/Provider';

export default function DashboardPage() {
  const { data: session } = useSession();
  const { data: organization } = trpc.organization.getById.useQuery(
    { id: session?.user?.organizationId || '' },
    { enabled: !!session?.user?.organizationId }
  );

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Добро пожаловать, {session?.user?.name}!
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Организация: {organization?.name || 'Загрузка...'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Активные туры
          </h3>
          <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
            0
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Туров в этом месяце
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Новые заявки
          </h3>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            0
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Необработанных
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No-shows
          </h3>
          <p className="text-3xl font-bold text-red-600 dark:text-red-400">
            0
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            За последние 7 дней
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Последние заявки
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-center py-8">
            Нет новых заявок
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Предстоящие туры
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-center py-8">
            Нет запланированных туров
          </p>
        </div>
      </div>
    </div>
  );
}

