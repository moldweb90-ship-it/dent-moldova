import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Устанавливаем правильный lang атрибут в зависимости от URL
function setLanguageFromPath() {
  const path = window.location.pathname;
  if (path.startsWith('/clinic/ro/') || path === '/ro') {
    document.documentElement.lang = 'ro';
  } else {
    document.documentElement.lang = 'ru';
  }
}

// Устанавливаем язык при загрузке
setLanguageFromPath();

// Слушаем изменения URL (для SPA навигации)
window.addEventListener('popstate', setLanguageFromPath);

// Перехватываем изменения URL через wouter
const originalPushState = history.pushState;
const originalReplaceState = history.replaceState;

history.pushState = function(...args) {
  originalPushState.apply(this, args);
  setTimeout(setLanguageFromPath, 0);
};

history.replaceState = function(...args) {
  originalReplaceState.apply(this, args);
  setTimeout(setLanguageFromPath, 0);
};

// Полностью убираем margin-right от react-remove-scroll
function forceResetBodyMargins() {
  const style = document.body.style;
  // Используем setProperty с пустой строкой чтобы удалить свойства полностью
  style.setProperty('margin-right', '0', 'important');
  style.setProperty('padding-right', '0', 'important');
  style.setProperty('margin-left', '0', 'important');
  style.setProperty('padding-left', '0', 'important');
  
  // Запускаем следующий цикл
  requestAnimationFrame(forceResetBodyMargins);
}

// Запускаем бесконечный цикл сброса через RAF (работает синхронно с перерисовкой)
forceResetBodyMargins();

createRoot(document.getElementById("root")!).render(<App />);
