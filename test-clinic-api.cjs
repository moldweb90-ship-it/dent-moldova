const fetch = require('node-fetch');

async function testClinicAPI() {
  try {
    const response = await fetch('http://localhost:5000/api/clinics/life-dental-cecani?language=ru');
    const data = await response.json();
    
    console.log('API Response:');
    console.log('Clinic name:', data.name);
    console.log('Working hours count:', data.workingHours?.length || 0);
    console.log('Working hours:', data.workingHours);
    
    if (data.workingHours && data.workingHours.length > 0) {
      console.log('\nWorking hours details:');
      data.workingHours.forEach((wh, index) => {
        console.log(`${index + 1}. Day ${wh.dayOfWeek}: ${wh.isOpen ? 'Open' : 'Closed'} ${wh.openTime}-${wh.closeTime}`);
      });
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testClinicAPI();
