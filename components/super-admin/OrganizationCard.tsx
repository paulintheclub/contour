import Link from 'next/link';

interface OrganizationCardProps {
  organization: {
    id: string;
    name: string;
    _count: {
      users: number;
      tours: number;
    };
  };
  onDelete: (id: string) => void;
  isDeleteConfirm: boolean;
}

export function OrganizationCard({ organization, onDelete, isDeleteConfirm }: OrganizationCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
            {organization.name}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-500 truncate">
            ID: {organization.id}
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Link
            href={`/super-admin/organizations/${organization.id}`}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
          >
            Управление
          </Link>
          <button
            onClick={() => onDelete(organization.id)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              isDeleteConfirm
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
            }`}
          >
            {isDeleteConfirm ? 'Подтвердить?' : 'Удалить'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Пользователей
          </p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">
            {organization._count.users}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Туров</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">
            {organization._count.tours}
          </p>
        </div>
      </div>
    </div>
  );
}

