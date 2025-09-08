const https = require('https');
const http = require('http');

async function testAPI() {
  try {
    console.log('🔍 Testing API for price policy fields...');
    
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/admin/clinics/50700388-9022-46bf-ace0-8e2335b744bb',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const clinic = JSON.parse(data);
          console.log('📊 Clinic data from API:');
          console.log('  - publishedPricing:', clinic.publishedPricing);
          console.log('  - freeConsultation:', clinic.freeConsultation);
          console.log('  - interestFreeInstallment:', clinic.interestFreeInstallment);
          console.log('  - implantWarranty:', clinic.implantWarranty);
          console.log('  - popularServicesPromotions:', clinic.popularServicesPromotions);
          console.log('  - onlinePriceCalculator:', clinic.onlinePriceCalculator);
          console.log('  - priceIndex:', clinic.priceIndex);
        } catch (error) {
          console.error('❌ Error parsing response:', error);
          console.log('Raw response:', data);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request error:', error);
    });

    req.end();
    
  } catch (error) {
    console.error('❌ Error testing API:', error);
  }
}

testAPI();






