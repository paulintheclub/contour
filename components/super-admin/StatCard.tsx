interface StatCardProps {
  title: string;
  value: string | number;
  color: 'indigo' | 'green' | 'purple' | 'blue' | 'red';
  isLoading?: boolean;
}

export function StatCard({ title, value, color, isLoading }: StatCardProps) {
  const colors = {
    indigo: 'text-indigo-600 dark:text-indigo-400',
    green: 'text-green-600 dark:text-green-400',
    purple: 'text-purple-600 dark:text-purple-400',
    blue: 'text-blue-600 dark:text-blue-400',
    red: 'text-red-600 dark:text-red-400',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className={`text-3xl font-bold ${colors[color]}`}>
        {isLoading ? '...' : value}
      </p>
    </div>
  );
}

