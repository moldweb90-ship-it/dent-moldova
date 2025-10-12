# 🌐 Система Hreflang - Полная Реализация

## ✅ Что реализовано

### **Универсальный хук `useHreflang`**

**Файл:** `client/src/hooks/useHreflang.ts`

Автоматически генерирует hreflang теги для любой страницы сайта.

#### **Принцип работы:**

1. **Определяет текущий путь** страницы
2. **Генерирует пути для обоих языков** (ru/ro)
3. **Создает 3 hreflang тега:**
   - `hreflang="ru"` - русская версия
   - `hreflang="ro"` - румынская версия
   - `hreflang="x-default"` - версия по умолчанию (русская)

#### **Примеры генерации:**

```typescript
// Главная страница
/ → hreflang="ru" href="https://mdent.md/"
/ro → hreflang="ro" href="https://mdent.md/ro"

// Страница клиники
/clinic/life-dental → hreflang="ru" href="https://mdent.md/clinic/life-dental"
/clinic/ro/life-dental → hreflang="ro" href="https://mdent.md/clinic/ro/life-dental"

// Страница города
/city/chisinau → hreflang="ru" href="https://mdent.md/city/chisinau"
/ro/city/chisinau → hreflang="ro" href="https://mdent.md/ro/city/chisinau"

// Страница района
/city/chisinau/centru → hreflang="ru" href="https://mdent.md/city/chisinau/centru"
/ro/city/chisinau/centru → hreflang="ro" href="https://mdent.md/ro/city/chisinau/centru"

// Страница функции
/pediatric-dentistry → hreflang="ru" href="https://mdent.md/pediatric-dentistry"
/ro/pediatric-dentistry → hreflang="ro" href="https://mdent.md/ro/pediatric-dentistry"

// Pricing
/pricing → hreflang="ru" href="https://mdent.md/pricing"
/ro/pricing → hreflang="ro" href="https://mdent.md/ro/pricing"
```

---

## 📋 Покрытие страниц

### ✅ **Автоматическое покрытие (100%)**

| Страница | Интеграция | Статус |
|----------|-----------|---------|
| **Главная (/)** | `useSEO.ts` | ✅ |
| **Клиники** | `clinic/[slug].tsx` | ✅ |
| **Города** | `DynamicSEO.tsx` в `Home.tsx` | ✅ |
| **Районы** | `DynamicSEO.tsx` в `Home.tsx` | ✅ |
| **Функции** | `DynamicSEO.tsx` в `Home.tsx` | ✅ |
| **Pricing** | `pricing.tsx` | ✅ |
| **Любые новые страницы** | Через `DynamicSEO` или `useSEO` | ✅ |

---

## 🔧 Интеграция

### **Способ 1: Через DynamicSEO (рекомендуется)**

Используется для динамических страниц с SEO.

```tsx
import { DynamicSEO } from '@/components/DynamicSEO';

<DynamicSEO
  title="Стоматологии в Кишинёве"
  description="Найдите лучшие стоматологии"
  language={language} // 'ru' или 'ro'
/>
```

**Автоматически генерирует:**
- Meta tags (title, description, keywords)
- Open Graph tags
- Schema.org
- **Hreflang теги** ✨

---

### **Способ 2: Прямое использование хука**

Для простых страниц без полного SEO.

```tsx
import { useHreflang } from '@/hooks/useHreflang';

export default function MyPage() {
  const language = 'ru'; // или 'ro'
  
  // Автоматически генерирует hreflang
  useHreflang({ language });
  
  return <div>...</div>;
}
```

---

### **Способ 3: Через useSEO (для homepage)**

Для главной страницы.

```tsx
import { useSEO } from '@/hooks/useSEO';

export default function Home() {
  const language = 'ru'; // или 'ro'
  
  // Автоматически загружает SEO настройки + генерирует hreflang
  const { seoSettings } = useSEO(language);
  
  return <div>...</div>;
}
```

---

## 🎯 Преимущества системы

### **1. Автоматизация**
- ✅ Не нужно вручную писать hreflang для каждой страницы
- ✅ Система сама определяет пути для обоих языков
- ✅ Автоматически создает x-default

### **2. Универсальность**
- ✅ Работает с любой структурой URL
- ✅ Поддерживает вложенные пути (города/районы)
- ✅ Легко расширяется на новые страницы

### **3. SEO оптимизация**
- ✅ Google правильно индексирует языковые версии
- ✅ Пользователи видят корректную версию в результатах поиска
- ✅ Нет дублирования контента

### **4. Удобство разработки**
- ✅ Один хук для всех страниц
- ✅ Консистентная реализация
- ✅ Легко отлаживать (логи в консоли)

---

## 🧪 Проверка работы

### **1. В браузере (DevTools)**

```html
<!-- Откройте Elements → <head> -->
<link rel="alternate" hreflang="ru" href="https://mdent.md/clinic/life-dental" />
<link rel="alternate" hreflang="ro" href="https://mdent.md/clinic/ro/life-dental" />
<link rel="alternate" hreflang="x-default" href="https://mdent.md/clinic/life-dental" />
```

### **2. В консоли браузера**

```javascript
// При загрузке страницы увидите:
🌐 Hreflang generated: {
  current: 'ru',
  ru: 'https://mdent.md/city/chisinau',
  ro: 'https://mdent.md/ro/city/chisinau',
  default: 'https://mdent.md/city/chisinau'
}
```

### **3. Google Search Console**

1. Откройте **Search Console** → **Международное таргетирование**
2. Проверьте **Языковые теги hreflang**
3. Не должно быть ошибок

### **4. Валидация**

Используйте онлайн инструменты:
- https://validator.w3.org/
- https://search.google.com/test/rich-results
- https://technicalseo.com/tools/hreflang/

---

## 📝 Примеры использования

### **Пример 1: Новая статическая страница**

```tsx
// client/src/pages/about.tsx
import { useHreflang } from '@/hooks/useHreflang';
import { useRoute } from 'wouter';

export default function AboutPage() {
  const [, paramsRo] = useRoute('/ro/about');
  const language = paramsRo ? 'ro' : 'ru';
  
  useHreflang({ language });
  
  return (
    <div>
      <h1>О нас</h1>
    </div>
  );
}
```

### **Пример 2: Новая динамическая страница**

```tsx
// client/src/pages/services/[id].tsx
import { DynamicSEO } from '@/components/DynamicSEO';
import { useRoute } from 'wouter';

export default function ServicePage() {
  const [, paramsRu] = useRoute<{ id: string }>('/services/:id');
  const [, paramsRo] = useRoute<{ id: string }>('/ro/services/:id');
  const language = paramsRo ? 'ro' : 'ru';
  
  return (
    <>
      <DynamicSEO
        title="Услуги стоматологии"
        description="Профессиональные услуги"
        language={language}
      />
      <div>...</div>
    </>
  );
}
```

### **Пример 3: Компонент с SEO**

```tsx
// client/src/components/MyComponent.tsx
import { useHreflang } from '@/hooks/useHreflang';

export function MyComponent({ language }: { language: 'ru' | 'ro' }) {
  useHreflang({ language });
  
  return <div>...</div>;
}
```

---

## 🔍 Отладка

### **Включить логи**

Логи уже включены в `useHreflang.ts`:

```typescript
console.log('🌐 Hreflang generated:', {
  current: language,
  ru: `${currentUrl}${ruPath}`,
  ro: `${currentUrl}${roPath}`,
  default: `${currentUrl}${ruPath}`
});
```

### **Проверить в консоли**

```javascript
// Посмотреть все hreflang теги на странице
document.querySelectorAll('link[rel="alternate"][hreflang]')
```

---

## ⚠️ Важные моменты

### **1. Структура URL**

Система ожидает следующую структуру:
- Русский: `/path/to/page`
- Румынский: `/ro/path/to/page`

### **2. X-Default**

По умолчанию указывает на русскую версию (основной язык).

### **3. Очистка**

Старые hreflang теги автоматически удаляются при переходе на новую страницу.

### **4. Производительность**

Хук запускается только при изменении:
- Языка
- Пути страницы

---

## 🚀 Что дальше?

### **Готово к использованию:**
- ✅ Система работает на всех страницах
- ✅ Автоматическая генерация для новых страниц
- ✅ 100% покрытие

### **Рекомендации:**
1. Проверьте в Google Search Console через 1-2 недели
2. Убедитесь что нет ошибок hreflang
3. Мониторьте индексацию обеих языковых версий

---

## 📞 Поддержка

При проблемах:
1. Проверьте консоль браузера (должны быть логи 🌐)
2. Проверьте DevTools → Elements → `<head>`
3. Убедитесь что передан корректный `language`

---

**Система hreflang полностью реализована и работает! 🎉**

