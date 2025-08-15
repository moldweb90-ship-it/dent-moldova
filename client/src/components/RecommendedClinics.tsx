import { useQuery } from '@tanstack/react-query';
import { Star, MapPin, Clock, Phone, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface RecommendedClinicsProps {
  onClinicClick: (slug: string) => void;
  onBookClick: (clinic: any) => void;
}

const promotionalLabelStyles: Record<string, string> = {
  top: 'bg-yellow-500 text-white',
  high_rating: 'bg-green-500 text-white',
  premium: 'bg-purple-500 text-white',
  verified_plus: 'bg-blue-500 text-white',
  popular: 'bg-red-500 text-white',
  new: 'bg-orange-500 text-white',
  discount: 'bg-pink-500 text-white',
  fast_service: 'bg-teal-500 text-white'
};

const promotionalLabelText: Record<string, string> = {
  top: 'ТОП',
  high_rating: 'Высокий рейтинг',
  premium: 'Премиум',
  verified_plus: 'Верифицирован+',
  popular: 'Популярное',
  new: 'Новое',
  discount: 'Скидки',
  fast_service: 'Быстро'
};

export function RecommendedClinics({ onClinicClick, onBookClick }: RecommendedClinicsProps) {
  const { data: clinicsData, isLoading } = useQuery({
    queryKey: ['/api/recommended-clinics'],
    queryFn: async () => {
      const response = await fetch('/api/recommended-clinics');
      if (!response.ok) throw new Error('Failed to fetch recommended clinics');
      return response.json();
    },
  });

  const clinics = clinicsData?.clinics || [];

  if (isLoading) {
    return (
      <div className="mb-8">
        <div className="flex items-center space-x-2 mb-6">
          <Flame className="h-6 w-6 text-red-500" />
          <h2 className="text-2xl font-bold text-gray-900">Рекомендуем</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md animate-pulse">
              <div className="h-48 bg-gray-200 rounded-t-lg"></div>
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (clinics.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="flex items-center space-x-2 mb-6">
        <Flame className="h-6 w-6 text-red-500" />
        <h2 className="text-2xl font-bold text-gray-900">Рекомендуем</h2>
        <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold px-3 py-1">
          ⭐ Лучший выбор
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clinics.map((clinic: any) => (
          <div
            key={clinic.id}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer relative overflow-hidden"
            onClick={() => onClinicClick(clinic.slug)}
          >
            {/* Recommended Badge */}
            <div className="absolute top-3 left-3 z-10">
              <Badge className="bg-red-500 text-white font-semibold">
                <Flame className="h-3 w-3 mr-1" />
                Рекомендуем
              </Badge>
            </div>

            {/* Promotional Labels */}
            {clinic.promotionalLabels && clinic.promotionalLabels.length > 0 && (
              <div className="absolute top-3 right-3 z-10 space-x-1">
                {clinic.promotionalLabels.slice(0, 2).map((label: string) => (
                  <Badge 
                    key={label}
                    className={`text-xs font-bold ${promotionalLabelStyles[label] || 'bg-gray-500 text-white'}`}
                  >
                    {promotionalLabelText[label] || label}
                  </Badge>
                ))}
              </div>
            )}

            {/* Clinic Image */}
            <div className="h-48 bg-gradient-to-br from-blue-50 to-blue-100 overflow-hidden">
              <img
                src={`https://images.unsplash.com/photo-${clinic.id.slice(0, 10)}?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300`}
                alt={clinic.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  if (clinic.logoUrl && !(e.target as HTMLImageElement).src.includes(clinic.logoUrl)) {
                    (e.target as HTMLImageElement).src = clinic.logoUrl;
                    (e.target as HTMLImageElement).className = "h-24 w-24 object-contain mx-auto mt-12";
                  } else {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300';
                  }
                }}
              />
            </div>

            {/* Clinic Info */}
            <div className="p-4">
              <h3 className="font-semibold text-lg text-gray-900 mb-2">
                {clinic.name}
              </h3>
              
              <div className="space-y-2 mb-3">
                <div className="flex items-center text-gray-600 text-sm">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{clinic.city.nameRu}</span>
                  {clinic.district && <span>, {clinic.district.nameRu}</span>}
                </div>
                
                {clinic.phone && (
                  <div className="flex items-center text-gray-600 text-sm">
                    <Phone className="h-4 w-4 mr-1" />
                    <span>{clinic.phone}</span>
                  </div>
                )}
              </div>

              {/* D-Score */}
              <div className="mb-3">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">D-Score</span>
                  <span className="font-semibold">{clinic.dScore}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      clinic.dScore >= 80 
                        ? 'bg-green-500' 
                        : clinic.dScore >= 60 
                          ? 'bg-yellow-500' 
                          : 'bg-red-500'
                    }`}
                    style={{ width: `${clinic.dScore}%` }}
                  ></div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClinicClick(clinic.slug);
                  }}
                >
                  Подробнее
                </Button>
                <Button
                  size="sm"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    onBookClick(clinic);
                  }}
                >
                  Записаться
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}