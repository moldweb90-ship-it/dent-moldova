const http = require('http');

// Функция для создания запроса с информацией о времени клиента
function createTimeRequest(url, description) {
  return new Promise((resolve, reject) => {
    // Получаем время клиента
    const clientTime = new Date().toISOString();
    const clientTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const clientTimezoneOffset = new Date().getTimezoneOffset();
    
    const fullUrl = `${url}&clientTime=${encodeURIComponent(clientTime)}&clientTimezone=${encodeURIComponent(clientTimezone)}&clientTimezoneOffset=${clientTimezoneOffset}`;
    
    console.log(`\n🕐 ${description}`);
    console.log(`   Client time: ${clientTime}`);
    console.log(`   Client timezone: ${clientTimezone}`);
    console.log(`   Client timezone offset: ${clientTimezoneOffset} minutes`);
    console.log(`   Request URL: ${fullUrl}`);
    
    const req = http.get(fullUrl, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log(`   ✅ Response: ${result.clinics.length} clinics found`);
          resolve(result);
        } catch (error) {
          console.error(`   ❌ Parse error: ${error.message}`);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error(`   ❌ Request error: ${error.message}`);
      reject(error);
    });

    req.setTimeout(10000, () => {
      console.error(`   ❌ Timeout`);
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

async function checkTimeIssues() {
  console.log('🔍 Checking time-related issues...');
  
  // Замените на ваш продакшн URL
  const PROD_URL = 'https://clinici.md'; // или ваш домен
  
  try {
    // Тест 1: Локальный сервер
    console.log('\n📍 LOCAL SERVER:');
    await createTimeRequest('http://localhost:5000/api/clinics?openNow=true&limit=3', 'Local server test');
    
    // Тест 2: Продакшн сервер
    console.log('\n📍 PRODUCTION SERVER:');
    await createTimeRequest(`${PROD_URL}/api/clinics?openNow=true&limit=3`, 'Production server test');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

checkTimeIssues();
