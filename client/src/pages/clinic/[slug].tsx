import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { useLocation } from 'wouter';
import { ClinicDetail } from '../../components/ClinicDetail';
import { Button } from '@/components/ui/button';

export default function ClinicPage() {
  const { slug } = useParams();
  const [, setLocation] = useLocation();

  const { data: clinic, isLoading, error } = useQuery({
    queryKey: ['/api/clinics', slug],
    enabled: !!slug,
  });

  const handleBookClick = (clinic: any) => {
    console.log('Book appointment for:', clinic.name);
    alert(`Запись в ${clinic.name} будет доступна в полной версии приложения`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка информации о клинике...</p>
        </div>
      </div>
    );
  }

  if (error || !clinic) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Клиника не найдена</h1>
          <Button onClick={() => setLocation('/')} className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Вернуться к каталогу</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button 
          onClick={() => setLocation('/')} 
          variant="outline"
          className="mb-6 flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Вернуться к каталогу</span>
        </Button>

        <ClinicDetail
          clinic={clinic}
          open={true}
          onClose={() => setLocation('/')}
          onBookClick={handleBookClick}
        />
      </div>
    </div>
  );
}
