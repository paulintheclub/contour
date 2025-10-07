'use client';

import { useSession } from 'next-auth/react';
import { trpc } from '@/lib/trpc/Provider';
import { useState } from 'react';
import { Calendar, TourSlotForm, TourSlotDetail } from '@/components/organizations';

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

export default function ToursPage() {
  const { data: session } = useSession();
  const organizationId = (session?.user as any)?.organizationId || '';
  const userRole = (session?.user as any)?.role as 'ADMIN' | 'MANAGER' | 'GUIDE' | undefined;

  const [showSlotForm, setShowSlotForm] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TourSlot | null>(null);
  const [defaultDate, setDefaultDate] = useState<string | undefined>(undefined);
  const [defaultTime, setDefaultTime] = useState<string | undefined>(undefined);
  const [formError, setFormError] = useState('');
  const [creationProgress, setCreationProgress] = useState<{ current: number; total: number } | null>(null);

  const canManageSlots = userRole === 'ADMIN' || userRole === 'MANAGER';
  const canDeleteSlots = userRole === 'ADMIN';

  // Получаем даты для фильтрации (3 месяца вокруг текущей даты для поддержки навигации)
  const currentDate = new Date();
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
  const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 2, 0);
  const startDate = firstDay.toISOString().split('T')[0];
  const endDate = lastDay.toISOString().split('T')[0];

  // Queries
  const { data: slots, isLoading: isLoadingSlots } =
    trpc.tourSlot.getByOrganizationAndDate.useQuery(
      { organizationId, startDate, endDate },
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

  // Mutations
  const createSlotMutation = trpc.tourSlot.create.useMutation({
    onSuccess: () => {
      utils.tourSlot.getByOrganizationAndDate.invalidate({ organizationId });
    },
    onError: (error) => {
      setFormError(error.message);
    },
  });

  const deleteSlotMutation = trpc.tourSlot.delete.useMutation({
    onSuccess: () => {
      utils.tourSlot.getByOrganizationAndDate.invalidate({ organizationId });
      setSelectedSlot(null);
    },
  });

  const togglePrivateMutation = trpc.tourSlot.update.useMutation({
    onSuccess: () => {
      utils.tourSlot.getByOrganizationAndDate.invalidate({ organizationId });
      // Обновляем selectedSlot
      if (selectedSlot) {
        setSelectedSlot({ ...selectedSlot, isPrivate: !selectedSlot.isPrivate });
      }
    },
  });

  const toggleAvailabilityMutation = trpc.tourSlot.update.useMutation({
    onSuccess: (updatedSlot) => {
      utils.tourSlot.getByOrganizationAndDate.invalidate({ organizationId });
      // Обновляем selectedSlot с новыми данными
      if (selectedSlot && updatedSlot) {
        setSelectedSlot({
          ...selectedSlot,
          availableGuides: updatedSlot.availableGuides,
          assignedGuides: updatedSlot.assignedGuides,
        });
      }
    },
    onError: (error) => {
      alert('Ошибка при изменении доступности: ' + error.message);
    },
  });

  const assignUserMutation = trpc.tourSlot.update.useMutation({
    onSuccess: (updatedSlot) => {
      utils.tourSlot.getByOrganizationAndDate.invalidate({ organizationId });
      // Обновляем selectedSlot с новыми данными
      if (selectedSlot && updatedSlot) {
        setSelectedSlot({
          ...selectedSlot,
          availableGuides: updatedSlot.availableGuides,
          assignedGuides: updatedSlot.assignedGuides,
        });
      }
    },
    onError: (error) => {
      alert('Ошибка при назначении: ' + error.message);
    },
  });

  // Handlers
  const handleSlotClick = (slot: TourSlot) => {
    setSelectedSlot(slot);
  };

  const handleDayClick = (date: string, time?: string) => {
    if (canManageSlots) {
      setDefaultDate(date);
      setDefaultTime(time);
      setShowSlotForm(true);
      setFormError('');
    }
  };

  const handleCreateSlot = async (data: {
    tourId: string;
    date: string;
    time: string;
    language: string;
    isPrivate: boolean;
    repeatType: 'none' | 'week' | 'month';
  }) => {
    setFormError('');

    // Генерируем массив дат в зависимости от типа повторения
    const dates: string[] = [];
    const startDate = new Date(data.date);

    if (data.repeatType === 'none') {
      dates.push(data.date);
    } else if (data.repeatType === 'week') {
      // 7 дней
      for (let i = 0; i < 7; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        dates.push(date.toISOString().split('T')[0]);
      }
    } else if (data.repeatType === 'month') {
      // 30 дней
      for (let i = 0; i < 30; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        dates.push(date.toISOString().split('T')[0]);
      }
    }

    // Создаем слоты для каждой даты
    try {
      setCreationProgress({ current: 0, total: dates.length });
      
      for (let i = 0; i < dates.length; i++) {
        const date = dates[i];
        await createSlotMutation.mutateAsync({
          tourId: data.tourId,
          date,
          time: data.time,
          language: data.language,
          isPrivate: data.isPrivate,
          adults: 0,
          childs: 0,
          availableGuideIds: [],
          assignedGuideIds: [],
        });
        setCreationProgress({ current: i + 1, total: dates.length });
      }
      
      // Закрываем форму после успешного создания всех слотов
      setShowSlotForm(false);
      setDefaultDate(undefined);
      setDefaultTime(undefined);
      setCreationProgress(null);
    } catch (error: any) {
      setFormError(error.message || 'Ошибка при создании слотов');
      setCreationProgress(null);
    }
  };

  const handleDeleteSlot = () => {
    if (!selectedSlot) return;
    if (confirm('Вы уверены, что хотите удалить этот слот?')) {
      deleteSlotMutation.mutate({ id: selectedSlot.id });
    }
  };

  const handleTogglePrivate = () => {
    if (!selectedSlot) return;
    togglePrivateMutation.mutate({
      id: selectedSlot.id,
      isPrivate: !selectedSlot.isPrivate,
    });
  };

  const handleToggleAvailability = () => {
    if (!selectedSlot || !session?.user) return;
    const currentUserId = (session.user as any).id;
    const isCurrentlyAvailable = selectedSlot.availableGuides.some((g) => g.id === currentUserId);

    // Получаем текущие ID доступных гидов
    let newAvailableGuideIds = selectedSlot.availableGuides.map((g) => g.id);

    if (isCurrentlyAvailable) {
      // Убираем текущего пользователя
      newAvailableGuideIds = newAvailableGuideIds.filter((id) => id !== currentUserId);
    } else {
      // Добавляем текущего пользователя
      newAvailableGuideIds.push(currentUserId);
    }

    toggleAvailabilityMutation.mutate({
      id: selectedSlot.id,
      availableGuideIds: newAvailableGuideIds,
    });
  };

  const handleAssignUser = (userId: string) => {
    if (!selectedSlot) return;
    
    // Добавляем пользователя к назначенным гидам
    const newAssignedGuideIds = [...selectedSlot.assignedGuides.map((g) => g.id), userId];
    
    assignUserMutation.mutate({
      id: selectedSlot.id,
      assignedGuideIds: newAssignedGuideIds,
    });
  };

  const handleUnassignUser = (userId: string) => {
    if (!selectedSlot) return;
    
    // Убираем пользователя из назначенных гидов
    const newAssignedGuideIds = selectedSlot.assignedGuides
      .map((g) => g.id)
      .filter((id) => id !== userId);
    
    assignUserMutation.mutate({
      id: selectedSlot.id,
      assignedGuideIds: newAssignedGuideIds,
    });
  };

  return (
    <div>
      {!canManageSlots && (
        <div className="mb-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200 px-4 py-3 rounded-lg text-sm">
          Только администраторы и менеджеры могут создавать и редактировать слоты туров
        </div>
      )}

      {canManageSlots && tours && tours.length === 0 && (
        <div className="mb-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200 px-4 py-3 rounded-lg text-sm">
          Сначала создайте туры в разделе{' '}
          <a href="/settings" className="underline font-medium">
            Настройки
          </a>
        </div>
      )}

      <Calendar
        slots={slots || []}
        onSlotClick={handleSlotClick}
        onDayClick={handleDayClick}
        isLoading={isLoadingSlots}
        currentUserId={(session?.user as any)?.id || ''}
      />

      {/* Slot Detail Modal */}
      {selectedSlot && (
        <TourSlotDetail
          slot={selectedSlot}
          onClose={() => setSelectedSlot(null)}
          onDelete={handleDeleteSlot}
          onTogglePrivate={handleTogglePrivate}
          onToggleAvailability={handleToggleAvailability}
          onAssignUser={handleAssignUser}
          onUnassignUser={handleUnassignUser}
          canDelete={canDeleteSlots}
          canTogglePrivate={canManageSlots}
          canAssign={canManageSlots}
          currentUserId={(session?.user as any)?.id || ''}
          currentUserRole={userRole || 'GUIDE'}
          allUsers={users || []}
          isTogglingAvailability={toggleAvailabilityMutation.isPending}
          isTogglingPrivate={togglePrivateMutation.isPending}
          isAssigning={assignUserMutation.isPending}
        />
      )}

      {/* Create Slot Form */}
      {showSlotForm && tours && tours.length > 0 && (
        <TourSlotForm
          tours={tours}
          onSubmit={handleCreateSlot}
          onCancel={() => {
            setShowSlotForm(false);
            setDefaultDate(undefined);
            setDefaultTime(undefined);
            setFormError('');
            setCreationProgress(null);
          }}
          isSubmitting={createSlotMutation.isPending || creationProgress !== null}
          error={formError}
          defaultDate={defaultDate}
          defaultTime={defaultTime}
        />
      )}

      {/* Progress Indicator */}
      {creationProgress && (
        <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 border border-gray-200 dark:border-gray-700 z-50">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Создание туров...
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {creationProgress.current} из {creationProgress.total}
              </p>
            </div>
          </div>
          <div className="mt-2 w-48 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(creationProgress.current / creationProgress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

    </div>
  );
}
