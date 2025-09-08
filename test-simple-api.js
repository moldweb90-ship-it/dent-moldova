// Простой тест API для отзывов
const clinicId = '50700388-9022-46bf-ace0-8e2335b744bb';
const url = `http://localhost:5000/api/clinics/${clinicId}/reviews?status=approved&limit=1000`;

fetch(url)
  .then(response => response.json())
  .then(data => {
    console.log('API Response:', data);
    console.log('Reviews count:', data.reviews ? data.reviews.length : 0);
    if (data.reviews && data.reviews.length > 0) {
      console.log('First review:', data.reviews[0]);
      console.log('Review status:', data.reviews[0].status);
    }
  })
  .catch(error => {
    console.error('Error:', error);
  });
