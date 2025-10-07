'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface Tour {
  id: string;
  name: string;
  tourTag: string;
  capacity: number;
}

type RepeatType = 'none' | 'week' | 'month';

interface TourSlotFormProps {
  tours: Tour[];
  onSubmit: (data: {
    tourId: string;
    date: string;
    time: string;
    language: string;
    isPrivate: boolean;
    repeatType: RepeatType;
  }) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  error?: string;
  defaultDate?: string;
  defaultTime?: string;
}

export function TourSlotForm({
  tours,
  onSubmit,
  onCancel,
  isSubmitting,
  error,
  defaultDate,
  defaultTime,
}: TourSlotFormProps) {
  const [tourId, setTourId] = useState(tours[0]?.id || '');
  const [date, setDate] = useState(defaultDate || '');
  const [time, setTime] = useState(defaultTime || '10:00');
  const [language, setLanguage] = useState('RU');
  const [isPrivate, setIsPrivate] = useState(false);
  const [repeatType, setRepeatType] = useState<RepeatType>('none');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      tourId,
      date,
      time,
      language,
      isPrivate,
      repeatType,
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-900/20 dark:bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Создать новый слот
          </h3>
          <button
            onClick={onCancel}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Закрыть"
          >
            <XMarkIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Тур */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Тур *
            </label>
            <select
              value={tourId}
              onChange={(e) => setTourId(e.target.value)}
              required
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50"
            >
              {tours.map((tour) => (
                <option key={tour.id} value={tour.id}>
                  {tour.name} ({tour.tourTag})
                </option>
              ))}
            </select>
          </div>

          {/* Дата и время */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Дата *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Время *
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50"
              />
            </div>
          </div>

          {/* Язык и приватность */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Язык *
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                required
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50"
              >
                <option value="RU">Русский</option>
                <option value="EN">English</option>
                <option value="DE">Deutsch</option>
                <option value="FR">Français</option>
                <option value="ES">Español</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Тип тура
              </label>
              <label className="flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <input
                  type="checkbox"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  disabled={isSubmitting}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-900 dark:text-white">
                  Приватный тур
                </span>
              </label>
            </div>
          </div>

          {/* Повторение */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Повторение
            </label>
            <select
              value={repeatType}
              onChange={(e) => setRepeatType(e.target.value as RepeatType)}
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50"
            >
              <option value="none">Не повторять</option>
              <option value="week">На неделю вперед (7 дней)</option>
              <option value="month">На месяц вперед (30 дней)</option>
            </select>
            {repeatType !== 'none' && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {repeatType === 'week' 
                  ? 'Тур будет создан на следующие 7 дней'
                  : 'Тур будет создан на следующие 30 дней'}
              </p>
            )}
          </div>

          {/* Кнопки */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium rounded-lg transition-colors"
            >
              {isSubmitting ? 'Создание...' : 'Создать'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-lg transition-colors"
            >
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

