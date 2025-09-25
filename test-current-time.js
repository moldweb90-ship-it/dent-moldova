// Тест текущего времени - 09:06
console.log('=== ТЕСТ ТЕКУЩЕГО ВРЕМЕНИ (09:06) ===');

function testCurrentTime() {
  const now = new Date();
  
  console.log('🕐 Текущее время:');
  console.log(`   UTC: ${now.toISOString()}`);
  console.log(`   Локальное: ${now.toLocaleString()}`);
  console.log(`   Часовой пояс: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`);
  
  // Moldova время (UTC+2)
  const moldovaTime = new Date(now.getTime() + (2 * 60 * 60 * 1000));
  console.log(`   Молдова (UTC+2): ${moldovaTime.toLocaleString()}`);
  
  // Проверяем, что сервер должен показывать
  const serverDay = moldovaTime.getDay();
  const serverTime = `${moldovaTime.getHours().toString().padStart(2, '0')}:${moldovaTime.getMinutes().toString().padStart(2, '0')}`;
  
  console.log('\n🏥 Что должен показывать сервер:');
  console.log(`   День недели: ${serverDay} (0=воскресенье, 4=четверг)`);
  console.log(`   Время: ${serverTime}`);
  
  // Рабочие часы клиники
  const workingHours = [
    { dayOfWeek: 4, isOpen: true, openTime: '09:00', closeTime: '18:00', is24Hours: false } // Четверг
  ];
  
  const todayHours = workingHours.filter(wh => wh.dayOfWeek === serverDay);
  
  if (todayHours.length > 0) {
    const isOpen = serverTime >= '09:00' && serverTime <= '18:00';
    console.log(`   Клиника должна быть: ${isOpen ? '✅ ОТКРЫТА' : '❌ ЗАКРЫТА'}`);
    console.log(`   Рабочие часы: ${todayHours[0].openTime}-${todayHours[0].closeTime}`);
  } else {
    console.log('   ❌ Нет рабочих часов на сегодня');
  }
}

testCurrentTime();
