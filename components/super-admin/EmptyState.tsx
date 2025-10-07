import Link from 'next/link';

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel: string;
  actionHref: string;
}

export function EmptyState({ title, description, actionLabel, actionHref }: EmptyStateProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        {title}
      </p>
      {description && (
        <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
          {description}
        </p>
      )}
      <Link
        href={actionHref}
        className="inline-block px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
      >
        {actionLabel}
      </Link>
    </div>
  );
}

