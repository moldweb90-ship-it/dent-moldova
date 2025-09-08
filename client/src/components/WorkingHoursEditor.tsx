import React, { useState, useEffect } from 'react';
import { useTranslation } from '../lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Plus, Minus } from 'lucide-react';

interface WorkingHour {
  dayOfWeek: number;
  isOpen: boolean;
  openTime?: string;
  closeTime?: string;
  breakStartTime?: string;
  breakEndTime?: string;
  is24Hours: boolean;
}

interface WorkingHoursEditorProps {
  clinicId: string;
  initialWorkingHours?: WorkingHour[];
  onSave?: (workingHours: WorkingHour[]) => void;
  readOnly?: boolean;
}

const DAYS_OF_WEEK = [
  { value: 1, labelKey: 'monday' },
  { value: 2, labelKey: 'tuesday' },
  { value: 3, labelKey: 'wednesday' },
  { value: 4, labelKey: 'thursday' },
  { value: 5, labelKey: 'friday' },
  { value: 6, labelKey: 'saturday' },
  { value: 0, labelKey: 'sunday' },
];

export const WorkingHoursEditor: React.FC<WorkingHoursEditorProps> = ({
  clinicId,
  initialWorkingHours = [],
  onSave,
  readOnly = false
}) => {
  const { t } = useTranslation();
  const [workingHours, setWorkingHours] = useState<WorkingHour[]>([]);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (initialWorkingHours.length > 0) {
      setWorkingHours(initialWorkingHours);
    } else {
      // Initialize with default structure
      const defaultHours = DAYS_OF_WEEK.map(day => ({
        dayOfWeek: day.value,
        isOpen: day.value >= 1 && day.value <= 5, // Monday-Friday open by default
        openTime: '09:00',
        closeTime: '18:00',
        breakStartTime: '',
        breakEndTime: '',
        is24Hours: false
      }));
      setWorkingHours(defaultHours);
    }
  }, [initialWorkingHours]);

  const updateDay = (dayOfWeek: number, updates: Partial<WorkingHour>) => {
    setWorkingHours(prev => {
      const newWorkingHours = prev.map(day => 
        day.dayOfWeek === dayOfWeek 
          ? { ...day, ...updates }
          : day
      );
      
      // Автоматически сохраняем изменения без уведомлений
      if (onSave && !readOnly) {
        setTimeout(() => {
          onSave(newWorkingHours);
        }, 500);
      }
      
      return newWorkingHours;
    });
  };

  const toggleBreak = (dayOfWeek: number) => {
    const day = workingHours.find(d => d.dayOfWeek === dayOfWeek);
    if (!day) return;

    if (day.breakStartTime && day.breakEndTime) {
      // Remove break
      updateDay(dayOfWeek, { breakStartTime: '', breakEndTime: '' });
    } else {
      // Add break
      updateDay(dayOfWeek, { breakStartTime: '13:00', breakEndTime: '14:00' });
    }
  };

  const handleSave = async () => {
    if (readOnly || !onSave) return;

    setLoading(true);
    try {
      await onSave(workingHours);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving working hours:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time: string) => {
    if (!time) return '';
    return time.substring(0, 5); // Ensure HH:MM format
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          {t('workingHoursTitle')}
        </CardTitle>
        <p className="text-sm text-gray-600">{t('workingHoursDescription')}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {DAYS_OF_WEEK.map(({ value, labelKey }) => {
          const day = workingHours.find(d => d.dayOfWeek === value);
          if (!day) return null;

          return (
            <div key={value} className="border rounded-lg p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <Label className="font-medium text-base">
                  {t(labelKey)}
                </Label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={day.isOpen}
                      onCheckedChange={(checked) => updateDay(value, { isOpen: checked })}
                      disabled={readOnly}
                    />
                    <span className="text-sm">
                      {day.isOpen ? t('open') : t('closed')}
                    </span>
                  </div>
                  {day.isOpen && (
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={day.is24Hours}
                        onCheckedChange={(checked) => updateDay(value, { is24Hours: checked })}
                        disabled={readOnly}
                      />
                      <span className="text-sm">{t('is24Hours')}</span>
                    </div>
                  )}
                </div>
              </div>

              {day.isOpen && !day.is24Hours && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm">{t('openTime')}</Label>
                    <Input
                      type="time"
                      value={day.openTime || ''}
                      onChange={(e) => updateDay(value, { openTime: e.target.value })}
                      disabled={readOnly}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">{t('closeTime')}</Label>
                    <Input
                      type="time"
                      value={day.closeTime || ''}
                      onChange={(e) => updateDay(value, { closeTime: e.target.value })}
                      disabled={readOnly}
                      className="w-full"
                    />
                  </div>
                </div>
              )}

              {day.isOpen && !day.is24Hours && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">{t('breakTime')}</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => toggleBreak(value)}
                      disabled={readOnly}
                      className="h-8"
                    >
                      {day.breakStartTime && day.breakEndTime ? (
                        <>
                          <Minus className="h-4 w-4 mr-1" />
                          {t('removeBreak')}
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-1" />
                          {t('addBreak')}
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {(day.breakStartTime || day.breakEndTime) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm">{t('breakStart')}</Label>
                        <Input
                          type="time"
                          value={day.breakStartTime || ''}
                          onChange={(e) => updateDay(value, { breakStartTime: e.target.value })}
                          disabled={readOnly}
                          className="w-full"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">{t('breakEnd')}</Label>
                        <Input
                          type="time"
                          value={day.breakEndTime || ''}
                          onChange={(e) => updateDay(value, { breakEndTime: e.target.value })}
                          disabled={readOnly}
                          className="w-full"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {day.isOpen && day.is24Hours && (
                <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-md">
                  <Clock className="h-4 w-4 mr-1" />
                {t('is24Hours')}
                </div>
              )}

              {!day.isOpen && (
                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                  ❌ {t('closed')}
                </div>
              )}
            </div>
          );
        })}

        {!readOnly && onSave && (
          <div className="flex justify-end pt-4 border-t">
            <div className="text-sm text-gray-600">
              {loading ? 'Сохранение...' : 'Изменения сохраняются автоматически'}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
