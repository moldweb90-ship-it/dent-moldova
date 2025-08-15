import { db } from "./db";
import { cities, districts, clinics, packages } from "@shared/schema";

function calculateDScore(trustIndex: number, reviewsIndex: number, priceIndex: number, accessIndex: number): number {
  return Math.round(0.3 * trustIndex + 0.25 * reviewsIndex + 0.25 * (100 - priceIndex) + 0.2 * accessIndex);
}

async function seed() {
  console.log("Starting seed...");

  // Clear existing data
  await db.delete(packages);
  await db.delete(clinics);
  await db.delete(districts);
  await db.delete(cities);

  // Create cities
  const [chisinau, balti] = await db.insert(cities).values([
    { nameRu: "Кишинёв", nameRo: "Chișinău" },
    { nameRu: "Бельцы", nameRo: "Bălți" }
  ]).returning();

  // Create districts
  const [centru, botanica, riscani, baltiCentru] = await db.insert(districts).values([
    { cityId: chisinau.id, nameRu: "Центр", nameRo: "Centru" },
    { cityId: chisinau.id, nameRu: "Ботаника", nameRo: "Botanica" },
    { cityId: chisinau.id, nameRu: "Рышкань", nameRo: "Rîșcani" },
    { cityId: balti.id, nameRu: "Центр", nameRo: "Centru" }
  ]).returning();

  // Create clinics data
  const clinicsData = [
    // Chișinău clinics
    {
      slug: "life-dental-centru",
      name: "Life Dental",
      logoUrl: "/images/clinics/life-dental.jpg",
      cityId: chisinau.id,
      districtId: centru.id,
      address: "bd. Ștefan cel Mare 100",
      phone: "+373 22 000 100",
      website: "https://lifedental.md",
      bookingUrl: "/book/life-dental-centru",
      languages: ["ru", "ro", "en"],
      specializations: ["implants", "veneers", "hygiene"],
      tags: ["рассрочка", "цифровая диагностика"],
      verified: true,
      cnam: true,
      availToday: true,
      availTomorrow: true,
      priceIndex: 62,
      trustIndex: 88,
      reviewsIndex: 74,
      accessIndex: 80,
      dScore: 0 // Will be calculated
    },
    {
      slug: "denta-pro-botanica",
      name: "Denta Pro",
      logoUrl: "/images/clinics/denta-pro.jpg",
      cityId: chisinau.id,
      districtId: botanica.id,
      address: "str. Dacia 15",
      phone: "+373 22 000 200",
      website: "https://dentapro.md",
      bookingUrl: "/book/denta-pro-botanica",
      languages: ["ru", "ro"],
      specializations: ["hygiene", "endo"],
      tags: ["запись онлайн"],
      verified: false,
      cnam: false,
      availToday: true,
      availTomorrow: false,
      priceIndex: 75,
      trustIndex: 65,
      reviewsIndex: 58,
      accessIndex: 72,
      dScore: 0
    },
    {
      slug: "smilecare-riscani",
      name: "SmileCare",
      logoUrl: "/images/clinics/smilecare.jpg",
      cityId: chisinau.id,
      districtId: riscani.id,
      address: "str. Alba Iulia 45",
      phone: "+373 22 000 300",
      website: "https://smilecare.md",
      bookingUrl: "/book/smilecare-riscani",
      languages: ["ru", "ro", "en"],
      specializations: ["implants", "ortho"],
      tags: ["премиум", "гарантия"],
      verified: true,
      cnam: true,
      availToday: false,
      availTomorrow: true,
      priceIndex: 35,
      trustIndex: 95,
      reviewsIndex: 89,
      accessIndex: 92,
      dScore: 0
    },
    {
      slug: "dental-plus-centru",
      name: "Dental Plus",
      logoUrl: "/images/clinics/dental-plus.jpg",
      cityId: chisinau.id,
      districtId: centru.id,
      address: "bd. Ștefan cel Mare 75",
      phone: "+373 22 000 400",
      website: "https://dentalplus.md",
      bookingUrl: "/book/dental-plus-centru",
      languages: ["ru", "en"],
      specializations: ["implants", "veneers", "ortho"],
      tags: ["инновации", "3D диагностика"],
      verified: true,
      cnam: false,
      availToday: true,
      availTomorrow: true,
      priceIndex: 45,
      trustIndex: 82,
      reviewsIndex: 77,
      accessIndex: 85,
      dScore: 0
    },
    {
      slug: "family-dental-botanica",
      name: "Family Dental",
      logoUrl: "/images/clinics/family-dental.jpg",
      cityId: chisinau.id,
      districtId: botanica.id,
      address: "str. Calea Iesilor 25",
      phone: "+373 22 000 500",
      website: "https://familydental.md",
      bookingUrl: "/book/family-dental-botanica",
      languages: ["ru", "ro"],
      specializations: ["kids", "hygiene", "endo"],
      tags: ["семейная", "детская"],
      verified: true,
      cnam: true,
      availToday: false,
      availTomorrow: false,
      priceIndex: 58,
      trustIndex: 78,
      reviewsIndex: 82,
      accessIndex: 75,
      dScore: 0
    },
    {
      slug: "modern-dent-riscani",
      name: "Modern Dent",
      logoUrl: "/images/clinics/modern-dent.jpg",
      cityId: chisinau.id,
      districtId: riscani.id,
      address: "str. Mihail Kogalniceanu 88",
      phone: "+373 22 000 600",
      website: "https://moderndent.md",
      bookingUrl: "/book/modern-dent-riscani",
      languages: ["ru", "ro", "en"],
      specializations: ["implants", "veneers", "hygiene", "ortho"],
      tags: ["современные технологии", "безболезненно"],
      verified: true,
      cnam: false,
      availToday: true,
      availTomorrow: true,
      priceIndex: 52,
      trustIndex: 86,
      reviewsIndex: 79,
      accessIndex: 88,
      dScore: 0
    },
    {
      slug: "white-smile-centru",
      name: "White Smile",
      logoUrl: "/images/clinics/white-smile.jpg",
      cityId: chisinau.id,
      districtId: centru.id,
      address: "str. Puskin 22",
      phone: "+373 22 000 700",
      website: "https://whitesmile.md",
      bookingUrl: "/book/white-smile-centru",
      languages: ["ru", "ro"],
      specializations: ["veneers", "hygiene"],
      tags: ["отбеливание", "эстетика"],
      verified: false,
      cnam: false,
      availToday: true,
      availTomorrow: true,
      priceIndex: 68,
      trustIndex: 72,
      reviewsIndex: 65,
      accessIndex: 70,
      dScore: 0
    },
    {
      slug: "dentomax-botanica",
      name: "DentoMax",
      logoUrl: "/images/clinics/dentomax.jpg",
      cityId: chisinau.id,
      districtId: botanica.id,
      address: "str. Independentei 55",
      phone: "+373 22 000 800",
      website: "https://dentomax.md",
      bookingUrl: "/book/dentomax-botanica",
      languages: ["ru", "ro", "en"],
      specializations: ["implants", "endo", "ortho"],
      tags: ["немецкое оборудование", "профессионально"],
      verified: true,
      cnam: true,
      availToday: false,
      availTomorrow: true,
      priceIndex: 42,
      trustIndex: 90,
      reviewsIndex: 85,
      accessIndex: 82,
      dScore: 0
    },
    {
      slug: "clinic-32-riscani",
      name: "Клиника 32",
      logoUrl: "/images/clinics/clinic-32.jpg",
      cityId: chisinau.id,
      districtId: riscani.id,
      address: "bd. Moscovei 125",
      phone: "+373 22 000 900",
      website: "https://clinic32.md",
      bookingUrl: "/book/clinic-32-riscani",
      languages: ["ru", "ro"],
      specializations: ["implants", "hygiene", "kids"],
      tags: ["доступные цены", "комфорт"],
      verified: false,
      cnam: true,
      availToday: true,
      availTomorrow: false,
      priceIndex: 72,
      trustIndex: 68,
      reviewsIndex: 71,
      accessIndex: 76,
      dScore: 0
    },
    {
      slug: "brilliant-dental-centru",
      name: "Brilliant Dental",
      logoUrl: "/images/clinics/brilliant-dental.jpg",
      cityId: chisinau.id,
      districtId: centru.id,
      address: "str. Armeneasca 15",
      phone: "+373 22 001 000",
      website: "https://brilliantdental.md",
      bookingUrl: "/book/brilliant-dental-centru",
      languages: ["ru", "ro", "en"],
      specializations: ["veneers", "implants", "hygiene"],
      tags: ["люксовый сервис", "VIP"],
      verified: true,
      cnam: false,
      availToday: false,
      availTomorrow: true,
      priceIndex: 25,
      trustIndex: 92,
      reviewsIndex: 88,
      accessIndex: 78,
      dScore: 0
    },
    {
      slug: "dental-art-botanica",
      name: "Dental Art",
      logoUrl: "/images/clinics/dental-art.jpg",
      cityId: chisinau.id,
      districtId: botanica.id,
      address: "str. Tighina 35",
      phone: "+373 22 001 100",
      website: "https://dentalart.md",
      bookingUrl: "/book/dental-art-botanica",
      languages: ["ru", "ro"],
      specializations: ["veneers", "endo", "hygiene"],
      tags: ["художественная стоматология", "красота"],
      verified: true,
      cnam: false,
      availToday: true,
      availTomorrow: true,
      priceIndex: 55,
      trustIndex: 80,
      reviewsIndex: 75,
      accessIndex: 83,
      dScore: 0
    },
    {
      slug: "perfect-smile-riscani",
      name: "Perfect Smile",
      logoUrl: "/images/clinics/perfect-smile.jpg",
      cityId: chisinau.id,
      districtId: riscani.id,
      address: "str. Vadul lui Voda 88",
      phone: "+373 22 001 200",
      website: "https://perfectsmile.md",
      bookingUrl: "/book/perfect-smile-riscani",
      languages: ["ru", "ro", "en"],
      specializations: ["ortho", "kids", "hygiene"],
      tags: ["брекеты", "детский стоматолог"],
      verified: false,
      cnam: true,
      availToday: false,
      availTomorrow: false,
      priceIndex: 65,
      trustIndex: 74,
      reviewsIndex: 69,
      accessIndex: 77,
      dScore: 0
    },

    // Bălți clinics
    {
      slug: "kidssmile-balti",
      name: "KidsSmile",
      logoUrl: "/images/clinics/kidssmile.jpg",
      cityId: balti.id,
      districtId: baltiCentru.id,
      address: "str. Stefan cel Mare 45",
      phone: "+373 23 000 100",
      website: "https://kidssmile.md",
      bookingUrl: "/book/kidssmile-balti",
      languages: ["ro", "ru"],
      specializations: ["kids", "hygiene"],
      tags: ["детская", "игровая зона"],
      verified: false,
      cnam: false,
      availToday: true,
      availTomorrow: true,
      priceIndex: 85,
      trustIndex: 42,
      reviewsIndex: 38,
      accessIndex: 55,
      dScore: 0
    },
    {
      slug: "nord-dental-balti",
      name: "Nord Dental",
      logoUrl: "/images/clinics/nord-dental.jpg",
      cityId: balti.id,
      districtId: baltiCentru.id,
      address: "str. Independentei 12",
      phone: "+373 23 000 200",
      website: "https://norddental.md",
      bookingUrl: "/book/nord-dental-balti",
      languages: ["ru", "ro"],
      specializations: ["implants", "endo", "hygiene"],
      tags: ["опытные врачи", "качество"],
      verified: true,
      cnam: true,
      availToday: false,
      availTomorrow: true,
      priceIndex: 48,
      trustIndex: 85,
      reviewsIndex: 78,
      accessIndex: 80,
      dScore: 0
    },
    {
      slug: "balti-smile-center",
      name: "Bălți Smile Center",
      logoUrl: "/images/clinics/balti-smile.jpg",
      cityId: balti.id,
      districtId: baltiCentru.id,
      address: "str. Vasile Alecsandri 8",
      phone: "+373 23 000 300",
      website: "https://baltismile.md",
      bookingUrl: "/book/balti-smile-center",
      languages: ["ro", "ru", "en"],
      specializations: ["implants", "veneers", "ortho"],
      tags: ["современная клиника", "европейские стандарты"],
      verified: true,
      cnam: false,
      availToday: true,
      availTomorrow: true,
      priceIndex: 38,
      trustIndex: 88,
      reviewsIndex: 83,
      accessIndex: 85,
      dScore: 0
    }
  ];

  // Calculate D-scores
  clinicsData.forEach(clinic => {
    clinic.dScore = calculateDScore(clinic.trustIndex, clinic.reviewsIndex, clinic.priceIndex, clinic.accessIndex);
  });

  // Insert clinics
  const insertedClinics = await db.insert(clinics).values(clinicsData).returning();

  // Create packages for each clinic
  const packagesData = [];
  for (const clinic of insertedClinics) {
    // Base prices vary by clinic quality
    const multiplier = clinic.dScore > 80 ? 1.2 : clinic.dScore > 60 ? 1.0 : 0.8;
    
    packagesData.push(
      {
        clinicId: clinic.id,
        code: "implant_standard",
        nameRu: "Имплант стандарт",
        nameRo: "Implant standard",
        priceMin: Math.round(8000 * multiplier),
        priceMax: Math.round(15000 * multiplier),
        priceMedian: Math.round(11500 * multiplier)
      },
      {
        clinicId: clinic.id,
        code: "hygiene_pro",
        nameRu: "Профгигиена",
        nameRo: "Igienă profesională",
        priceMin: Math.round(500 * multiplier),
        priceMax: Math.round(1200 * multiplier),
        priceMedian: Math.round(850 * multiplier)
      },
      {
        clinicId: clinic.id,
        code: "rct_molar",
        nameRu: "Лечение каналов моляр",
        nameRo: "Tratament canal molar",
        priceMin: Math.round(2000 * multiplier),
        priceMax: Math.round(3800 * multiplier),
        priceMedian: Math.round(2900 * multiplier)
      }
    );
  }

  await db.insert(packages).values(packagesData);

  console.log("Seed completed successfully!");
  console.log(`Created ${insertedClinics.length} clinics with ${packagesData.length} packages`);
}

// Run seed if this file is executed directly
seed().catch(console.error);

export { seed };
