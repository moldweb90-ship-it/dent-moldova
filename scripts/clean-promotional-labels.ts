import { db } from '../server/db';
import { clinics } from '../shared/schema';
import { eq } from 'drizzle-orm';

async function cleanPromotionalLabels() {
  console.log('🧹 Cleaning promotional labels from database...');
  
  // Получаем все клиники
  const allClinics = await db.select({
    id: clinics.id,
    name: clinics.name,
    promotionalLabels: clinics.promotionalLabels
  }).from(clinics);
  
  console.log(`📊 Found ${allClinics.length} clinics`);
  
  // Лейблы, которые нужно удалить
  const labelsToRemove = ['top', 'verified_plus', 'fast_service'];
  
  for (const clinic of allClinics) {
    if (clinic.promotionalLabels && clinic.promotionalLabels.length > 0) {
      const originalLabels = [...clinic.promotionalLabels];
      const cleanedLabels = clinic.promotionalLabels.filter(label => !labelsToRemove.includes(label));
      
      if (cleanedLabels.length !== originalLabels.length) {
        console.log(`🧹 Cleaning ${clinic.name}: [${originalLabels.join(', ')}] → [${cleanedLabels.join(', ')}]`);
        
        await db
          .update(clinics)
          .set({ promotionalLabels: cleanedLabels })
          .where(eq(clinics.id, clinic.id));
      }
    }
  }
  
  console.log('✅ Promotional labels cleaned successfully!');
}

cleanPromotionalLabels().catch(console.error);
