import { apiRequest } from '../client/src/lib/queryClient';

async function testServicesAPI() {
  try {
    console.log('🧪 Тестирование API услуг...');
    
    // Получаем список клиник
    const clinicsResponse = await apiRequest('GET', '/api/admin/clinics');
    const clinics = await clinicsResponse.json();
    
    if (clinics.length === 0) {
      console.log('❌ Нет клиник для тестирования');
      return;
    }
    
    const testClinic = clinics[0];
    console.log(`✅ Тестируем клинику: ${testClinic.nameRu} (ID: ${testClinic.id})`);
    
    // Тестируем получение услуг для русского языка
    console.log('📝 Тестируем получение услуг (ru)...');
    const servicesRuResponse = await apiRequest('GET', `/api/admin/clinics/${testClinic.id}/services?language=ru`);
    const servicesRu = await servicesRuResponse.json();
    console.log(`✅ Услуги (ru): ${servicesRu.length} шт.`);
    
    // Тестируем получение услуг для румынского языка
    console.log('📝 Тестируем получение услуг (ro)...');
    const servicesRoResponse = await apiRequest('GET', `/api/admin/clinics/${testClinic.id}/services?language=ro`);
    const servicesRo = await servicesRoResponse.json();
    console.log(`✅ Услуги (ro): ${servicesRo.length} шт.`);
    
    // Тестируем обновление услуг
    console.log('📝 Тестируем обновление услуг...');
    const testServices = {
      servicesRu: [
        { name: 'Консультация стоматолога', price: 200, currency: 'MDL' },
        { name: 'Лечение кариеса', price: 500, currency: 'MDL' }
      ],
      servicesRo: [
        { name: 'Consultație stomatologică', price: 200, currency: 'MDL' },
        { name: 'Tratament cariilor', price: 500, currency: 'MDL' }
      ]
    };
    
    const updateResponse = await apiRequest('PUT', `/api/admin/clinics/${testClinic.id}/services`, testServices);
    const updateResult = await updateResponse.json();
    console.log('✅ Обновление услуг:', updateResult);
    
    // Проверяем результат
    const finalServicesRuResponse = await apiRequest('GET', `/api/admin/clinics/${testClinic.id}/services?language=ru`);
    const finalServicesRu = await finalServicesRuResponse.json();
    console.log(`✅ Финальные услуги (ru): ${finalServicesRu.length} шт.`);
    
    const finalServicesRoResponse = await apiRequest('GET', `/api/admin/clinics/${testClinic.id}/services?language=ro`);
    const finalServicesRo = await finalServicesRoResponse.json();
    console.log(`✅ Финальные услуги (ro): ${finalServicesRo.length} шт.`);
    
    console.log('🎉 Тестирование завершено успешно!');
    
  } catch (error) {
    console.error('❌ Ошибка при тестировании:', error);
  }
}

testServicesAPI();
