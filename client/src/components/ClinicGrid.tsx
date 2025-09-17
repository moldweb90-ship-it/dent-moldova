import { ClinicCard } from './ClinicCard';
import { LazyClinicCard } from './LazyClinicCard';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { useTranslation } from '../lib/i18n';

interface Service {
  id: string;
  name: string;
  price: number;
}

interface Clinic {
  id: string;
  slug: string;
  nameRu: string;
  nameRo: string;
  logoUrl?: string;
  city: { nameRu: string; nameRo: string };
  district?: { nameRu: string; nameRo: string } | null;
  languages: string[];
  specializations: string[];
  tags: string[];
  verified: boolean;
  cnam: boolean;
  availToday: boolean;
  priceIndex: number;
  trustIndex: number;
  reviewsIndex: number;
  accessIndex: number;
  dScore: number;
  recommended?: boolean;
  promotionalLabels?: string[];
  services?: Service[];
}

interface ClinicGridProps {
  clinics: Clinic[];
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onClinicClick: (slug: string) => void;
  onBookClick: (clinic: Clinic) => void;
  onPricesClick: (slug: string) => void;
  onPhoneClick?: (clinic: Clinic) => void;
  onWebsiteClick?: (clinic: Clinic) => void;
  filtersVisible?: boolean; // Новый пропс для состояния фильтров
  language?: string; // Добавляем язык для передачи в ссылки
}

export function ClinicGrid({ 
  clinics, 
  total, 
  page, 
  limit, 
  onPageChange, 
  onClinicClick, 
  onBookClick,
  onPricesClick,
  onPhoneClick,
  onWebsiteClick,
  filtersVisible = true, // По умолчанию фильтры видимы
  language = 'ru' // По умолчанию русский язык
}: ClinicGridProps) {
  const { t } = useTranslation();
  const totalPages = Math.ceil(total / limit);
  const startResult = (page - 1) * limit + 1;
  const endResult = Math.min(page * limit, total);

  // Определяем количество колонок в зависимости от состояния фильтров
  const gridCols = filtersVisible 
    ? 'grid-cols-2 md:grid-cols-3' // 3 колонки когда фильтры включены
    : 'grid-cols-2 md:grid-cols-4'; // 4 колонки когда фильтры скрыты

  return (
    <div className="space-y-8">

      {/* Grid */}
      <div className={`grid ${gridCols} gap-4 md:gap-6`}>
        {clinics.map((clinic, index) => {
          // console.log('🔍 ClinicGrid clinic:', {
          //   id: clinic.id,
          //   nameRu: clinic.nameRu,
          //   nameRo: clinic.nameRo
          // });
          return (
            <LazyClinicCard
              key={clinic.id}
              clinic={clinic}
              language={language}
              onClinicClick={onClinicClick}
              onBookClick={onBookClick}
              onPricesClick={onPricesClick}
              onPhoneClick={onPhoneClick}
              onWebsiteClick={onWebsiteClick}
              priority={index < 6} // Приоритетная загрузка для первых 6 карточек
            />
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-lg">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={page === 1}
              className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              {t('previous')}
            </button>
            <button
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              {t('next')}
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
            </div>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => onPageChange(Math.max(1, page - 1))}
                    className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  
                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        onClick={() => onPageChange(pageNum)}
                        isActive={pageNum === page}
                        className="cursor-pointer"
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                    className={page === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      )}
    </div>
  );
}
