import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import ExcelJS from 'exceljs';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
    }

    const students = await prisma.studentProfile.findMany({
      include: {
        user: true,
        faculty: true,
        studyProgram: true,
        group: {
          include: {
            mentorAssignments: {
              include: { mentor: true },
            },
          },
        },
        submissions: {
          include: {
            activity: { include: { journey: true } },
            approvals: { include: { reviewer: true } },
          },
        },
        ormawaLogs: { where: { status: 'COMPLETED' } },
        spiritualLogs: { where: { status: 'COMPLETED' } },
        aiProjects: true,
        userBadges: { include: { badge: true } },
      },
      orderBy: { nim: 'asc' },
    });

    // 1. Sheet: Rekap Passport Mahasiswa
    const passportRecapData = students.map((st, idx) => {
      const completedCodes = new Set(
        st.submissions.filter((s) => s.status === 'COMPLETED').map((s) => s.activity.code)
      );

      const hasPra = completedCodes.has('ACT_PRA_01') || completedCodes.has('ACT_PRA_02');
      const hasOpen = completedCodes.has('ACT_OPEN_01') || completedCodes.has('ACT_OPEN_02');
      const hasUni = completedCodes.has('ACT_UNI_01') || completedCodes.has('ACT_UNI_02');
      const hasFak = completedCodes.has('ACT_FAK_01') || completedCodes.has('ACT_FAK_02');
      const hasPensi = completedCodes.has('ACT_PENSI_01') || completedCodes.has('ACT_PENSI_02');
      const hasClose = completedCodes.has('ACT_CLOSE_01') || completedCodes.has('ACT_CLOSE_02');

      const mentors = st.group?.mentorAssignments.map((m) => m.mentor.fullName).join(', ') || 'Belum Ditugaskan';

      return {
        'No': idx + 1,
        'NIM': st.nim,
        'Nama Lengkap': st.user.fullName,
        'Fakultas': st.faculty.name,
        'Program Studi': st.studyProgram.name,
        'Kelompok': st.group?.name || '-',
        'Pendamping': mentors,
        'Pra MASTAMA': hasPra ? 'LULUS' : 'BELUM',
        'Pembukaan': hasOpen ? 'LULUS' : 'BELUM',
        'Universitas': hasUni ? 'LULUS' : 'BELUM',
        'Fakultas & Prodi': hasFak ? 'LULUS' : 'BELUM',
        'Pensi & Inap': hasPensi ? 'LULUS' : 'BELUM',
        'Penutupan': hasClose ? 'LULUS' : 'BELUM',
        'ORMAWA (Count)': `${st.ormawaLogs.length}/15`,
        'Spiritual (Count)': `${st.spiritualLogs.length}/24`,
        'AI Challenge Project': st.aiProjects[0]?.stage || 'BELUM',
        'Total XP': st.totalXp,
        'Badges Terbuka': st.userBadges.length,
      };
    });

    // 2. Sheet: Detail Submissions & Approvals
    const detailedSubmissionsData: any[] = [];
    let subIdx = 1;

    for (const st of students) {
      const mentorName = st.group?.mentorAssignments?.[0]?.mentor?.fullName || '-';
      for (const sub of st.submissions) {
        const approval = sub.approvals[0];
        detailedSubmissionsData.push({
          'No': subIdx++,
          'NIM': st.nim,
          'Nama Mahasiswa': st.user.fullName,
          'Fakultas': st.faculty.name,
          'Program Studi': st.studyProgram.name,
          'Kelompok': st.group?.name || '-',
          'Pendamping': mentorName,
          'Journey': sub.activity.journey?.title || '-',
          'Nama Kegiatan': sub.activity.title,
          'Tanggal Submit': new Date(sub.submissionDate).toLocaleDateString('id-ID'),
          'Waktu': sub.submissionTime,
          'Lokasi': sub.locationNote || sub.activity.location,
          'Status': sub.status,
          'Approval Status': approval?.status || (sub.status === 'COMPLETED' ? 'APPROVED' : 'PENDING'),
          'Approved By': approval?.reviewer?.fullName || (sub.status === 'COMPLETED' ? 'Sistem (QR)' : '-'),
          'Catatan Feedback': approval?.feedback || '-',
          'XP Didapat': sub.status === 'COMPLETED' ? sub.activity.xpReward : 0,
        });
      }
    }

    const workbook = new ExcelJS.Workbook();
    
    const recapSheet = workbook.addWorksheet('Rekap Passport');
    if (passportRecapData.length > 0) {
      recapSheet.columns = Object.keys(passportRecapData[0]).map(key => ({ header: key, key: key }));
      recapSheet.addRows(passportRecapData);
    }

    const detailSheet = workbook.addWorksheet('Detail Submissions');
    if (detailedSubmissionsData.length > 0) {
      detailSheet.columns = Object.keys(detailedSubmissionsData[0]).map(key => ({ header: key, key: key }));
      detailSheet.addRows(detailedSubmissionsData);
    }

    const buffer = await workbook.xlsx.writeBuffer();

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'DATA_EXPORT_EXCEL',
        entityType: 'REPORT',
        details: 'Admin exported Digital Student Passport recapitulation Excel file.',
      },
    });

    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Disposition': 'attachment; filename="REKAP_DIGITAL_PASSPORT_MASTAMA_UMLA_2026.xlsx"',
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    });
  } catch (error: any) {
    console.error('Error generating excel export:', error);
    return NextResponse.json({ error: 'Gagal mengunduh berkas Excel.' }, { status: 500 });
  }
}
