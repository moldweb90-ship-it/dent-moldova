import fetch from 'node-fetch';

async function testAPI() {
  try {
    console.log('=== TESTING API ===');
    
    // Тест 1: Проверяем авторизацию
    console.log('\n1. Testing auth check...');
    try {
      const authResponse = await fetch('http://localhost:5000/api/admin/auth/check');
      console.log(`Auth status: ${authResponse.status}`);
      if (authResponse.status === 401) {
        console.log('❌ Not authenticated - need to login first');
      } else {
        console.log('✅ Authenticated');
      }
    } catch (error) {
      console.log(`Auth error: ${error.message}`);
    }
    
    // Тест 2: Проверяем API отзывов
    console.log('\n2. Testing reviews API...');
    try {
      const reviewsResponse = await fetch('http://localhost:5000/api/admin/reviews');
      console.log(`Reviews API status: ${reviewsResponse.status}`);
      
      if (reviewsResponse.ok) {
        const data = await reviewsResponse.json();
        console.log(`✅ Success! Found ${data.reviews?.length || 0} reviews`);
        console.log(`Total: ${data.total || 0}`);
        if (data.reviews && data.reviews.length > 0) {
          console.log('First review:', JSON.stringify(data.reviews[0], null, 2));
        }
      } else {
        const errorText = await reviewsResponse.text();
        console.log(`❌ Error: ${errorText}`);
      }
    } catch (error) {
      console.log(`Reviews API error: ${error.message}`);
    }
    
    // Тест 3: Проверяем создание отзыва
    console.log('\n3. Testing review creation...');
    try {
      const reviewData = {
        clinicId: '1',
        qualityRating: 4.5,
        serviceRating: 4.0,
        comfortRating: 3.5,
        priceRating: 4.0,
        averageRating: 4.0,
        comment: 'Test review from API test'
      };
      
      const createResponse = await fetch('http://localhost:5000/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData)
      });
      
      console.log(`Create review status: ${createResponse.status}`);
      if (createResponse.ok) {
        const result = await createResponse.json();
        console.log(`✅ Review created: ${result.review?.id}`);
      } else {
        const errorText = await createResponse.text();
        console.log(`❌ Create error: ${errorText}`);
      }
    } catch (error) {
      console.log(`Create review error: ${error.message}`);
    }
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

testAPI();
