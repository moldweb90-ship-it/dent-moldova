const http = require('http');

// Замените на ваш продакшн URL
const PROD_URL = 'https://clinici.md'; // или ваш домен

async function checkProdServer() {
  console.log('🔍 Checking production server...');
  
  // Тест 1: Проверяем время сервера
  console.log('\n1️⃣ Testing server time...');
  await makeRequest(`${PROD_URL}/api/clinics?limit=1`, 'Basic request');
  
  // Тест 2: Проверяем фильтр openNow=true
  console.log('\n2️⃣ Testing openNow=true...');
  await makeRequest(`${PROD_URL}/api/clinics?openNow=true&limit=5`, 'openNow=true');
  
  // Тест 3: Проверяем фильтр openNow=false
  console.log('\n3️⃣ Testing openNow=false...');
  await makeRequest(`${PROD_URL}/api/clinics?openNow=false&limit=5`, 'openNow=false');
  
  // Тест 4: Проверяем без фильтра
  console.log('\n4️⃣ Testing without openNow...');
  await makeRequest(`${PROD_URL}/api/clinics?limit=5`, 'No openNow filter');
}

function makeRequest(url, description) {
  return new Promise((resolve, reject) => {
    console.log(`   📡 ${description}`);
    console.log(`   URL: ${url}`);
    
    const req = http.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log(`   ✅ Result: ${result.clinics.length} clinics`);
          if (result.clinics.length > 0) {
            console.log(`   First clinic: ${result.clinics[0].nameRu}`);
          }
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

checkProdServer().catch(console.error);
