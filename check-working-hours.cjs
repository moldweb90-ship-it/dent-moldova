const { db } = require('./server/db');
const { workingHours, clinics } = require('./shared/schema');

async function checkWorkingHours() {
  console.log('🔍 Checking working hours data...');
  
  // Get all clinics
  const allClinics = await db.select().from(clinics);
  console.log(`Total clinics: ${allClinics.length}`);
  
  // Get all working hours
  const allWorkingHours = await db.select().from(workingHours);
  console.log(`Total working hours records: ${allWorkingHours.length}`);
  
  // Check which clinics have working hours
  const clinicsWithHours = new Set(allWorkingHours.map(wh => wh.clinicId));
  console.log(`Clinics with working hours: ${clinicsWithHours.size}`);
  
  // Show working hours for each clinic
  for (const clinic of allClinics) {
    const clinicHours = allWorkingHours.filter(wh => wh.clinicId === clinic.id);
    console.log(`\n🏥 ${clinic.nameRu}:`);
    console.log(`  - Working hours records: ${clinicHours.length}`);
    
    if (clinicHours.length > 0) {
      clinicHours.forEach(wh => {
        console.log(`    Day ${wh.dayOfWeek}: ${wh.isOpen ? 'OPEN' : 'CLOSED'} ${wh.openTime || ''} - ${wh.closeTime || ''} ${wh.is24Hours ? '(24/7)' : ''}`);
      });
    } else {
      console.log(`    ❌ NO WORKING HOURS DATA`);
    }
  }
  
  process.exit(0);
}

checkWorkingHours().catch(console.error);
