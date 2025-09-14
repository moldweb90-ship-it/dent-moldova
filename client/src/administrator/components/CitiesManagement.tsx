import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  MapPin, 
  Plus, 
  Building2, 
  Edit, 
  Trash2, 
  Search,
  Globe,
  GripVertical
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface City {
  id: string;
  nameRu: string;
  nameRo: string;
  sortOrder?: number;
  createdAt: string;
  districts?: District[];
}

interface District {
  id: string;
  nameRu: string;
  nameRo: string;
  cityId: string;
}

export function CitiesManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCity, setEditingCity] = useState<City | null>(null);
  const [editingDistrict, setEditingDistrict] = useState<District & { cityId: string } | null>(null);
  const [creatingDistrict, setCreatingDistrict] = useState<City | null>(null);
  const [localCities, setLocalCities] = useState<City[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch cities with districts
  const { data: citiesData, isLoading } = useQuery({
    queryKey: ['/api/admin/cities'],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/admin/cities?q=${searchQuery}`);
      return response.json();
    },
    refetchOnWindowFocus: false,
    staleTime: 0,
    gcTime: 0
  });

  // Обновляем локальное состояние при изменении данных
  useEffect(() => {
    if (citiesData?.cities) {
      setLocalCities(citiesData.cities);
    }
  }, [citiesData]);

  // Create city mutation
  const createMutation = useMutation({
    mutationFn: (city: { nameRu: string; nameRo: string }) => 
      apiRequest('POST', '/api/admin/cities', city),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/cities'] });
      toast({
        title: 'Город добавлен',
        description: 'Город был успешно добавлен в систему'
      });
      setIsCreateModalOpen(false);
    },
    onError: () => {
      toast({
        title: 'Ошибка',
        description: 'Не удалось добавить город',
        variant: 'destructive'
      });
    }
  });

  // Update city mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, city }: { id: string; city: { nameRu: string; nameRo: string } }) => 
      apiRequest('PUT', `/api/admin/cities/${id}`, city),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/cities'] });
      toast({
        title: 'Город обновлен',
        description: 'Город был успешно обновлен'
      });
      setEditingCity(null);
    },
    onError: () => {
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить город',
        variant: 'destructive'
      });
    }
  });

  // Delete city mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/admin/cities/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/cities'] });
      toast({
        title: 'Город удален',
        description: 'Город был успешно удален из системы'
      });
    },
    onError: () => {
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить город',
        variant: 'destructive'
      });
    }
  });

  // Update city sort order mutation
  const updateSortOrderMutation = useMutation({
    mutationFn: ({ id, sortOrder }: { id: string; sortOrder: number }) => 
      apiRequest('PUT', `/api/admin/cities/${id}/sort-order`, { sortOrder }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/cities'] });
    },
    onError: () => {
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить порядок сортировки',
        variant: 'destructive'
      });
    }
  });

  // District mutations
  const createDistrictMutation = useMutation({
    mutationFn: async ({ cityId, district }: { cityId: string; district: { nameRu: string; nameRo: string } }) => {
      const response = await apiRequest('POST', `/api/admin/cities/${cityId}/districts`, district);
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Обновляем локальное состояние
      setLocalCities(prev => prev.map(city => {
        if (city.id === variables.cityId) {
          const newDistrict = {
            id: data.id,
            nameRu: data.nameRu,
            nameRo: data.nameRo,
            cityId: data.cityId
          };
          return {
            ...city,
            districts: [...(city.districts || []), newDistrict]
          };
        }
        return city;
      }));
      
      toast({
        title: 'Район добавлен',
        description: 'Район был успешно добавлен'
      });
      setCreatingDistrict(null);
    },
    onError: () => {
      toast({
        title: 'Ошибка',
        description: 'Не удалось добавить район',
        variant: 'destructive'
      });
    }
  });

  const updateDistrictMutation = useMutation({
    mutationFn: async ({ id, district }: { id: string; district: { nameRu: string; nameRo: string } }) => {
      const response = await apiRequest('PUT', `/api/admin/districts/${id}`, district);
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Обновляем локальное состояние
      setLocalCities(prev => prev.map(city => ({
        ...city,
        districts: city.districts?.map(d => 
          d.id === variables.id 
            ? { ...d, nameRu: data.nameRu, nameRo: data.nameRo }
            : d
        ) || []
      })));
      
      toast({
        title: 'Район обновлен',
        description: 'Район был успешно обновлен'
      });
      setEditingDistrict(null);
    },
    onError: () => {
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить район',
        variant: 'destructive'
      });
    }
  });

  const deleteDistrictMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('DELETE', `/api/admin/districts/${id}`);
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Обновляем локальное состояние
      setLocalCities(prev => prev.map(city => ({
        ...city,
        districts: city.districts?.filter(d => d.id !== variables) || []
      })));
      
      toast({
        title: 'Район удален',
        description: 'Район был успешно удален'
      });
    },
    onError: () => {
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить район',
        variant: 'destructive'
      });
    }
  });

  const handleCreateCity = (formData: { nameRu: string; nameRo: string }) => {
    createMutation.mutate(formData);
  };

  const handleUpdateCity = (id: string, formData: { nameRu: string; nameRo: string }) => {
    updateMutation.mutate({ id, city: formData });
  };

  const handleDelete = (city: City) => {
    if (window.confirm(`Вы уверены, что хотите удалить город "${city.nameRu}"?`)) {
      deleteMutation.mutate(city.id);
    }
  };

  const handleCreateDistrict = (formData: { nameRu: string; nameRo: string }) => {
    if (creatingDistrict) {
      createDistrictMutation.mutate({ cityId: creatingDistrict.id, district: formData });
    }
  };

  const handleUpdateDistrict = (id: string, formData: { nameRu: string; nameRo: string }) => {
    updateDistrictMutation.mutate({ id, district: formData });
  };

  const handleDeleteDistrict = (district: District) => {
    if (window.confirm(`Вы уверены, что хотите удалить район "${district.nameRu}"?`)) {
      deleteDistrictMutation.mutate(district.id);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = localCities.findIndex((city) => city.id === active.id);
      const newIndex = localCities.findIndex((city) => city.id === over.id);

      const newCities = arrayMove(localCities, oldIndex, newIndex);
      setLocalCities(newCities);

      // Update sort order for all affected cities
      newCities.forEach((city, index) => {
        const newSortOrder = index + 1;
        if (city.sortOrder !== newSortOrder) {
          updateSortOrderMutation.mutate({ id: city.id, sortOrder: newSortOrder });
        }
      });
    }
  };

  const cities = localCities;
  const totalDistricts = cities.reduce((sum: number, city: City) => 
    sum + (city.districts?.length || 0), 0
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Управление городами</h1>
        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Добавить город
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Городов</p>
                <p className="text-2xl font-bold text-gray-900">{cities.length}</p>
              </div>
              <MapPin className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Районов</p>
                <p className="text-2xl font-bold text-gray-900">{totalDistricts}</p>
              </div>
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Активных</p>
                <p className="text-2xl font-bold text-gray-900">{cities.length}</p>
              </div>
              <MapPin className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Поиск городов..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cities List */}
      <Card>
        <CardHeader>
          <CardTitle>Список городов</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-center space-x-4">
                  <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : cities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Города не найдены</p>
              <p className="text-sm">Добавьте первый город в систему</p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={cities.map(city => city.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-4">
                  {cities.map((city: City) => (
                    <SortableCityItem
                      key={city.id}
                      city={city}
                      onEdit={() => setEditingCity(city)}
                      onDelete={() => handleDelete(city)}
                      onEditDistrict={(district) => setEditingDistrict({ ...district, cityId: city.id })}
                      onDeleteDistrict={handleDeleteDistrict}
                      onCreateDistrict={() => setCreatingDistrict(city)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </CardContent>
      </Card>

      {/* Create City Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить новый город</DialogTitle>
          </DialogHeader>
          <CityForm
            onSubmit={handleCreateCity}
            onCancel={() => setIsCreateModalOpen(false)}
            loading={createMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit City Modal */}
      <Dialog open={!!editingCity} onOpenChange={() => setEditingCity(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать город</DialogTitle>
          </DialogHeader>
          {editingCity && (
            <CityForm
              city={editingCity}
              onSubmit={(data) => handleUpdateCity(editingCity.id, data)}
              onCancel={() => setEditingCity(null)}
              loading={updateMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Create District Modal */}
      <Dialog open={!!creatingDistrict} onOpenChange={() => setCreatingDistrict(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить район в {creatingDistrict?.nameRu}</DialogTitle>
          </DialogHeader>
          {creatingDistrict && (
            <DistrictForm
              onSubmit={handleCreateDistrict}
              onCancel={() => setCreatingDistrict(null)}
              loading={createDistrictMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit District Modal */}
      <Dialog open={!!editingDistrict} onOpenChange={() => setEditingDistrict(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать район</DialogTitle>
          </DialogHeader>
          {editingDistrict && (
            <DistrictForm
              district={editingDistrict}
              onSubmit={(data) => handleUpdateDistrict(editingDistrict.id, data)}
              onCancel={() => setEditingDistrict(null)}
              loading={updateDistrictMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// City Form Component
interface CityFormProps {
  city?: City;
  onSubmit: (data: { nameRu: string; nameRo: string }) => void;
  onCancel: () => void;
  loading?: boolean;
}

function CityForm({ city, onSubmit, onCancel, loading }: CityFormProps) {
  const [nameRu, setNameRu] = useState(city?.nameRu || '');
  const [nameRo, setNameRo] = useState(city?.nameRo || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nameRu.trim() && nameRo.trim()) {
      onSubmit({ nameRu: nameRu.trim(), nameRo: nameRo.trim() });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Название на русском
        </label>
        <Input
          value={nameRu}
          onChange={(e) => setNameRu(e.target.value)}
          placeholder="Кишинёв"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Название на румынском
        </label>
        <Input
          value={nameRo}
          onChange={(e) => setNameRo(e.target.value)}
          placeholder="Chișinău"
          required
        />
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Отмена
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Сохранение...' : city ? 'Обновить' : 'Добавить'}
        </Button>
      </div>
    </form>
  );
}

// District Form Component
interface DistrictFormProps {
  district?: District & { cityId: string };
  onSubmit: (data: { nameRu: string; nameRo: string }) => void;
  onCancel: () => void;
  loading?: boolean;
}

function DistrictForm({ district, onSubmit, onCancel, loading }: DistrictFormProps) {
  const [nameRu, setNameRu] = useState(district?.nameRu || '');
  const [nameRo, setNameRo] = useState(district?.nameRo || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nameRu.trim() && nameRo.trim()) {
      onSubmit({ nameRu: nameRu.trim(), nameRo: nameRo.trim() });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Название на русском
        </label>
        <Input
          value={nameRu}
          onChange={(e) => setNameRu(e.target.value)}
          placeholder="Центр"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Название на румынском
        </label>
        <Input
          value={nameRo}
          onChange={(e) => setNameRo(e.target.value)}
          placeholder="Centru"
          required
        />
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Отмена
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Сохранение...' : district ? 'Обновить' : 'Добавить'}
        </Button>
      </div>
    </form>
  );
}

// Sortable City Item Component
interface SortableCityItemProps {
  city: City;
  onEdit: () => void;
  onDelete: () => void;
  onEditDistrict: (district: District) => void;
  onDeleteDistrict: (district: District) => void;
  onCreateDistrict: () => void;
}

function SortableCityItem({ 
  city, 
  onEdit, 
  onDelete, 
  onEditDistrict, 
  onDeleteDistrict, 
  onCreateDistrict 
}: SortableCityItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: city.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className="border rounded-lg overflow-hidden bg-white"
    >
      {/* City Header */}
      <div className="flex items-center justify-between p-4 hover:bg-gray-50">
        <div className="flex items-center space-x-4">
          <div 
            {...attributes} 
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-200 rounded"
          >
            <GripVertical className="h-4 w-4 text-gray-400" />
          </div>
          <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
            <MapPin className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{city.nameRu}</h3>
            <p className="text-sm text-gray-600">{city.nameRo}</p>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant="secondary" className="text-xs">
                {city.districts?.length || 0} районов
              </Badge>
              <span className="text-xs text-gray-500">
                {new Date(city.createdAt).toLocaleDateString('ru-RU')}
              </span>
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onEdit}
          >
            <Edit className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={onDelete}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
      
      {/* Districts List */}
      {city.districts && city.districts.length > 0 && (
        <div className="border-t bg-gray-50 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {city.districts.map((district) => (
              <div 
                key={district.id} 
                className="flex items-center justify-between p-3 bg-white rounded-lg border hover:bg-gray-50 cursor-pointer"
                onClick={() => onEditDistrict(district)}
              >
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Building2 className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm">{district.nameRu}</h4>
                    <p className="text-xs text-gray-600">{district.nameRo}</p>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditDistrict(district);
                    }}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 text-red-400 hover:text-red-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteDistrict(district);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Add District Button */}
      <div className="border-t bg-gray-50 p-4">
        <Button
          size="sm"
          variant="outline"
          className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          onClick={onCreateDistrict}
        >
          <Plus className="h-4 w-4 mr-2" />
          Добавить район в {city.nameRu}
        </Button>
      </div>
    </div>
  );
}