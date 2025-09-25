const http = require('http');

async function checkProdWorkingHours() {
  console.log('🔍 Checking production server working hours...');
  
  // Замените на ваш продакшн URL
  const PROD_URL = 'https://clinici.md'; // или ваш домен
  
  try {
    // Получаем список всех клиник
    console.log('\n📋 Fetching all clinics...');
    const clinicsResponse = await makeRequest(`${PROD_URL}/api/clinics?limit=50`);
    
    console.log(`Found ${clinicsResponse.clinics.length} clinics`);
    
    // Проверяем рабочие часы первых 5 клиник
    console.log('\n🕐 Checking working hours for first 5 clinics:');
    
    for (let i = 0; i < Math.min(5, clinicsResponse.clinics.length); i++) {
      const clinic = clinicsResponse.clinics[i];
      console.log(`\n${i + 1}. ${clinic.nameRu} (${clinic.slug})`);
      
      try {
        // Получаем детали клиники с рабочими часами
        const clinicResponse = await makeRequest(`${PROD_URL}/api/clinics/${clinic.slug}`);
        
        if (clinicResponse.workingHours && clinicResponse.workingHours.length > 0) {
          console.log('   Working hours:');
          clinicResponse.workingHours.forEach(wh => {
            const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const dayName = dayNames[wh.dayOfWeek];
            if (wh.isOpen) {
              if (wh.is24Hours) {
                console.log(`     ${dayName}: 24 hours`);
              } else {
                console.log(`     ${dayName}: ${wh.openTime} - ${wh.closeTime}`);
              }
            } else {
              console.log(`     ${dayName}: Closed`);
            }
          });
        } else {
          console.log('   ❌ No working hours data');
        }
      } catch (error) {
        console.log(`   ❌ Error fetching clinic details: ${error.message}`);
      }
    }
    
    // Проверяем текущее время и какие клиники должны быть открыты
    console.log('\n🕐 Current time analysis:');
    const now = new Date();
    console.log(`   Current time: ${now.toISOString()}`);
    console.log(`   Local time: ${now.toLocaleString()}`);
    console.log(`   Day of week: ${now.getDay()} (0=Sunday, 1=Monday, etc.)`);
    console.log(`   Time: ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

checkProdWorkingHours();
