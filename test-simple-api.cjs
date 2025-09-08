const http = require('http');

function testAPI() {
  return new Promise((resolve, reject) => {
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
          console.log('📊 Full clinic data from API:');
          console.log(JSON.stringify(clinic, null, 2));
          
          console.log('\n🔍 Price policy fields:');
          console.log('  - publishedPricing:', clinic.publishedPricing);
          console.log('  - freeConsultation:', clinic.freeConsultation);
          console.log('  - interestFreeInstallment:', clinic.interestFreeInstallment);
          console.log('  - implantWarranty:', clinic.implantWarranty);
          console.log('  - popularServicesPromotions:', clinic.popularServicesPromotions);
          console.log('  - onlinePriceCalculator:', clinic.onlinePriceCalculator);
          console.log('  - priceIndex:', clinic.priceIndex);
          
          console.log('\n🔍 Access fields:');
          console.log('  - onlineBooking:', clinic.onlineBooking);
          console.log('  - weekendWork:', clinic.weekendWork);
          console.log('  - eveningWork:', clinic.eveningWork);
          console.log('  - urgentCare:', clinic.urgentCare);
          console.log('  - convenientLocation:', clinic.convenientLocation);
          console.log('  - accessIndex:', clinic.accessIndex);
          
          resolve(clinic);
        } catch (error) {
          console.error('❌ Error parsing response:', error);
          console.log('Raw response:', data);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request error:', error);
      reject(error);
    });

    req.end();
  });
}

testAPI().catch(console.error);






