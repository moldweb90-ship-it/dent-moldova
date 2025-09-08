import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { clinics } from '../shared/schema';
import { eq } from 'drizzle-orm';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/clinici_md';
const client = postgres(connectionString);
const db = drizzle(client);

async function checkClinicSEO() {
  try {
    console.log('🔍 Проверяем SEO данные клиники "doktor-romanyuk"...\n');
    
    const clinic = await db.select().from(clinics).where(eq(clinics.slug, 'doktor-romanyuk'));
    
    if (clinic.length === 0) {
      console.log('❌ Клиника "doktor-romanyuk" не найдена');
      return;
    }
    
    const clinicData = clinic[0];
    console.log('✅ Клиника найдена:', clinicData.name);
    console.log('\n📊 SEO данные:');
    console.log('seoTitle:', clinicData.seoTitle || '❌ НЕ УСТАНОВЛЕНО');
    console.log('seoDescription:', clinicData.seoDescription || '❌ НЕ УСТАНОВЛЕНО');
    console.log('seoKeywords:', clinicData.seoKeywords || '❌ НЕ УСТАНОВЛЕНО');
    console.log('seoH1:', clinicData.seoH1 || '❌ НЕ УСТАНОВЛЕНО');
    console.log('ogTitle:', clinicData.ogTitle || '❌ НЕ УСТАНОВЛЕНО');
    console.log('ogDescription:', clinicData.ogDescription || '❌ НЕ УСТАНОВЛЕНО');
    console.log('ogImage:', clinicData.ogImage || '❌ НЕ УСТАНОВЛЕНО');
    console.log('seoCanonical:', clinicData.seoCanonical || '❌ НЕ УСТАНОВЛЕНО');
    console.log('seoRobots:', clinicData.seoRobots || '❌ НЕ УСТАНОВЛЕНО');
    console.log('seoSchemaType:', clinicData.seoSchemaType || '❌ НЕ УСТАНОВЛЕНО');
    console.log('seoSchemaData:', clinicData.seoSchemaData || '❌ НЕ УСТАНОВЛЕНО');
    
    console.log('\n🔧 Если SEO данные не установлены, их нужно добавить через админ-панель');
    
  } catch (error) {
    console.error('❌ Ошибка при проверке SEO данных:', error);
  } finally {
    await client.end();
  }
}

checkClinicSEO();
