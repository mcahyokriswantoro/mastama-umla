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
        ormawaLogs: { where: { status: { in: ['COMPLETED', 'APPROVED'] } } },
        spiritualLogs: { where: { status: { in: ['COMPLETED', 'APPROVED'] } } },
        aiProjects: true,
        userBadges: { include: { badge: true } },
      },
      orderBy: { nim: 'asc' },
    });

    // 1. Sheet: Rekap Passport Mahasiswa
    const passportRecapData = students.map((st, idx) => {
      const validSubmissions = (st.submissions || []).filter(
        (s) => (s.status === 'COMPLETED' || s.status === 'APPROVED') && s.activity
      );

      const completedCodes = new Set(validSubmissions.map((s) => s.activity.code));
      const completedJourneyCodes = new Set(
        validSubmissions.map((s) => s.activity.journey?.code).filter(Boolean)
      );
      const completedJourneyOrders = new Set(
        validSubmissions.map((s) => s.activity.journey?.orderNum).filter(Boolean)
      );

      const hasPra =
        completedJourneyOrders.has(1) ||
        completedJourneyOrders.has(2) ||
        completedJourneyCodes.has('JOURNEY_01') ||
        completedJourneyCodes.has('JOURNEY_02') ||
        completedCodes.has('ACT_01') ||
        completedCodes.has('ACT_02') ||
        completedCodes.has('ACT_PRA_01') ||
        completedCodes.has('ACT_PRA_02');

      const hasOpen =
        completedJourneyOrders.has(3) ||
        completedJourneyCodes.has('JOURNEY_03') ||
        completedCodes.has('ACT_03') ||
        completedCodes.has('ACT_04') ||
        completedCodes.has('ACT_OPEN_01') ||
        completedCodes.has('ACT_OPEN_02');

      const hasUni =
        completedJourneyOrders.has(4) ||
        completedJourneyCodes.has('JOURNEY_04') ||
        completedCodes.has('ACT_05') ||
        completedCodes.has('ACT_06') ||
        completedCodes.has('ACT_07') ||
        completedCodes.has('ACT_08') ||
        completedCodes.has('ACT_UNI_01') ||
        completedCodes.has('ACT_UNI_02');

      const hasFak =
        completedJourneyOrders.has(5) ||
        completedJourneyCodes.has('JOURNEY_05') ||
        completedCodes.has('ACT_FAK_01') ||
        completedCodes.has('ACT_FAK_02');

      const hasPensi =
        completedJourneyOrders.has(6) ||
        completedJourneyCodes.has('JOURNEY_06') ||
        completedCodes.has('ACT_PENSI_01') ||
        completedCodes.has('ACT_PENSI_02');

      const hasClose =
        completedJourneyOrders.has(7) ||
        completedJourneyCodes.has('JOURNEY_07') ||
        completedCodes.has('ACT_CLOSE_01') ||
        completedCodes.has('ACT_CLOSE_02');

      const mentors =
        st.group?.mentorAssignments && st.group.mentorAssignments.length > 0
          ? st.group.mentorAssignments
              .map((m) => m.mentor?.fullName)
              .filter(Boolean)
              .join(', ')
          : 'Belum Ditugaskan';

      return {
        'No': idx + 1,
        'NIM': st.nim || '-',
        'Nama Lengkap': st.user?.fullName || '-',
        'Fakultas': st.faculty?.name || '-',
        'Program Studi': st.studyProgram?.name || '-',
        'Kelompok': st.group?.name || '-',
        'Pendamping': mentors || 'Belum Ditugaskan',
        'Pra MASTAMA': hasPra ? 'LULUS' : 'BELUM',
        'Pembukaan': hasOpen ? 'LULUS' : 'BELUM',
        'Universitas': hasUni ? 'LULUS' : 'BELUM',
        'Fakultas & Prodi': hasFak ? 'LULUS' : 'BELUM',
        'Pensi & Inap': hasPensi ? 'LULUS' : 'BELUM',
        'Penutupan': hasClose ? 'LULUS' : 'BELUM',
        'ORMAWA (Count)': `${st.ormawaLogs?.length || 0}/15`,
        'Spiritual (Count)': `${st.spiritualLogs?.length || 0}/24`,
        'AI Challenge Project': st.aiProjects?.[0]?.stage || 'BELUM',
        'Total XP': st.totalXp ?? 0,
        'Badges Terbuka': st.userBadges?.length || 0,
      };
    });

    // 2. Sheet: Detail Submissions & Approvals
    const detailedSubmissionsData: any[] = [];
    let subIdx = 1;

    for (const st of students) {
      const mentorName = st.group?.mentorAssignments?.[0]?.mentor?.fullName || '-';
      for (const sub of st.submissions || []) {
        const approval = sub.approvals?.[0];
        detailedSubmissionsData.push({
          'No': subIdx++,
          'NIM': st.nim || '-',
          'Nama Mahasiswa': st.user?.fullName || '-',
          'Fakultas': st.faculty?.name || '-',
          'Program Studi': st.studyProgram?.name || '-',
          'Kelompok': st.group?.name || '-',
          'Pendamping': mentorName,
          'Journey': sub.activity?.journey?.title || '-',
          'Nama Kegiatan': sub.activity?.title || sub.activityTitle || '-',
          'Tanggal Submit': sub.submissionDate ? new Date(sub.submissionDate).toLocaleDateString('id-ID') : '-',
          'Waktu': sub.submissionTime || '-',
          'Lokasi': sub.locationNote || sub.activity?.location || '-',
          'Status': sub.status,
          'Approval Status': approval?.status || (sub.status === 'COMPLETED' ? 'APPROVED' : 'PENDING'),
          'Approved By': approval?.reviewer?.fullName || (sub.status === 'COMPLETED' ? 'Sistem (QR)' : '-'),
          'Catatan Feedback': approval?.feedback || '-',
          'XP Didapat': sub.status === 'COMPLETED' ? (sub.activity?.xpReward ?? 0) : 0,
        });
      }
    }

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'MASTAMA UMLA 2026';
    workbook.lastModifiedBy = 'Admin';
    workbook.created = new Date();
    workbook.modified = new Date();
    
    // ==========================================
    // 1. STYLE REKAP SHEET
    // ==========================================
    const recapSheet = workbook.addWorksheet('Rekap Passport', {
      views: [{ state: 'frozen', ySplit: 1 }] // Freeze header row
    });
    
    if (passportRecapData.length > 0) {
      const headers = Object.keys(passportRecapData[0]);
      recapSheet.columns = headers.map(key => ({ 
        header: key, 
        key: key, 
        width: key === 'No' ? 5 : key === 'Nama Lengkap' ? 30 : key === 'Kelompok' ? 15 : key.includes('Program') ? 25 : 18 
      }));
      recapSheet.addRows(passportRecapData);

      // Header Styling
      const headerRow = recapSheet.getRow(1);
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11, name: 'Calibri' };
      headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } }; // Navy Blue
      headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
      headerRow.height = 30;

      // Row & Cell Styling
      recapSheet.eachRow((row, rowNumber) => {
        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          // Borders
          cell.border = {
            top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
            left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
            bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
            right: { style: 'thin', color: { argb: 'FFCBD5E1' } }
          };
          
          // Data Rows Formatting
          if (rowNumber > 1) {
            cell.font = { size: 10, name: 'Calibri' };
            cell.alignment = { vertical: 'middle', horizontal: colNumber === 1 || cell.value === 'LULUS' || cell.value === 'BELUM' ? 'center' : 'left' };
            
            // Color code LULUS/BELUM
            if (cell.value === 'LULUS') {
              cell.font = { ...cell.font, color: { argb: 'FF059669' }, bold: true }; // Green
            } else if (cell.value === 'BELUM') {
              cell.font = { ...cell.font, color: { argb: 'FFDC2626' } }; // Red
            }
          }
        });
      });
    }

    // ==========================================
    // 2. STYLE DETAIL SHEET
    // ==========================================
    const detailSheet = workbook.addWorksheet('Detail Submissions', {
      views: [{ state: 'frozen', ySplit: 1 }]
    });

    if (detailedSubmissionsData.length > 0) {
      const headers = Object.keys(detailedSubmissionsData[0]);
      detailSheet.columns = headers.map(key => ({ 
        header: key, 
        key: key, 
        width: key === 'Nama Mahasiswa' || key === 'Nama Kegiatan' ? 30 : key === 'Catatan Feedback' ? 40 : 15 
      }));
      detailSheet.addRows(detailedSubmissionsData);

      // Header Styling
      const headerRow2 = detailSheet.getRow(1);
      headerRow2.font = { bold: true, color: { argb: 'FF000000' }, size: 11, name: 'Calibri' };
      headerRow2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF59E0B' } }; // UMLA Gold
      headerRow2.alignment = { vertical: 'middle', horizontal: 'center' };
      headerRow2.height = 30;

      // Row & Cell Styling
      detailSheet.eachRow((row, rowNumber) => {
        row.eachCell({ includeEmpty: true }, (cell) => {
          cell.border = {
            top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
            left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
            bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
            right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
          };
          if (rowNumber > 1) {
            cell.font = { size: 10, name: 'Calibri' };
            cell.alignment = { vertical: 'middle', wrapText: true };
          }
        });
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();

    // Audit log (non-blocking)
    try {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'DATA_EXPORT_EXCEL',
          entityType: 'REPORT',
          details: 'Admin exported Digital Student Passport recapitulation Excel file.',
        },
      });
    } catch (auditErr) {
      console.warn('Could not record audit log for export:', auditErr);
    }

    const uint8Array = new Uint8Array(buffer as ArrayBuffer);

    return new Response(uint8Array, {
      status: 200,
      headers: {
        'Content-Disposition': 'attachment; filename="REKAP_DIGITAL_PASSPORT_MASTAMA_UMLA_2026.xlsx"',
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    });
  } catch (error: any) {
    console.error('Error generating excel export:', error);
    return NextResponse.json({ error: error?.message || 'Gagal mengunduh berkas Excel.' }, { status: 500 });
  }
}
