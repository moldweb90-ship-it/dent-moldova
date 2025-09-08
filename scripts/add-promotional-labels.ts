import { db } from '../server/db';
import { clinics } from '../shared/schema';
import { eq } from 'drizzle-orm';

async function addPromotionalLabels() {
  console.log('🔍 Adding promotional labels to clinics...');
  
  // Обновляем клиники с разными лейблами для тестирования
  const updates = [
    {
      name: 'Life Dental Ciocana',
      labels: ['fast_service', 'high_rating']
    },
    {
      name: 'Prim Dent',
      labels: ['verified_plus', 'new']
    },
    {
      name: 'Nobil Dent',
      labels: ['top', 'discount']
    }
  ];
  
  for (const update of updates) {
    const [clinic] = await db
      .update(clinics)
      .set({ promotionalLabels: update.labels })
      .where(eq(clinics.name, update.name))
      .returning();
    
    if (clinic) {
      console.log(`✅ Updated ${clinic.name} with labels: [${update.labels.join(', ')}]`);
    } else {
      console.log(`❌ Clinic not found: ${update.name}`);
    }
  }
  
  console.log('🎉 Promotional labels added successfully!');
}

addPromotionalLabels().catch(console.error);
