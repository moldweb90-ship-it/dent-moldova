import { db } from '../server/db';
import { clinics } from '@shared/schema';

async function checkClinicNames() {
  try {
    console.log('🔍 Checking clinic names in database...');
    
    const allClinics = await db.select({
      id: clinics.id,
      nameRu: clinics.nameRu,
      nameRo: clinics.nameRo,
      slug: clinics.slug
    }).from(clinics);
    
    console.log(`📊 Found ${allClinics.length} clinics`);
    
    // Check for empty names
    const emptyNames = allClinics.filter(clinic => 
      !clinic.nameRu || !clinic.nameRo || 
      clinic.nameRu.trim() === '' || clinic.nameRo.trim() === ''
    );
    
    if (emptyNames.length > 0) {
      console.log('❌ Clinics with empty names:');
      emptyNames.forEach(clinic => {
        console.log(`  - ID: ${clinic.id}, Slug: ${clinic.slug}`);
        console.log(`    nameRu: "${clinic.nameRu}"`);
        console.log(`    nameRo: "${clinic.nameRo}"`);
      });
    } else {
      console.log('✅ All clinics have names');
    }
    
    // Show first 5 clinics as sample
    console.log('\n📋 Sample clinics:');
    allClinics.slice(0, 5).forEach(clinic => {
      console.log(`  - ${clinic.nameRu} / ${clinic.nameRo} (${clinic.slug})`);
    });
    
  } catch (error) {
    console.error('❌ Error checking clinic names:', error);
  } finally {
    process.exit(0);
  }
}

checkClinicNames();
