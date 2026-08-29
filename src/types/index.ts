export type Role = 'STUDENT' | 'GROUP_MENTOR' | 'ADMIN';

export type GroupStatus = 'OPEN' | 'FULL' | 'LOCKED';
export type GroupAssignMode = 'STUDENT_SELECT' | 'ADMIN_ASSIGN';
export type ActivityMode = 'ONLINE' | 'OFFLINE';
export type VerificationType =
  | 'QR'
  | 'PHOTO'
  | 'PHOTO_DESC'
  | 'MENTOR_ATTENDANCE'
  | 'ONLINE'
  | 'MANUAL'
  | 'QR_PHOTO'
  | 'QR_PHOTO_DESC';

export type SubmissionStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'COMPLETED';

export type MissionCategory =
  | 'MASTAMA'
  | 'ORMAWA'
  | 'SPIRITUAL'
  | 'AI_CHALLENGE'
  | 'CAMPUS';

export type AiProjectStage =
  | 'IDE'
  | 'PROPOSAL'
  | 'DEVELOPMENT'
  | 'SUBMISSION'
  | 'PRESENTATION'
  | 'COMPLETED';

export interface UserSession {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  avatarUrl?: string | null;
  phoneNumber?: string | null;
  studentProfile?: {
    id: string;
    nim: string;
    faculty?: { id: string; name: string; code: string } | null;
    studyProgram?: { id: string; name: string; code: string } | null;
    group?: { id: string; name: string; number: number; mentor?: string } | null;
    totalXp: number;
    streakCount: number;
    badges?: Array<{ id: string; code: string; name: string; description: string; icon?: string }>;
    completedCount?: number;
    ormawaCount?: number;
    spiritualCount?: number;
  } | null;
  mentorGroups?: Array<{
    id: string;
    number: number;
    name: string;
    capacity: number;
    memberCount: number;
  }>;
}

export interface ActivityCardData {
  id: string;
  code: string;
  title: string;
  subtitle?: string | null;
  description: string;
  bannerImage?: string | null;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  mode: ActivityMode;
  picName?: string | null;
  picContact?: string | null;
  onlineUrl?: string | null;
  verificationType: VerificationType;
  xpReward: number;
  journeyTitle?: string;
  journeyCode?: string;
  submissionStatus?: SubmissionStatus | string | null;
  submissionId?: string | null;
  submissionPhoto?: string | null;
  submissionDesc?: string | null;
  rejectionReason?: string | null;
}
