/**
 * Основной JavaScript файл - полностью повторяет функциональность оригинального проекта
 */

(function() {
    'use strict';

    // Инициализация при загрузке страницы
    document.addEventListener('DOMContentLoaded', function() {
        initLanguageToggle();
        initFilters();
        initModals();
        initClinicCards();
        initSearch();
    });

    /**
     * Переключение языка
     */
    function initLanguageToggle() {
        const checkbox = document.getElementById('lang-checkbox');
        if (!checkbox) return;

        checkbox.addEventListener('change', function() {
            const newLang = this.checked ? 'ro' : 'ru';
            const currentUrl = window.location.href;
            const url = new URL(currentUrl);
            
            // Получаем текущий путь
            let pathname = url.pathname;
            
            // Убираем префикс /clinicaphp.md если есть
            if (pathname.startsWith('/clinicaphp.md')) {
                pathname = pathname.replace('/clinicaphp.md', '');
            }
            
            // Нормализуем путь (убираем начальный и конечный слеш)
            pathname = pathname.replace(/^\/+|\/+$/g, '');
            
            // Определяем текущий язык по пути
            let currentLang = 'ru';
            let pathWithoutLang = pathname;
            
            if (pathname === 'ro' || pathname.startsWith('ro/')) {
                currentLang = 'ro';
                if (pathname === 'ro') {
                    pathWithoutLang = '';
                } else {
                    pathWithoutLang = pathname.substring(3); // Убираем 'ro/'
                }
            }
            
            // Если язык не изменился, ничего не делаем
            if (currentLang === newLang) {
                return;
            }
            
            // Формируем новый путь с правильным префиксом языка
            let newPathname = '';
            if (newLang === 'ro') {
                newPathname = '/ro' + (pathWithoutLang ? '/' + pathWithoutLang : '');
            } else {
                newPathname = pathWithoutLang ? '/' + pathWithoutLang : '/';
            }
            
            // Добавляем префикс /clinicaphp.md обратно если нужно
            const basePath = BASE_URL.replace(/^https?:\/\/[^\/]+/, '');
            if (basePath && basePath !== '/') {
                newPathname = basePath + newPathname;
            }
            
            // Формируем новый URL
            url.pathname = newPathname;
            
            // Добавляем параметр lang для обновления сессии на сервере
            url.searchParams.set('lang', newLang);
            
            // Переходим на новый URL
            window.location.href = url.toString();
        });
    }

    /**
     * Инициализация фильтров
     */
    function initFilters() {
        const mobileToggle = document.getElementById('mobile-filters-toggle');
        const desktopToggle = document.getElementById('desktop-filters-toggle');
        const filtersSidebar = document.getElementById('filters-sidebar');
        const filtersToggleText = document.getElementById('filters-toggle-text');
        
        let filtersVisible = true;

        if (desktopToggle && filtersSidebar) {
            desktopToggle.addEventListener('click', function() {
                filtersVisible = !filtersVisible;
                filtersSidebar.classList.toggle('hidden');
                filtersToggleText.textContent = filtersVisible ? 
                    (LANGUAGE === 'ru' ? 'Скрыть фильтры' : 'Ascunde filtrele') :
                    (LANGUAGE === 'ru' ? 'Показать фильтры' : 'Afișează filtrele');
            });
        }

        if (mobileToggle) {
            mobileToggle.addEventListener('click', function() {
                openMobileFilters();
            });
        }

        // Обработка применения фильтров
        const filterForm = document.getElementById('filters-form');
        if (filterForm) {
            filterForm.addEventListener('submit', function(e) {
                e.preventDefault();
                applyFilters();
            });
        }

        // Обработка сброса фильтров
        const resetFiltersBtn = document.getElementById('reset-filters');
        if (resetFiltersBtn) {
            resetFiltersBtn.addEventListener('click', function() {
                resetFilters();
            });
        }
    }

    /**
     * Открытие мобильных фильтров
     */
    function openMobileFilters() {
        const modal = document.getElementById('mobile-filters-modal');
        if (modal) {
            modal.classList.remove('hidden');
            document.body.classList.add('modal-open');
        }
    }

    /**
     * Закрытие мобильных фильтров
     */
    function closeMobileFilters() {
        const modal = document.getElementById('mobile-filters-modal');
        if (modal) {
            modal.classList.add('hidden');
            document.body.classList.remove('modal-open');
        }
    }

    /**
     * Применение фильтров
     */
    function applyFilters() {
        const form = document.getElementById('filters-form');
        if (!form) return;

        const formData = new FormData(form);
        const params = new URLSearchParams();
        
        for (const [key, value] of formData.entries()) {
            if (value) {
                params.append(key, value);
            }
        }

        const url = new URL(window.location.href);
        url.search = params.toString();
        window.location.href = url.toString();
    }

    /**
     * Сброс фильтров
     */
    function resetFilters() {
        const baseUrl = LANGUAGE === 'ro' ? BASE_URL + '/ro' : BASE_URL;
        window.location.href = baseUrl;
    }

    /**
     * Инициализация модальных окон
     */
    function initModals() {
        const overlay = document.getElementById('modal-overlay');
        const modalContent = document.getElementById('modal-content');
        
        if (!overlay || !modalContent) return;

        // Закрытие по клику вне модального окна
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                closeModal();
            }
        });

        // Закрытие по ESC
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && !overlay.classList.contains('hidden')) {
                closeModal();
            }
        });

        // Кнопка добавления клиники
        const addClinicBtns = document.querySelectorAll('[id^="add-clinic-btn"]');
        addClinicBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                openAddClinicModal();
            });
        });
    }

    /**
     * Открытие модального окна
     */
    function openModal(content) {
        const overlay = document.getElementById('modal-overlay');
        const modalContent = document.getElementById('modal-content');
        
        if (!overlay || !modalContent) return;

        modalContent.innerHTML = content;
        overlay.classList.remove('hidden');
        overlay.classList.add('flex');
        document.body.classList.add('modal-open');
    }

    /**
     * Закрытие модального окна
     */
    function closeModal() {
        const overlay = document.getElementById('modal-overlay');
        
        if (!overlay) return;

        overlay.classList.add('hidden');
        overlay.classList.remove('flex');
        document.body.classList.remove('modal-open');
    }

    /**
     * Открытие модального окна добавления клиники
     */
    function openAddClinicModal() {
        const formHtml = `
            <div class="p-6">
                <h2 class="text-2xl font-bold mb-4">${LANGUAGE === 'ru' ? 'Добавить клинику' : 'Adaugă clinică'}</h2>
                <form id="add-clinic-form" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium mb-2">${LANGUAGE === 'ru' ? 'Название клиники' : 'Numele clinicii'}</label>
                        <input type="text" name="name" required class="w-full px-4 py-2 border rounded-md">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-2">${LANGUAGE === 'ru' ? 'Город' : 'Oraș'}</label>
                        <select name="city_id" required class="w-full px-4 py-2 border rounded-md"></select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-2">${LANGUAGE === 'ru' ? 'Адрес' : 'Adresa'}</label>
                        <input type="text" name="address" class="w-full px-4 py-2 border rounded-md">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-2">${LANGUAGE === 'ru' ? 'Телефон' : 'Telefon'}</label>
                        <input type="tel" name="phone" class="w-full px-4 py-2 border rounded-md">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-2">${LANGUAGE === 'ru' ? 'Email' : 'Email'}</label>
                        <input type="email" name="email" class="w-full px-4 py-2 border rounded-md">
                    </div>
                    <div class="flex space-x-2">
                        <button type="submit" class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                            ${LANGUAGE === 'ru' ? 'Отправить' : 'Trimite'}
                        </button>
                        <button type="button" onclick="closeModal()" class="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">
                            ${LANGUAGE === 'ru' ? 'Отмена' : 'Anulează'}
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        openModal(formHtml);
        
        // Загрузка городов
        loadCitiesForForm();
        
        // Обработка отправки формы
        const form = document.getElementById('add-clinic-form');
        if (form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                submitAddClinicForm(this);
            });
        }
    }

    /**
     * Загрузка городов для формы
     */
    function loadCitiesForForm() {
        fetch(`${BASE_URL}/api/cities?language=${LANGUAGE}`)
            .then(res => res.json())
            .then(cities => {
                const select = document.querySelector('#add-clinic-form select[name="city_id"]');
                if (!select) return;

                select.innerHTML = '<option value="">' + (LANGUAGE === 'ru' ? 'Выберите город' : 'Selectează orașul') + '</option>';
                cities.forEach(city => {
                    const option = document.createElement('option');
                    option.value = city.id;
                    option.textContent = LANGUAGE === 'ru' ? city.name_ru : city.name_ro;
                    select.appendChild(option);
                });
            })
            .catch(err => console.error('Error loading cities:', err));
    }

    /**
     * Отправка формы добавления клиники
     */
    function submitAddClinicForm(form) {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);

        fetch(`${BASE_URL}/api/new-clinic-request`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
        .then(res => res.json())
        .then(result => {
            if (result.success) {
                alert(LANGUAGE === 'ru' ? 'Заявка отправлена успешно!' : 'Cererea a fost trimisă cu succes!');
                closeModal();
            } else {
                alert(LANGUAGE === 'ru' ? 'Ошибка отправки заявки' : 'Eroare la trimiterea cererii');
            }
        })
        .catch(err => {
            console.error('Error submitting form:', err);
            alert(LANGUAGE === 'ru' ? 'Ошибка отправки заявки' : 'Eroare la trimiterea cererii');
        });
    }

    /**
     * Инициализация карточек клиник
     */
    function initClinicCards() {
        const cards = document.querySelectorAll('.clinic-card');
        
        cards.forEach(card => {
            // Клик на карточку открывает детальную страницу
            card.addEventListener('click', function(e) {
                // Не открываем если клик по кнопке
                if (e.target.closest('button, a')) return;
                
                const slug = this.dataset.slug;
                if (slug) {
                    const url = LANGUAGE === 'ro' ? 
                        `${BASE_URL}/ro/clinic/${slug}` : 
                        `${BASE_URL}/clinic/${slug}`;
                    window.location.href = url;
                }
            });

            // Hover эффект для показа рейтингов
            card.addEventListener('mouseenter', function() {
                const clinicId = this.dataset.clinicId;
                if (clinicId) {
                    loadClinicRatings(clinicId, this);
                }
            });
        });
    }

    /**
     * Загрузка рейтингов клиники
     */
    function loadClinicRatings(clinicId, cardElement) {
        fetch(`${BASE_URL}/api/clinics/${clinicId}/ratings`)
            .then(res => res.json())
            .then(ratings => {
                // Показываем рейтинги в карточке
                showRatingsInCard(cardElement, ratings);
            })
            .catch(err => console.error('Error loading ratings:', err));
    }

    /**
     * Показ рейтингов в карточке
     */
    function showRatingsInCard(cardElement, ratings) {
        // Создаем overlay с рейтингами
        const overlay = document.createElement('div');
        overlay.className = 'clinic-ratings-overlay absolute inset-0 bg-black/60 flex items-center justify-center z-20';
        overlay.innerHTML = `
            <div class="bg-black/80 p-4 rounded-lg backdrop-blur-sm">
                <div class="text-white text-xs space-y-2">
                    <div class="flex justify-between">
                        <span>${LANGUAGE === 'ru' ? 'Качество' : 'Calitate'}</span>
                        <span>${ratings.qualityRating?.toFixed(1) || '0.0'}</span>
                    </div>
                    <div class="flex justify-between">
                        <span>${LANGUAGE === 'ru' ? 'Сервис' : 'Serviciu'}</span>
                        <span>${ratings.serviceRating?.toFixed(1) || '0.0'}</span>
                    </div>
                </div>
            </div>
        `;
        
        cardElement.appendChild(overlay);
        
        // Удаляем overlay при уходе мыши
        cardElement.addEventListener('mouseleave', function() {
            overlay.remove();
        }, { once: true });
    }

    /**
     * Инициализация поиска
     */
    function initSearch() {
        const searchInput = document.getElementById('search-input');
        if (!searchInput) return;

        let searchTimeout;
        
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            const query = this.value.trim();
            
            searchTimeout = setTimeout(() => {
                if (query.length >= 2) {
                    performSearch(query);
                } else if (query.length === 0) {
                    resetSearch();
                }
            }, 300);
        });
    }

    /**
     * Выполнение поиска
     */
    function performSearch(query) {
        const url = new URL(window.location.href);
        url.searchParams.set('search', query);
        url.searchParams.set('page', '1');
        
        // Используем AJAX для поиска без перезагрузки страницы
        fetch(url.toString())
            .then(res => res.text())
            .then(html => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const clinicsGrid = doc.querySelector('.clinics-grid');
                
                if (clinicsGrid) {
                    const currentGrid = document.querySelector('.clinics-grid');
                    if (currentGrid) {
                        currentGrid.innerHTML = clinicsGrid.innerHTML;
                        initClinicCards();
                    }
                }
            })
            .catch(err => {
                console.error('Search error:', err);
                // Fallback: перезагрузка страницы
                window.location.href = url.toString();
            });
    }

    /**
     * Сброс поиска
     */
    function resetSearch() {
        const url = new URL(window.location.href);
        url.searchParams.delete('search');
        
        window.location.href = url.toString();
    }

    // Экспорт функций для глобального использования
    window.openModal = openModal;
    window.closeModal = closeModal;
    window.openAddClinicModal = openAddClinicModal;
})();
