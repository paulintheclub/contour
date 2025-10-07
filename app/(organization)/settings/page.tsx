'use client';

import { useSession } from 'next-auth/react';
import { trpc } from '@/lib/trpc/Provider';
import { useState } from 'react';
import { TourCard, AddTourForm, UserManagementCard, AddUserForm } from '@/components/organizations';
import { Tabs, Tab } from '@/components/reusable';

export default function SettingsPage() {
  const { data: session } = useSession();
  const organizationId = (session?.user as any)?.organizationId || '';
  
  const { data: organization } = trpc.organization.getById.useQuery(
    { id: organizationId },
    { enabled: !!organizationId }
  );
  
  const { data: tours } = trpc.tour.getByOrganization.useQuery(
    { organizationId },
    { enabled: !!organizationId }
  );

  const { data: users } = trpc.user.getByOrganization.useQuery(
    { organizationId },
    { enabled: !!organizationId }
  );

  const utils = trpc.useUtils();

  // Состояния для туров
  const [showAddTour, setShowAddTour] = useState(false);
  const [editingTour, setEditingTour] = useState<string | null>(null);
  const [tourError, setTourError] = useState('');

  // Состояния для пользователей
  const [showAddUser, setShowAddUser] = useState(false);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [userError, setUserError] = useState('');

  const userRole = (session?.user as any)?.role as 'ADMIN' | 'MANAGER' | 'GUIDE' | undefined;
  const canManageTours = userRole === 'ADMIN' || userRole === 'MANAGER';
  const canAddUsers = userRole === 'ADMIN';

  const createTourMutation = trpc.tour.create.useMutation({
    onSuccess: () => {
      utils.tour.getByOrganization.invalidate({ organizationId });
      setShowAddTour(false);
      setTourError('');
    },
    onError: (error) => {
      setTourError(error.message);
    },
  });

  const updateTourMutation = trpc.tour.update.useMutation({
    onSuccess: () => {
      utils.tour.getByOrganization.invalidate({ organizationId });
      setEditingTour(null);
      setTourError('');
    },
    onError: (error) => {
      setTourError(error.message);
    },
  });

  const deleteTourMutation = trpc.tour.delete.useMutation({
    onSuccess: () => {
      utils.tour.getByOrganization.invalidate({ organizationId });
    },
  });

  const createUserMutation = trpc.user.create.useMutation({
    onSuccess: () => {
      utils.user.getByOrganization.invalidate({ organizationId });
      setShowAddUser(false);
      setUserError('');
    },
    onError: (error) => {
      setUserError(error.message);
    },
  });

  const updateUserMutation = trpc.user.update.useMutation({
    onSuccess: () => {
      utils.user.getByOrganization.invalidate({ organizationId });
      setEditingUser(null);
      setUserError('');
    },
    onError: (error) => {
      setUserError(error.message);
    },
  });

  const deleteUserMutation = trpc.user.delete.useMutation({
    onSuccess: () => {
      utils.user.getByOrganization.invalidate({ organizationId });
    },
  });

  const handleAddTour = (data: {
    name: string;
    tourTag: string;
    capacity: number;
    listNames: string[];
  }) => {
    setTourError('');
    createTourMutation.mutate({
      ...data,
      organizationId,
    });
  };

  const handleUpdateTour = (data: {
    name: string;
    tourTag: string;
    capacity: number;
    listNames: string[];
  }) => {
    if (!editingTour) return;
    setTourError('');
    updateTourMutation.mutate({
      id: editingTour,
      ...data,
    });
  };

  const handleDeleteTour = (tourId: string) => {
    if (confirm('Вы уверены, что хотите удалить этот тур?')) {
      deleteTourMutation.mutate({ id: tourId });
    }
  };

  const handleAddUser = (data: {
    email: string;
    name: string;
    password: string;
    role: 'ADMIN' | 'MANAGER' | 'GUIDE';
  }) => {
    setUserError('');
    createUserMutation.mutate({
      ...data,
      organizationId,
    });
  };

  const handleUpdateUser = (data: {
    name: string;
    role: 'ADMIN' | 'MANAGER' | 'GUIDE';
  }) => {
    if (!editingUser) return;
    setUserError('');
    updateUserMutation.mutate({
      id: editingUser,
      ...data,
    });
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('Вы уверены, что хотите удалить этого пользователя?')) {
      deleteUserMutation.mutate({ id: userId });
    }
  };

  const tabs: Tab[] = [
    {
      id: 'tours',
      label: 'Туры организации',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      ),
      content: (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                Управление турами
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Создавайте, редактируйте и удаляйте туры вашей организации
              </p>
            </div>
            {canManageTours && (
              <button
                onClick={() => {
                  setShowAddTour(!showAddTour);
                  setTourError('');
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors whitespace-nowrap"
              >
                {showAddTour ? 'Отмена' : 'Добавить тур'}
              </button>
            )}
          </div>

          {!canManageTours && (
            <div className="mb-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200 px-4 py-3 rounded-lg text-sm">
              Только администраторы и менеджеры могут управлять турами
            </div>
          )}

          {showAddTour && canManageTours && (
            <AddTourForm
              onSubmit={handleAddTour}
              onCancel={() => {
                setShowAddTour(false);
                setTourError('');
              }}
              isSubmitting={createTourMutation.isPending}
              error={tourError}
            />
          )}

          {!tours || tours.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Нет созданных туров</p>
              {canManageTours && (
                <button
                  onClick={() => setShowAddTour(true)}
                  className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
                >
                  Создать первый тур
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {tours.map((tour: any) => (
                <TourCard
                  key={tour.id}
                  tour={tour}
                  isEditing={editingTour === tour.id}
                  onEdit={() => {
                    setEditingTour(tour.id);
                    setTourError('');
                  }}
                  onUpdate={handleUpdateTour}
                  onCancelEdit={() => {
                    setEditingTour(null);
                    setTourError('');
                  }}
                  onDelete={() => handleDeleteTour(tour.id)}
                  isUpdating={updateTourMutation.isPending}
                  error={editingTour === tour.id ? tourError : undefined}
                />
              ))}
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'users',
      label: 'Пользователи организации',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      content: (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                Управление пользователями
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Добавляйте и управляйте пользователями организации
              </p>
            </div>
            {canAddUsers && (
              <button
                onClick={() => {
                  setShowAddUser(!showAddUser);
                  setUserError('');
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors whitespace-nowrap"
              >
                {showAddUser ? 'Отмена' : 'Добавить пользователя'}
              </button>
            )}
          </div>

          {!canAddUsers && (
            <div className="mb-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200 px-4 py-3 rounded-lg text-sm">
              Только администраторы могут добавлять пользователей
            </div>
          )}

          {showAddUser && canAddUsers && (
            <AddUserForm
              onSubmit={handleAddUser}
              onCancel={() => {
                setShowAddUser(false);
                setUserError('');
              }}
              isSubmitting={createUserMutation.isPending}
              error={userError}
            />
          )}

          {!users || users.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Нет пользователей</p>
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((user: any) => (
                <UserManagementCard
                  key={user.id}
                  user={user}
                  isEditing={editingUser === user.id}
                  onEdit={() => {
                    setEditingUser(user.id);
                    setUserError('');
                  }}
                  onUpdate={handleUpdateUser}
                  onCancelEdit={() => {
                    setEditingUser(null);
                    setUserError('');
                  }}
                onDelete={() => handleDeleteUser(user.id)}
                isUpdating={updateUserMutation.isPending}
                error={editingUser === user.id ? userError : undefined}
                currentUserId={(session?.user as any)?.id || ''}
                currentUserRole={userRole || 'GUIDE'}
                />
              ))}
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>

      {/* Информация об организации */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6 mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Информация об организации
        </h3>
        <div className="space-y-3">
          {organization?.logo && (
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Логотип</p>
              <img
                src={organization.logo}
                alt={organization.name}
                className="w-32 h-32 object-contain border border-gray-200 dark:border-gray-700 rounded-lg"
              />
            </div>
          )}
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Название</p>
            <p className="text-gray-900 dark:text-white font-medium">
              {organization?.name}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} defaultTab="tours" />
    </div>
  );
}
