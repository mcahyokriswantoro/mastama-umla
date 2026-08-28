const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const fikes = await prisma.faculty.findUnique({ where: { code: 'FIKES' } });
  if (!fikes) {
    console.log('Fakultas FIKES tidak ditemukan');
    return;
  }

  const existing = await prisma.studyProgram.findUnique({ where: { code: 'S1_FIS' } });
  if (existing) {
    console.log('S1 Fisioterapi sudah ada di database.');
  } else {
    await prisma.studyProgram.create({
      data: {
        code: 'S1_FIS',
        name: 'Fisioterapi (S1)',
        degree: 'S1',
        facultyId: fikes.id
      }
    });
    console.log('Berhasil menambahkan prodi S1 Fisioterapi.');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
