// Скрипт для исправления румынских SEO данных
const { db } = require('./server/db');
const { clinics } = require('./shared/schema');
const { eq } = require('drizzle-orm');

async function fixRomanianSEO() {
  try {
    console.log('🔧 Исправляем румынские SEO данные для клиники Life Dental Чеканы...');
    
    const clinicId = '50700388-9022-46bf-ace0-8e2335b744bb';
    
    // Обновляем румынские SEO поля
    const [updatedClinic] = await db
      .update(clinics)
      .set({
        seoTitleRo: 'Life Dental Ciocana - clinică stomatologică în Chișinău',
        seoDescriptionRo: 'Life Dental Ciocana - clinică modernă de stomatologie în Chișinău. Programare online, consultație gratuită. Tratament dentar de calitate.',
        seoKeywordsRo: 'stomatologie, tratament dentar, dentist, Chișinău, clinică stomatologică, implanturi dentare, ortodonție',
        seoH1Ro: 'Life Dental Ciocana - clinică stomatologică',
        ogTitleRo: 'Life Dental Ciocana - clinică stomatologică în Chișinău',
        ogDescriptionRo: 'Life Dental Ciocana - clinică modernă de stomatologie în Chișinău. Programare online, consultație gratuită.',
        updatedAt: new Date()
      })
      .where(eq(clinics.id, clinicId))
      .returning();
    
    if (updatedClinic) {
      console.log('✅ Румынские SEO данные успешно обновлены!');
      console.log('📊 Обновленные данные:');
      console.log('  seoTitleRo:', updatedClinic.seoTitleRo);
      console.log('  seoDescriptionRo:', updatedClinic.seoDescriptionRo);
      console.log('  seoKeywordsRo:', updatedClinic.seoKeywordsRo);
      console.log('  seoH1Ro:', updatedClinic.seoH1Ro);
      console.log('  ogTitleRo:', updatedClinic.ogTitleRo);
      console.log('  ogDescriptionRo:', updatedClinic.ogDescriptionRo);
    } else {
      console.log('❌ Клиника не найдена');
    }
    
  } catch (error) {
    console.error('❌ Ошибка при обновлении SEO данных:', error);
  } finally {
    process.exit(0);
  }
}

fixRomanianSEO();
