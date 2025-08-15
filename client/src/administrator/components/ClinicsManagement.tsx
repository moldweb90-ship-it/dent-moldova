import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  MapPin, 
  Phone,
  Globe,
  Star,
  Award,
  Clock
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { ClinicForm } from './ClinicForm';

interface Clinic {
  id: string;
  slug: string;
  name: string;
  logoUrl?: string;
  city: { nameRu: string; nameRo: string };
  district?: { nameRu: string; nameRo: string };
  address?: string;
  phone?: string;
  website?: string;
  verified: boolean;
  cnam: boolean;
  availToday: boolean;
  dScore: number;
  createdAt: string;
  updatedAt: string;
}

export function ClinicsManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingClinic, setEditingClinic] = useState<Clinic | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: clinicsData, isLoading } = useQuery({
    queryKey: ['/api/admin/clinics', { q: searchQuery }],
    queryFn: () => apiRequest(`/api/admin/clinics?q=${searchQuery}`)
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/admin/clinics/${id}`, {
      method: 'DELETE'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/clinics'] });
      toast({
        title: 'Клиника удалена',
        description: 'Клиника была успешно удалена из системы'
      });
    },
    onError: () => {
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить клинику',
        variant: 'destructive'
      });
    }
  });

  const handleDelete = (clinic: Clinic) => {
    if (window.confirm(`Вы уверены, что хотите удалить клинику "${clinic.name}"?`)) {
      deleteMutation.mutate(clinic.id);
    }
  };

  const clinics = clinicsData?.clinics || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Управление клиниками</h1>
        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Добавить клинику
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Поиск клиник..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clinics List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading ? (
          [...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : clinics.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? 'Клиники не найдены' : 'Нет клиник'}
            </h3>
            <p className="text-gray-600">
              {searchQuery 
                ? 'Попробуйте изменить поисковый запрос'
                : 'Добавьте первую клинику в систему'
              }
            </p>
          </div>
        ) : (
          clinics.map((clinic: Clinic) => (
            <Card key={clinic.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg font-bold text-gray-900 truncate">
                      {clinic.name}
                    </CardTitle>
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                      <MapPin className="h-3 w-3 mr-1" />
                      {clinic.city.nameRu}
                      {clinic.district && `, ${clinic.district.nameRu}`}
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    {clinic.verified && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        <Award className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                    {clinic.cnam && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        CNAM
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* D-Score */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">D-Score</span>
                    <div className="flex items-center">
                      <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all"
                          style={{ width: `${clinic.dScore}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-bold">{clinic.dScore}</span>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2 text-sm">
                    {clinic.phone && (
                      <div className="flex items-center text-gray-600">
                        <Phone className="h-3 w-3 mr-2" />
                        {clinic.phone}
                      </div>
                    )}
                    {clinic.website && (
                      <div className="flex items-center text-gray-600">
                        <Globe className="h-3 w-3 mr-2" />
                        <span className="truncate">{clinic.website}</span>
                      </div>
                    )}
                  </div>

                  {/* Status */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center">
                      {clinic.availToday ? (
                        <span className="text-green-600 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          Доступно сегодня
                        </span>
                      ) : (
                        <span className="text-gray-500 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          Недоступно
                        </span>
                      )}
                    </div>
                    <span className="text-gray-500">
                      {new Date(clinic.createdAt).toLocaleDateString('ru-RU')}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2 pt-2 border-t border-gray-100">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => window.open(`/clinics/${clinic.slug}`, '_blank')}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Просмотр
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingClinic(clinic)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDelete(clinic)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Добавить новую клинику</DialogTitle>
          </DialogHeader>
          <ClinicForm
            onSuccess={() => {
              setIsCreateModalOpen(false);
              queryClient.invalidateQueries({ queryKey: ['/api/admin/clinics'] });
            }}
            onCancel={() => setIsCreateModalOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={!!editingClinic} onOpenChange={() => setEditingClinic(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Редактировать клинику</DialogTitle>
          </DialogHeader>
          {editingClinic && (
            <ClinicForm
              clinic={editingClinic}
              onSuccess={() => {
                setEditingClinic(null);
                queryClient.invalidateQueries({ queryKey: ['/api/admin/clinics'] });
              }}
              onCancel={() => setEditingClinic(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}