const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const years = await prisma.mastamaYear.findMany();
  console.log('Mastama Years:', years);

  const groups = await prisma.group.findMany({ take: 5 });
  console.log('Groups (sample):', groups.map(g => ({ name: g.name, yearId: g.mastamaYearId })));
  
  const journeys = await prisma.journey.findMany({ take: 5 });
  console.log('Journeys (sample):', journeys.map(j => ({ title: j.title, yearId: j.mastamaYearId })));
}

main().catch(console.error).finally(() => prisma.$disconnect());
