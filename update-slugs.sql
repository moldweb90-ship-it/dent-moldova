-- Обновляем slug для городов
UPDATE cities SET slug = 'kishinev' WHERE name_ru = 'Кишинев';
UPDATE cities SET slug = 'balti' WHERE name_ru = 'Бельцы';
UPDATE cities SET slug = 'tiraspol' WHERE name_ru = 'Тирасполь';
UPDATE cities SET slug = 'bendery' WHERE name_ru = 'Бендеры';
UPDATE cities SET slug = 'ribnita' WHERE name_ru = 'Рыбница';
UPDATE cities SET slug = 'cahul' WHERE name_ru = 'Кагул';
UPDATE cities SET slug = 'ungheni' WHERE name_ru = 'Унгены';
UPDATE cities SET slug = 'soroca' WHERE name_ru = 'Сороки';
UPDATE cities SET slug = 'orhei' WHERE name_ru = 'Орхей';
UPDATE cities SET slug = 'comrat' WHERE name_ru = 'Комрат';

-- Обновляем slug для районов (примеры)
UPDATE districts SET slug = 'centru' WHERE name_ru = 'Центр';
UPDATE districts SET slug = 'botanica' WHERE name_ru = 'Ботаника';
UPDATE districts SET slug = 'ciocana' WHERE name_ru = 'Чеканы';
UPDATE districts SET slug = 'riscani' WHERE name_ru = 'Рышкановка';
UPDATE districts SET slug = 'telecentru' WHERE name_ru = 'Телецентр';
