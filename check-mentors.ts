import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const groups = await prisma.group.findMany({
    include: {
      mentorAssignments: {
        include: { mentor: true }
      }
    }
  });

  for (const group of groups) {
    console.log(`Group ${group.number}: ${group.name} - Mentors: ${group.mentorAssignments.map(ma => ma.mentor.fullName).join(', ')}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
