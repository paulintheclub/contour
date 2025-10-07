'use client';

import { useState, useMemo } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from '@heroicons/react/24/outline';

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

interface CalendarProps {
  slots: TourSlot[];
  onSlotClick: (slot: TourSlot) => void;
  onDayClick: (date: string, time?: string) => void;
  isLoading?: boolean;
  currentUserId?: string;
}

// Функция для получения начала недели (понедельник)
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Корректировка на понедельник
  return new Date(d.setDate(diff));
}

// Функция для форматирования даты в YYYY-MM-DD
function formatDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function Calendar({ slots, onSlotClick, onDayClick, isLoading, currentUserId }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  const dayNamesShort = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  const dayNamesFull = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];

  // Получаем начало текущей недели
  const weekStart = useMemo(() => getWeekStart(currentDate), [currentDate]);

  // Генерируем 7 дней недели
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      return date;
    });
  }, [weekStart]);

  const previousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const nextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Группируем слоты по дате и времени
  const slotsByDateAndTime = useMemo(() => {
    const grouped: Record<string, Record<string, TourSlot[]>> = {};
    
    slots.forEach((slot) => {
      if (!grouped[slot.date]) {
        grouped[slot.date] = {};
      }
      if (!grouped[slot.date][slot.time]) {
        grouped[slot.date][slot.time] = [];
      }
      grouped[slot.date][slot.time].push(slot);
    });
    
    return grouped;
  }, [slots]);

  // Динамически определяем временные слоты на основе реальных данных текущей недели
  const timeSlots = useMemo(() => {
    const timesSet = new Set<string>();
    
    // Собираем все уникальные времена из слотов текущей недели
    weekDays.forEach((day) => {
      const dateStr = formatDateString(day);
      const daySlots = slotsByDateAndTime[dateStr];
      if (daySlots) {
        Object.keys(daySlots).forEach((time) => timesSet.add(time));
      }
    });

    // Если нет туров на этой неделе, показываем базовое время 10:00
    if (timesSet.size === 0) {
      return ['10:00'];
    }

    // Преобразуем в массив и сортируем по времени
    const sortedTimes = Array.from(timesSet).sort((a, b) => {
      // Сравниваем время в формате HH:MM
      const [aHours, aMinutes] = a.split(':').map(Number);
      const [bHours, bMinutes] = b.split(':').map(Number);
      return aHours * 60 + aMinutes - (bHours * 60 + bMinutes);
    });

    return sortedTimes;
  }, [weekDays, slotsByDateAndTime]);

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const getLanguageFlag = (code: string): string => {
    const flags: Record<string, string> = {
      RU: '🇷🇺',
      EN: '🇬🇧',
      DE: '🇩🇪',
      FR: '🇫🇷',
      ES: '🇪🇸',
    };
    return flags[code] || '🌐';
  };

  const getTourColor = (tourTag: string): string => {
    // Генерируем цвет на основе tourTag
    const colors = [
      'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
      'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
      'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800',
      'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-800',
      'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
    ];
    const hash = tourTag.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  // Получаем диапазон дат для заголовка
  const weekRange = useMemo(() => {
    const start = weekDays[0];
    const end = weekDays[6];
    const startMonth = monthNames[start.getMonth()];
    const endMonth = monthNames[end.getMonth()];
    
    if (start.getMonth() === end.getMonth()) {
      return `${startMonth} ${start.getFullYear()}`;
    } else {
      return `${startMonth} - ${endMonth} ${end.getFullYear()}`;
    }
  }, [weekDays, monthNames]);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {weekRange}
            </h2>
            <button
              onClick={goToToday}
              className="px-3 py-1 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
            >
              Сегодня
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={previousWeek}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Предыдущая неделя"
            >
              <ChevronLeftIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </button>
            <button
              onClick={nextWeek}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Следующая неделя"
            >
              <ChevronRightIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Weekly Grid */}
      <div className="hidden md:block overflow-x-auto">
        <div className="min-w-max">
          {/* Week header with days */}
          <div className="grid border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10" style={{ gridTemplateColumns: '50px repeat(7, minmax(120px, 1fr))' }}>
            <div className="p-3 border-r border-gray-200 dark:border-gray-700">
              {/* Пустая ячейка для времени */}
            </div>
            {weekDays.map((day, index) => {
              const dateStr = formatDateString(day);
              const today = isToday(day);
              
              return (
                <div
                  key={dateStr}
                  className={`p-3 text-center border-r border-gray-200 dark:border-gray-700 ${
                    today ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''
                  }`}
                >
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                    {dayNamesShort[index]}
                  </div>
                  <div
                    className={`text-lg font-semibold ${
                      today
                        ? 'bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto'
                        : 'text-gray-900 dark:text-white'
                    }`}
                  >
                    {day.getDate()}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Time slots grid */}
          <div className="relative">
            {timeSlots.map((time) => (
              <div
                key={time}
                className="grid border-b border-gray-200 dark:border-gray-700 min-h-[60px]"
                style={{ gridTemplateColumns: '50px repeat(7, minmax(120px, 1fr))' }}
              >
                {/* Time label */}
                <div className="p-1 pr-2 text-right text-xs text-gray-600 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700">
                  {time}
                </div>

                {/* Day cells */}
                {weekDays.map((day) => {
                  const dateStr = formatDateString(day);
                  const slotsAtTime = slotsByDateAndTime[dateStr]?.[time] || [];
                  const today = isToday(day);

                  return (
                    <div
                      key={`${dateStr}-${time}`}
                      className={`relative p-0.5 border-r border-gray-200 dark:border-gray-700 group transition-colors ${
                        today ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''
                      }`}
                    >
                      {/* Slots */}
                      <div className="space-y-0.5">
                        {slotsAtTime.map((slot) => {
                          const assignedGuideInitials = slot.assignedGuides
                            .map((guide) => {
                              const name = guide.name || guide.email;
                              return name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .toUpperCase()
                                .slice(0, 2);
                            })
                            .join(', ');

                          const isAssignedToCurrentUser = currentUserId 
                            ? slot.assignedGuides.some((guide) => guide.id === currentUserId)
                            : false;

                          return (
                            <div
                              key={slot.id}
                              onClick={() => onSlotClick(slot)}
                              className={`relative text-xs p-1 rounded cursor-pointer hover:shadow-md transition-shadow z-10 ${getTourColor(
                                slot.tour.tourTag
                              )} ${isAssignedToCurrentUser ? 'border-2 border-green-500 dark:border-green-400' : 'border'}`}
                            >
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-semibold text-xs truncate">
                                  {slot.tour.tourTag}
                                </span>
                                <div className="flex items-center gap-0.5 flex-shrink-0">
                                  <span className="text-sm">{getLanguageFlag(slot.language)}</span>
                                  {slot.isPrivate && <span className="text-xs">🔒</span>}
                                </div>
                              </div>
                              <div className="flex items-center justify-between text-xs opacity-90 mt-0.5">
                                <span className="font-medium">
                                  PAX {slot.adults} {slot.childs > 0 ? `+${slot.childs}` : ''}
                                </span>
                                {assignedGuideInitials && (
                                  <span className="font-mono font-semibold text-xs bg-white/30 dark:bg-black/20 px-1 rounded truncate">
                                    {assignedGuideInitials}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}

                        {/* Add button - показывается под слотами */}
                        <button
                          onClick={() => onDayClick(dateStr, time)}
                          className="w-full opacity-0 group-hover:opacity-100 flex items-center justify-center py-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded transition-opacity"
                        >
                          <PlusIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile List View - Day by Day */}
      <div className="md:hidden p-4">
        <div className="space-y-4">
          {weekDays.map((day) => {
            const dateStr = formatDateString(day);
            const daySlots = slotsByDateAndTime[dateStr] || {};
            const today = isToday(day);
            const hasSots = Object.keys(daySlots).length > 0;

            // Собираем все слоты дня с временем
            const allDaySlots = Object.entries(daySlots)
              .flatMap(([time, slots]) =>
                slots.map((slot) => ({ ...slot, time }))
              )
              .sort((a, b) => a.time.localeCompare(b.time));

            return (
              <div
                key={dateStr}
                className={`bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 ${
                  today ? 'border-2 border-indigo-500' : 'border border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3
                      className={`text-lg font-semibold ${
                        today
                          ? 'text-indigo-600 dark:text-indigo-400'
                          : 'text-gray-900 dark:text-white'
                      }`}
                    >
                      {dayNamesFull[day.getDay() === 0 ? 6 : day.getDay() - 1]}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {day.getDate()} {monthNames[day.getMonth()]}
                      {today && ' (Сегодня)'}
                    </p>
                  </div>
                  <button
                    onClick={() => onDayClick(dateStr)}
                    className="p-2 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                    aria-label="Добавить слот"
                  >
                    <PlusIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  </button>
                </div>

                {!hasSots ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                    Нет туров в этот день
                  </p>
                ) : (
                      <div className="space-y-2">
                        {allDaySlots.map((slot) => {
                          const guideInitials = slot.assignedGuides
                            .map((guide) => {
                              const name = guide.name || guide.email;
                              return name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .toUpperCase()
                                .slice(0, 2);
                            })
                            .join(', ');

                          const isAssignedToCurrentUser = currentUserId 
                            ? slot.assignedGuides.some((guide) => guide.id === currentUserId)
                            : false;

                          return (
                            <div
                              key={slot.id}
                              onClick={() => onSlotClick(slot)}
                              className={`p-3 rounded-lg cursor-pointer ${getTourColor(
                                slot.tour.tourTag
                              )} ${isAssignedToCurrentUser ? 'border-2 border-green-500 dark:border-green-400' : 'border-2'}`}
                            >
                              <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg font-semibold">{slot.time}</span>
                                  <span className="text-base font-bold">{slot.tour.tourTag}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">{getLanguageFlag(slot.language)}</span>
                                  {slot.isPrivate && <span className="text-lg">🔒</span>}
                                </div>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span className="font-medium">
                                  {slot.adults + slot.childs} pax
                                  {slot.adults > 0 && slot.childs > 0 && (
                                    <span className="text-xs opacity-75 ml-1">
                                      ({slot.adults}+{slot.childs})
                                    </span>
                                  )}
                                </span>
                                {guideInitials && (
                                  <span className="font-mono font-semibold bg-white/50 dark:bg-black/20 px-2 py-1 rounded">
                                    {guideInitials}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

