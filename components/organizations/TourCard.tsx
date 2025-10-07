'use client';

interface Tour {
  id: string;
  name: string;
  tourTag: string;
  capacity: number;
  listNames: string[];
}

interface TourCardProps {
  tour: Tour;
  isEditing: boolean;
  onEdit: () => void;
  onUpdate: (data: { name: string; tourTag: string; capacity: number; listNames: string[] }) => void;
  onCancelEdit: () => void;
  onDelete: () => void;
  isUpdating: boolean;
  error?: string;
}

export function TourCard({
  tour,
  isEditing,
  onEdit,
  onUpdate,
  onCancelEdit,
  onDelete,
  isUpdating,
  error,
}: TourCardProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const listNamesValue = formData.get('listNames') as string;
    
    onUpdate({
      name: formData.get('name') as string,
      tourTag: formData.get('tourTag') as string,
      capacity: parseInt(formData.get('capacity') as string),
      listNames: listNamesValue.split(',').map(s => s.trim()).filter(Boolean),
    });
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
                Название *
              </label>
              <input
                type="text"
                name="name"
                defaultValue={tour.name}
                required
                disabled={isUpdating}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Тег *
              </label>
              <input
                type="text"
                name="tourTag"
                defaultValue={tour.tourTag}
                required
                disabled={isUpdating}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Вместимость *
              </label>
              <input
                type="number"
                name="capacity"
                defaultValue={tour.capacity}
                required
                min="1"
                disabled={isUpdating}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Списки (через запятую) *
              </label>
              <input
                type="text"
                name="listNames"
                defaultValue={tour.listNames.join(', ')}
                required
                disabled={isUpdating}
                placeholder="Список 1, Список 2"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm disabled:opacity-50"
              />
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
            <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
              {tour.name}
            </h3>
            <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-xs font-medium rounded-full">
              {tour.tourTag}
            </span>
          </div>
          <div className="space-y-1 text-sm">
            <p className="text-gray-600 dark:text-gray-400">
              <span className="font-medium">Вместимость:</span> {tour.capacity} чел.
            </p>
            <div className="text-gray-600 dark:text-gray-400">
              <span className="font-medium">Списки:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {tour.listNames.map((name, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={onEdit}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
          >
            Редактировать
          </button>
          <button
            onClick={onDelete}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
          >
            Удалить
          </button>
        </div>
      </div>
    </div>
  );
}

