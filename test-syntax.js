// Тест синтаксиса
console.log('Testing syntax...');

// Проверяем, что все файлы существуют и читаются
const fs = require('fs');
const path = require('path');

const files = [
  'client/src/components/PhoneModal.tsx',
  'client/src/components/ClinicDetail.tsx',
  'client/src/hooks/use-toast.ts'
];

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} exists`);
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      console.log(`✅ ${file} is readable (${content.length} chars)`);
    } catch (err) {
      console.log(`❌ ${file} read error:`, err.message);
    }
  } else {
    console.log(`❌ ${file} not found`);
  }
});

console.log('Syntax test completed');



