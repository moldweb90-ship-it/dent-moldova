import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { services } from '../shared/schema';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('❌ DATABASE_URL не найден в переменных окружения');
  process.exit(1);
}

const client = postgres(connectionString);
const db = drizzle(client);

async function addRomanianServices() {
  try {
    console.log('🔍 Добавляем румынские услуги для Nobil Dent...');
    
    const clinicId = '290f3cdd-f7d1-4b69-85bb-6fa1e15ef9b3'; // Nobil Dent
    
    const romanianServices = [
      {
        clinicId,
        name: 'Consultație',
        price: 200,
        priceType: 'fixed',
        currency: 'MDL',
        language: 'ro'
      },
      {
        clinicId,
        name: 'Tratament cariu',
        price: 800,
        priceType: 'fixed',
        currency: 'MDL',
        language: 'ro'
      },
      {
        clinicId,
        name: 'Implantologie',
        price: 2500,
        priceType: 'fixed',
        currency: 'MDL',
        language: 'ro'
      },
      {
        clinicId,
        name: 'Igienizare',
        price: 400,
        priceType: 'fixed',
        currency: 'MDL',
        language: 'ro'
      },
      {
        clinicId,
        name: 'Protezare',
        price: 1500,
        priceType: 'fixed',
        currency: 'MDL',
        language: 'ro'
      },
      {
        clinicId,
        name: 'Chirurgie orală',
        price: 1200,
        priceType: 'fixed',
        currency: 'MDL',
        language: 'ro'
      }
    ];

    for (const service of romanianServices) {
      await db.insert(services).values({
        ...service,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log(`✅ Добавлена услуга: ${service.name}`);
    }

    console.log('🎉 Все румынские услуги добавлены!');
    
  } catch (error) {
    console.error('❌ Ошибка при добавлении услуг:', error);
  } finally {
    await client.end();
  }
}

addRomanianServices();
