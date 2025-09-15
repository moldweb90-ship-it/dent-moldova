const { db } = require('./server/db');
const { clinics } = require('./shared/schema');
const { eq } = require('drizzle-orm');

async function checkClinicData() {
  try {
    console.log('🔍 Checking clinic data for life-dental-chekany...');
    
    const clinic = await db
      .select()
      .from(clinics)
      .where(eq(clinics.slug, 'life-dental-chekany'))
      .limit(1);
    
    if (clinic.length > 0) {
      const clinicData = clinic[0];
      console.log('✅ Clinic found:', {
        name: clinicData.nameRu,
        slug: clinicData.slug,
        googleRating: clinicData.googleRating,
        googleReviewsCount: clinicData.googleReviewsCount,
        dScore: clinicData.dScore,
        reviewsIndex: clinicData.reviewsIndex,
        trustIndex: clinicData.trustIndex,
        accessIndex: clinicData.accessIndex,
        priceIndex: clinicData.priceIndex
      });
    } else {
      console.log('❌ Clinic not found');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

checkClinicData();
