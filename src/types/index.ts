export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'STUDENT' | 'ADMIN' | 'UNIVERSITY';
  universityId: string | null;
  universityDomain: string | null;
  universityVerified: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
}

/**
 * Shape of `GET /api/university/metrics` (backend/src/routes/university.ts).
 * Every field is an anonymous aggregate scoped to the caller's `universityId`;
 * the endpoint never returns a student id, name, email, check-in or chat log.
 */
export interface UniversityQuizMetric {
  quizId: string;
  title: string;
  category: string;
  maxScore: number;
  totalSubmissions: number;
  averageScore: number;
  minScore: number;
  maxObservedScore: number;
}

export interface UniversityMetrics {
  university: { id: string; name: string; domain: string | null };
  totalStudents: number;
  /** Absent from the zero-student response, hence optional. */
  participatingStudents?: number;
  participationRate?: number;
  totalSubmissions: number;
  clusterAverage: number;
  classificationDistribution: { label: string; count: number; percentage: number }[];
  quizMetrics: UniversityQuizMetric[];
  submissionTrend: { date: string; count: number }[];
}

/**
 * Shape of `GET /api/admin/metrics` (backend/src/routes/admin.ts) — system-wide,
 * ADMIN-only, and not scoped to any university. `avgDailyMood` is null when no
 * DailyCheckin rows exist, so callers must handle null rather than assume a number.
 */
export interface AdminMetrics {
  totalSubmissions: number;
  totalUniqueUsers: number;
  classificationMetrics: {
    classification: string;
    count: number;
    averageScore: number;
    maxScore: number;
    minScore: number;
  }[];
  quizMetrics: {
    quizId: string;
    title: string;
    category: string;
    maxScore: number;
    totalSubmissions: number;
    averageScore: number;
  }[];
  submissionTrend: { date: string; count: number }[];
  avgDailyMood: number | null;
  totalCheckins: number;
}

/** One row of `GET /api/admin/students`, which returns `{ students: AdminStudent[] }`. */
export interface AdminStudent {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  university: { name: string; domain: string | null } | null;
}
