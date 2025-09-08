// Analytics utility for tracking user interactions

export type AnalyticsEventType = 'view' | 'click_details' | 'click_book' | 'click_phone' | 'click_website';

interface AnalyticsEvent {
  clinicId?: string;
  eventType: AnalyticsEventType;
}

// Send analytics event to server
export async function trackEvent(event: AnalyticsEvent): Promise<void> {
  try {
    console.log('📊 Отправляем аналитическое событие:', event);
    const response = await fetch('/api/analytics/event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });
    
    if (response.ok) {
      console.log('✅ Аналитическое событие отправлено успешно');
    } else {
      console.warn('⚠️ Аналитическое событие не отправлено:', response.status);
    }
  } catch (error) {
    // Silently fail - analytics should not break the app
    console.warn('Analytics event failed to send:', error);
  }
}

// Track clinic view
export function trackClinicView(clinicId: string): void {
  console.log('👁️ Вызываем trackClinicView для клиники:', clinicId);
  trackEvent({ clinicId, eventType: 'view' });
}

// Track button clicks
export function trackClickDetails(clinicId: string): void {
  trackEvent({ clinicId, eventType: 'click_details' });
}

export function trackClickBook(clinicId: string): void {
  trackEvent({ clinicId, eventType: 'click_book' });
}

export function trackClickPhone(clinicId: string): void {
  trackEvent({ clinicId, eventType: 'click_phone' });
}

export function trackClickWebsite(clinicId: string): void {
  trackEvent({ clinicId, eventType: 'click_website' });
}
