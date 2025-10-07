'use client';

import { XMarkIcon, TrashIcon, UserPlusIcon, LockClosedIcon, LockOpenIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';

interface TourSlot {
  id: string;
  date: string;
  time: string;
  language: string;
  isPrivate: boolean;
  adults: number;
  childs: number;
  tour: {
    id: string;
    name: string;
    tourTag: string;
  };
  availableGuides: Array<{ id: string; name: string | null; email: string }>;
  assignedGuides: Array<{ id: string; name: string | null; email: string }>;
}

interface User {
  id: string;
  name: string | null;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'GUIDE';
}

interface TourSlotDetailProps {
  slot: TourSlot;
  onClose: () => void;
  onDelete: () => void;
  onTogglePrivate: () => void;
  onToggleAvailability: () => void;
  onAssignUser: (userId: string) => void;
  onUnassignUser: (userId: string) => void;
  canDelete: boolean;
  canTogglePrivate: boolean;
  canAssign: boolean;
  currentUserId: string;
  currentUserRole: 'ADMIN' | 'MANAGER' | 'GUIDE';
  allUsers?: User[];
  isTogglingAvailability?: boolean;
  isTogglingPrivate?: boolean;
  isAssigning?: boolean;
}

export function TourSlotDetail({
  slot,
  onClose,
  onDelete,
  onTogglePrivate,
  onToggleAvailability,
  onAssignUser,
  onUnassignUser,
  canDelete,
  canTogglePrivate,
  canAssign,
  currentUserId,
  currentUserRole,
  allUsers = [],
  isTogglingAvailability = false,
  isTogglingPrivate = false,
  isAssigning = false,
}: TourSlotDetailProps) {
  const [showAllUsers, setShowAllUsers] = useState(false);

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' });
  };

  const getLanguageName = (code: string) => {
    const languages: Record<string, string> = {
      RU: 'Русский',
      EN: 'English',
      DE: 'Deutsch',
      FR: 'Français',
      ES: 'Español',
    };
    return languages[code] || code;
  };

  const getRoleBadge = (role: string) => {
    const styles = {
      ADMIN: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200',
      MANAGER: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200',
      GUIDE: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
    };
    const labels = {
      ADMIN: 'Админ',
      MANAGER: 'Менеджер',
      GUIDE: 'Гид',
    };
    return (
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${styles[role as keyof typeof styles]}`}>
        {labels[role as keyof typeof labels]}
      </span>
    );
  };

  const isUserAvailable = (userId: string) => {
    return slot.availableGuides.some((guide) => guide.id === userId);
  };

  const isUserAssigned = (userId: string) => {
    return slot.assignedGuides.some((guide) => guide.id === userId);
  };

  const isCurrentUserAvailable = isUserAvailable(currentUserId);

  // Фильтруем пользователей в зависимости от роли
  const visibleUsers = allUsers.filter((user) => {
    if (currentUserRole === 'ADMIN') return true; // Админ видит всех
    if (currentUserRole === 'MANAGER') return user.role !== 'ADMIN'; // Менеджер не видит админов
    if (currentUserRole === 'GUIDE') return user.role === 'GUIDE'; // Гид видит только гидов
    return false;
  });

  return (
    <div className="fixed inset-0 bg-gray-900/20 dark:bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {slot.tour.name}
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Закрыть"
          >
            <XMarkIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Основная информация */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Дата</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {formatDate(slot.date).split(',')[0]}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Время</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{slot.time}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Язык</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {getLanguageName(slot.language)}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Участники</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {slot.adults + slot.childs}
              </p>
            </div>
          </div>

          {/* Кнопки действий для гида и админа/менеджера */}
          <div className="flex flex-wrap gap-2">
            {/* Кнопка доступности для гида */}
            {currentUserRole === 'GUIDE' && (
              <button
                onClick={onToggleAvailability}
                disabled={isTogglingAvailability}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  isCurrentUserAvailable
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {isTogglingAvailability ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current" />
                    Обновление...
                  </>
                ) : (
                  <>
                    <UserPlusIcon className="h-5 w-5" />
                    {isCurrentUserAvailable ? 'Убрать доступность' : 'Дать доступность'}
                  </>
                )}
              </button>
            )}

            {/* Кнопка Private для админа/менеджера */}
            {canTogglePrivate && (
              <button
                onClick={onTogglePrivate}
                disabled={isTogglingPrivate}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  slot.isPrivate
                    ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-900/50'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {isTogglingPrivate ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current" />
                    Обновление...
                  </>
                ) : (
                  <>
                    {slot.isPrivate ? <LockOpenIcon className="h-5 w-5" /> : <LockClosedIcon className="h-5 w-5" />}
                    {slot.isPrivate ? 'Сделать публичным' : 'Сделать приватным'}
                  </>
                )}
              </button>
            )}
          </div>

          {/* Список пользователей с доступностью (для админа/менеджера) */}
          {(currentUserRole === 'ADMIN' || currentUserRole === 'MANAGER') && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Доступность команды ({slot.availableGuides.length} / {visibleUsers.length})
                </h5>
                <button
                  onClick={() => setShowAllUsers(!showAllUsers)}
                  className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  {showAllUsers ? 'Скрыть' : 'Показать всех'}
                </button>
              </div>

              {showAllUsers && (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {visibleUsers.map((user) => {
                    const available = isUserAvailable(user.id);
                    const assigned = isUserAssigned(user.id);
                    const isCurrentUser = user.id === currentUserId;

                    return (
                      <div
                        key={user.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-colors ${
                          assigned
                            ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-800'
                            : available
                            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-800'
                            : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                          {(user.name || user.email).charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {user.name || 'Без имени'} {isCurrentUser && '(Вы)'}
                            </p>
                            {getRoleBadge(user.role)}
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{user.email}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {assigned ? (
                            <>
                              <div className="flex items-center gap-1 text-green-700 dark:text-green-300">
                                <CheckCircleIcon className="h-5 w-5" />
                                <span className="text-xs font-medium">Назначен</span>
                              </div>
                              {canAssign && (
                                <button
                                  onClick={() => onUnassignUser(user.id)}
                                  disabled={isAssigning}
                                  className="px-2 py-1 text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50 rounded transition-colors disabled:opacity-50"
                                >
                                  Убрать
                                </button>
                              )}
                            </>
                          ) : (
                            <>
                              {available ? (
                                <div className="flex items-center gap-1 text-blue-700 dark:text-blue-300">
                                  <CheckCircleIcon className="h-5 w-5" />
                                  <span className="text-xs font-medium">Доступен</span>
                                </div>
                              ) : (
                                <span className="text-xs text-gray-500 dark:text-gray-400">Недоступен</span>
                              )}
                              {canAssign && (
                                <button
                                  onClick={() => onAssignUser(user.id)}
                                  disabled={isAssigning}
                                  className="px-2 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded transition-colors disabled:opacity-50"
                                >
                                  Назначить
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {!showAllUsers && slot.availableGuides.length > 0 && (
                <div className="space-y-2">
                  {slot.availableGuides.slice(0, 3).map((guide) => {
                    const assigned = isUserAssigned(guide.id);
                    return (
                      <div
                        key={guide.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border-2 ${
                          assigned
                            ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-800'
                            : 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-800'
                        }`}
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {(guide.name || guide.email).charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {guide.name || 'Без имени'}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{guide.email}</p>
                        </div>
                        {assigned && (
                          <div className="flex items-center gap-1 text-green-700 dark:text-green-300">
                            <CheckCircleIcon className="h-5 w-5" />
                            <span className="text-xs font-medium">Назначен</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {slot.availableGuides.length > 3 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                      +{slot.availableGuides.length - 3} еще
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Назначенные гиды (для гидов) */}
          {currentUserRole === 'GUIDE' && slot.assignedGuides.length > 0 && (
            <div>
              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Назначенные гиды
              </h5>
              <div className="space-y-2">
                {slot.assignedGuides.map((guide) => (
                  <div
                    key={guide.id}
                    className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-800 rounded-lg"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {(guide.name || guide.email).charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {guide.name || 'Без имени'}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{guide.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Действия администратора */}
          {canDelete && (
            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={onDelete}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
              >
                <TrashIcon className="h-5 w-5" />
                Удалить слот
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
