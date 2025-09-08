// Простой тест API отзывов
fetch('http://localhost:5000/api/admin/reviews')
  .then(response => {
    console.log('Status:', response.status);
    return response.text();
  })
  .then(data => {
    console.log('Response:', data);
  })
  .catch(error => {
    console.error('Error:', error);
  });
