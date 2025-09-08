// Тестовый файл для проверки PhoneModal
console.log('Testing PhoneModal...');

// Проверяем, что файл существует
const fs = require('fs');
const path = require('path');

const phoneModalPath = path.join(__dirname, 'client', 'src', 'components', 'PhoneModal.tsx');
const clinicDetailPath = path.join(__dirname, 'client', 'src', 'components', 'ClinicDetail.tsx');

console.log('PhoneModal path:', phoneModalPath);
console.log('ClinicDetail path:', clinicDetailPath);

if (fs.existsSync(phoneModalPath)) {
  console.log('✅ PhoneModal.tsx exists');
} else {
  console.log('❌ PhoneModal.tsx not found');
}

if (fs.existsSync(clinicDetailPath)) {
  console.log('✅ ClinicDetail.tsx exists');
} else {
  console.log('❌ ClinicDetail.tsx not found');
}



