import { db } from './server/db.ts';
import { reviews, clinics } from './shared/schema.ts';
import { eq } from 'drizzle-orm';

async function checkReviews() {
  try {
    console.log('🔍 Checking reviews in database...');
    
    const allReviews = await db.select().from(reviews).where(eq(reviews.status, 'approved'));
    console.log('Total approved reviews:', allReviews.length);
    
    if (allReviews.length === 0) {
      console.log('No approved reviews found!');
      return;
    }
    
    const reviewsByClinic = allReviews.reduce((acc, review) => {
      if (!acc[review.clinicId]) {
        acc[review.clinicId] = { count: 0, totalRating: 0, reviews: [] };
      }
      acc[review.clinicId].count += 1;
      acc[review.clinicId].totalRating += parseFloat(review.averageRating.toString());
      acc[review.clinicId].reviews.push({
        rating: parseFloat(review.averageRating.toString()),
        comment: review.comment?.substring(0, 50) + '...'
      });
      return acc;
    }, {});
    
    console.log('\n📊 Reviews by clinic:');
    for (const [clinicId, data] of Object.entries(reviewsByClinic)) {
      const avgRating = data.totalRating / data.count;
      console.log(`\nClinic ${clinicId}:`);
      console.log(`  - ${data.count} reviews`);
      console.log(`  - Average rating: ${avgRating.toFixed(2)}`);
      console.log(`  - Reviews:`, data.reviews.map(r => `${r.rating} (${r.comment})`));
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkReviews();
