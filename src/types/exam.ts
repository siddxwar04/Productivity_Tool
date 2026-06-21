export type ExamType = 'endterm' | 'midterm' | 'quiz' | 'custom';

export type ExamUrgency = 'relaxed' | 'steady' | 'focused' | 'final';

export interface Exam {
  id: string;
  title: string;
  subject: string;
  type: ExamType;
  date: string;
  color: string;
  notificationsEnabled: boolean;
  createdAt: string;
}

export const EXAM_TYPE_LABELS: Record<ExamType, string> = {
  endterm: 'End Term',
  midterm: 'Mid Term',
  quiz: 'Quiz',
  custom: 'Exam',
};

export const URGENCY_CONFIG: Record<ExamUrgency, {
  color: string;
  bgColor: string;
  label: string;
  encouragement: string;
}> = {
  relaxed: {
    color: '#6EE7B7',
    bgColor: '#0f2a1e',
    label: 'Plenty of time',
    encouragement: 'Great time to build strong study habits',
  },
  steady: {
    color: '#60A5FA',
    bgColor: '#1a2640',
    label: 'Stay consistent',
    encouragement: 'Steady daily progress is all you need',
  },
  focused: {
    color: '#A78BFA',
    bgColor: '#1e1a2e',
    label: 'Focus up',
    encouragement: 'This week counts — make it great',
  },
  final: {
    color: '#FCD34D',
    bgColor: '#2a1e10',
    label: 'Almost there',
    encouragement: 'Trust your preparation — you\'ve got this',
  },
};

export const getUrgency = (daysLeft: number): ExamUrgency => {
  if (daysLeft >= 30) return 'relaxed';
  if (daysLeft >= 15) return 'steady';
  if (daysLeft >= 7) return 'focused';
  return 'final';
};

export const getDaysLeft = (examDate: string): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exam = new Date(examDate);
  exam.setHours(0, 0, 0, 0);
  return Math.max(0, Math.ceil(
    (exam.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  ));
};
