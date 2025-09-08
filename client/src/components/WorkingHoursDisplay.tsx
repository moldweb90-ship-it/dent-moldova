import React from 'react';
import { useTranslation } from '../lib/i18n';
import { Clock } from 'lucide-react';

interface WorkingHour {
  dayOfWeek: number;
  isOpen: boolean;
  openTime?: string;
  closeTime?: string;
  breakStartTime?: string;
  breakEndTime?: string;
  is24Hours: boolean;
}

interface WorkingHoursDisplayProps {
  workingHours: WorkingHour[];
  compact?: boolean;
  showToday?: boolean;
  isCard?: boolean;
}

const DAYS_OF_WEEK = [
  { value: 1, labelKey: 'monday', shortKey: 'mon' },
  { value: 2, labelKey: 'tuesday', shortKey: 'tue' },
  { value: 3, labelKey: 'wednesday', shortKey: 'wed' },
  { value: 4, labelKey: 'thursday', shortKey: 'thu' },
  { value: 5, labelKey: 'friday', shortKey: 'fri' },
  { value: 6, labelKey: 'saturday', shortKey: 'sat' },
  { value: 0, labelKey: 'sunday', shortKey: 'sun' },
];

export const WorkingHoursDisplay: React.FC<WorkingHoursDisplayProps> = ({
  workingHours,
  compact = false,
  showToday = false,
  isCard = false
}) => {
  const { t, language } = useTranslation();

  const formatTime = (time: string) => {
    if (!time) return '';
    return time.substring(0, 5); // Ensure HH:MM format
  };

  const getTodayInfo = () => {
    const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
    const todayHours = workingHours.find(wh => wh.dayOfWeek === today);
    
    if (!todayHours) return null;
    
    // Если день полностью закрыт в админке
    if (!todayHours.isOpen) {
      return { status: 'dayOff', text: (language === 'ru' ? 'Выходной' : 'Zi liberă'), time: (language === 'ru' ? 'Выходной' : 'Zi liberă') };
    }
    
    if (todayHours.is24Hours) {
      return { status: 'open', text: '24/7', time: '24/7' };
    }
    
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const openTime = todayHours.openTime || '';
    const closeTime = todayHours.closeTime || '';
    
    if (openTime && closeTime) {
      // Преобразуем время в минуты для корректного сравнения
      const timeToMinutes = (timeStr: string) => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
      };
      
      const currentMinutes = timeToMinutes(currentTime);
      const openMinutes = timeToMinutes(openTime);
      const closeMinutes = timeToMinutes(closeTime);
      
      // Проверяем, открыта ли клиника сейчас
      let isOpen;
      if (closeMinutes > openMinutes) {
        // Обычный случай: открытие и закрытие в один день
        isOpen = currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
      } else {
        // Случай перехода через полночь (например, 22:00 - 06:00)
        isOpen = currentMinutes >= openMinutes || currentMinutes <= closeMinutes;
      }
      
      return {
        status: isOpen ? 'open' : 'closed',
        text: isOpen ? t('open') : (language === 'ru' ? 'Закрыто' : 'Închis'),
        time: isOpen ? `${formatTime(openTime)} - ${formatTime(closeTime)}` : (language === 'ru' ? 'Закрыто' : 'Închis'),
        isOpen
      };
    }
    
    return { status: 'unknown', text: 'Время не указано', time: '' };
  };

  const todayInfo = showToday ? getTodayInfo() : null;

  if (compact) {
    if (!todayInfo) return null;
    
    return (
      <div className="flex items-center gap-2">
        {/* Индикатор статуса */}
        <div className={`w-1.5 h-1.5 rounded-full ${
          todayInfo.status === 'open' ? 'bg-green-500 animate-pulse' : 
          todayInfo.status === 'dayOff' ? 'bg-gray-500' : 'bg-red-500'
        }`} />
        
        {/* Время работы */}
        <span className={`font-medium ${
          isCard ? 'text-[10px] text-white' : 'text-sm text-gray-600'
        }`}>
          {todayInfo.time}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
        {t('workingHours')}
        {todayInfo && (
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              todayInfo.status === 'open' ? 'bg-green-500 animate-pulse' : 
              todayInfo.status === 'dayOff' ? 'bg-gray-500' : 'bg-red-500'
            }`} />
            <span className={`text-xs font-medium ${
              todayInfo.status === 'open' ? 'text-green-600' : 
              todayInfo.status === 'dayOff' ? 'text-gray-600' : 'text-red-600'
            }`}>
              {todayInfo.text}
            </span>
          </div>
        )}
      </div>
      
      <div className="space-y-1">
        {DAYS_OF_WEEK.map(({ value, labelKey }) => {
          const day = workingHours.find(d => d.dayOfWeek === value);
          if (!day) return null;

          return (
            <div key={value} className="flex justify-between items-center text-sm">
              <span className="text-gray-600 min-w-[80px]">
                {t(labelKey)}
              </span>
              <span className="text-gray-800 font-medium">
                {!day.isOpen ? (
                  <span className="text-gray-600">{language === 'ru' ? 'Выходной' : 'Zi liberă'}</span>
                ) : day.is24Hours ? (
                  <span className="text-green-600 flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  24/7
                </span>
                ) : (
                  <span>
                    {formatTime(day.openTime || '')} - {formatTime(day.closeTime || '')}
                    {day.breakStartTime && day.breakEndTime && (
                      <span className="text-gray-500 ml-2">
                        (перерыв {formatTime(day.breakStartTime)} - {formatTime(day.breakEndTime)})
                      </span>
                    )}
                  </span>
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
