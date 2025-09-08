import { db } from '../server/db';
import { clinics } from '../shared/schema';

async function checkPromotionalLabels() {
  console.log('🔍 Checking promotional labels in database...');
  
  const allClinics = await db.select({
    id: clinics.id,
    name: clinics.name,
    promotionalLabels: clinics.promotionalLabels
  }).from(clinics);
  
  console.log(`📊 Found ${allClinics.length} clinics`);
  
  const clinicsWithLabels = allClinics.filter(clinic => 
    clinic.promotionalLabels && clinic.promotionalLabels.length > 0
  );
  
  console.log(`🏷️ Clinics with promotional labels: ${clinicsWithLabels.length}`);
  
  clinicsWithLabels.forEach(clinic => {
    console.log(`  - ${clinic.name}: [${clinic.promotionalLabels.join(', ')}]`);
  });
  
  const clinicsWithoutLabels = allClinics.filter(clinic => 
    !clinic.promotionalLabels || clinic.promotionalLabels.length === 0
  );
  
  console.log(`❌ Clinics without promotional labels: ${clinicsWithoutLabels.length}`);
  
  if (clinicsWithoutLabels.length > 0) {
    console.log('Clinics without labels:');
    clinicsWithoutLabels.slice(0, 5).forEach(clinic => {
      console.log(`  - ${clinic.name}`);
    });
    if (clinicsWithoutLabels.length > 5) {
      console.log(`  ... and ${clinicsWithoutLabels.length - 5} more`);
    }
  }
}

checkPromotionalLabels().catch(console.error);
