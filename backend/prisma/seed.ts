import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // Create a test user if one doesn't exist
  const user = await prisma.user.upsert({
    where: { email: 'demo@ethio.com' },
    update: {},
    create: {
      email: 'demo@ethio.com',
      name: 'Demo User',
      password: '$2a$10$YourHashedPasswordHere', // Placeholder, we will use real auth
    },
  });

  // Seed Ethiopian Companies
  const companies = [
    { name: 'Ethio Telecom', location: 'Addis Ababa', industry: 'Telecommunications', website: 'www.ethiotelecom.et' },
    { name: 'Safaricom Ethiopia', location: 'Addis Ababa', industry: 'Telecommunications', website: 'www.safaricom.et' },
    { name: 'Dashen Bank', location: 'Addis Ababa', industry: 'Banking & Finance', website: 'www.dashenbanksc.com' },
    { name: 'Commercial Bank of Ethiopia', location: 'Addis Ababa', industry: 'Banking & Finance', website: 'www.combanketh.et' },
    { name: 'Ethiopian Airlines', location: 'Addis Ababa', industry: 'Aviation', website: 'www.ethiopianairlines.com' },
    { name: 'Gebeya', location: 'Addis Ababa', industry: 'Technology', website: 'www.gebeya.com' },
    { name: 'Ride (Feres)', location: 'Addis Ababa', industry: 'Transportation', website: 'www.ride.et' },
  ];

  for (const comp of companies) {
    await prisma.company.upsert({
      where: { name: comp.name },
      update: {},
      create: {
        ...comp,
        userId: user.id,
      },
    });
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
