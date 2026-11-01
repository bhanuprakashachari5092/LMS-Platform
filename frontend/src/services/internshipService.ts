import { apiClient, type ApiResponse } from './apiClient';

export interface Internship {
  id: string;
  title: string;
  slug: string;
  domain: string;
  department?: string;
  employmentType?: 'INTERNSHIP' | 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | string;
  experienceLevel?: 'ENTRY_LEVEL' | 'MID_LEVEL' | 'SENIOR' | string;
  internshipType: 'REMOTE' | 'HYBRID' | 'ONSITE' | string;
  duration: string;
  location: string;
  openings: number;
  deadline?: string;
  stipendType: 'UNPAID' | 'PERFORMANCE_BASED' | 'FIXED' | 'NOT_DISCLOSED' | string;
  stipendAmount?: string;
  eligibility: string;
  requiredSkills: string;
  preferredSkills?: string;
  description: string;
  responsibilities?: string;
  learningOutcomes?: string;
  mentorName?: string;
  mentorTitle?: string;
  status: 'OPEN' | 'PUBLISHED' | 'CLOSED' | 'DRAFT' | 'ARCHIVED' | string;
  isFeatured: boolean;
  createdAt: string;
}

export interface InternshipTask {
  id: string;
  weekNumber: number;
  title: string;
  description: string;
  deliverables?: string;
  maxScore: number;
  displayOrder: number;
}

export interface InternshipDetail extends Internship {
  tasks: InternshipTask[];
}

export interface InternshipApplication {
  id: string;
  referenceNumber?: string;
  internshipId: string;
  internshipTitle: string;
  domain: string;
  userId?: string;
  fullName: string;
  email: string;
  phone: string;
  college: string;
  degree: string;
  branch: string;
  currentYear: string;
  graduationYear: number;
  skills: string;
  resumeUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  statementOfPurpose?: string;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'SHORTLISTED' | 'INTERVIEW_SCHEDULED' | 'INTERVIEW' | 'SELECTED' | 'REJECTED' | 'WITHDRAWN';
  adminNotes?: string;
  withdrawalReason?: string;
  withdrawnAt?: string;
  interview?: {
    id: string;
    applicationId: string;
    scheduledAt: string;
    meetingLink?: string;
    interviewerName?: string;
    roundName?: string;
    feedback?: string;
    status: string;
  };
  appliedAt: string;
}

export interface SubmitApplicationPayload {
  internshipId: string;
  fullName: string;
  email: string;
  phone: string;
  college: string;
  degree: string;
  branch: string;
  currentYear: string;
  graduationYear: number;
  skills: string;
  resumeUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  statementOfPurpose?: string;
}

export interface EnrollmentTaskSubmission {
  taskId: string;
  weekNumber: number;
  title: string;
  description: string;
  deliverables?: string;
  maxScore: number;
  submissionId?: string;
  repoUrl?: string;
  liveDemoUrl?: string;
  notes?: string;
  score?: number;
  feedback?: string;
  submissionStatus: 'PENDING' | 'SUBMITTED' | 'GRADED' | string;
  submittedAt?: string;
}

export interface InternshipEnrollment {
  id: string;
  internshipId: string;
  internshipTitle: string;
  domain: string;
  userId: string;
  status: 'ACTIVE' | 'COMPLETED' | 'DROPPED';
  startDate: string;
  endDate?: string;
  completionDate?: string;
  progressPercentage: number;
  mentorNotes?: string;
  taskSubmissions: EnrollmentTaskSubmission[];
  createdAt: string;
}

export interface InternshipCertificate {
  id: string;
  enrollmentId: string;
  userId: string;
  certificateNumber: string;
  studentName: string;
  internshipTitle: string;
  domain: string;
  duration: string;
  issueDate: string;
  verificationHash: string;
  verificationUrl: string;
  pdfUrl?: string;
  status: 'VALID' | 'REVOKED';
  createdAt: string;
}

export interface InternshipAnalytics {
  totalInternships: number;
  openInternships: number;
  totalApplications: number;
  underReview: number;
  shortlisted: number;
  selected: number;
  activeEnrollments: number;
  completedEnrollments: number;
  applicationsByDomain: Record<string, number>;
}

export const internshipService = {
  // Public
  async getOpenInternships(params?: {
    domain?: string;
    department?: string;
    employmentType?: string;
    type?: string;
    internshipType?: string;
    search?: string;
    page?: number;
    size?: number;
  }) {
    const res = await apiClient.get<ApiResponse<{ content: Internship[]; totalElements: number; totalPages: number }>>('/careers', {
      params,
    });
    return res.data.data;
  },

  async getInternshipDetail(slugOrId: string) {
    const res = await apiClient.get<ApiResponse<InternshipDetail>>(`/careers/${slugOrId}`);
    return res.data.data;
  },

  async submitApplication(payload: SubmitApplicationPayload) {
    const res = await apiClient.post<ApiResponse<InternshipApplication>>('/careers/apply', payload);
    return res.data;
  },

  async withdrawApplication(applicationId: string, reason?: string) {
    const res = await apiClient.post<ApiResponse<InternshipApplication>>(`/careers/applications/${applicationId}/withdraw`, { reason });
    return res.data.data;
  },

  async getMyApplications() {
    const res = await apiClient.get<ApiResponse<InternshipApplication[]>>('/careers/my-applications');
    return res.data.data;
  },

  async getMyEnrollments() {
    const res = await apiClient.get<ApiResponse<InternshipEnrollment[]>>('/internships/my-enrollments');
    return res.data.data;
  },

  async submitTask(taskId: string, payload: { enrollmentId: string; repoUrl?: string; liveDemoUrl?: string; notes?: string }) {
    const res = await apiClient.post<ApiResponse<EnrollmentTaskSubmission>>(`/internships/tasks/${taskId}/submit`, payload);
    return res.data.data;
  },

  async getMyCertificates() {
    const res = await apiClient.get<ApiResponse<InternshipCertificate[]>>('/internships/my-certificates');
    return res.data.data;
  },

  async verifyCertificate(certificateNumber: string) {
    const res = await apiClient.get<ApiResponse<InternshipCertificate>>(`/careers/verify/${certificateNumber}`);
    return res.data.data;
  },

  // Admin APIs
  async adminGetInternships(params?: { page?: number; size?: number }) {
    const res = await apiClient.get<ApiResponse<{ content: Internship[]; totalElements: number; totalPages: number }>>('/admin/careers/openings', {
      params,
    });
    return res.data.data;
  },

  async adminCreateInternship(payload: Partial<Internship>) {
    const res = await apiClient.post<ApiResponse<Internship>>('/admin/careers/openings', payload);
    return res.data.data;
  },

  async adminUpdateInternship(id: string, payload: Partial<Internship>) {
    const res = await apiClient.put<ApiResponse<Internship>>(`/admin/careers/openings/${id}`, payload);
    return res.data.data;
  },

  async adminPatchInternshipStatus(id: string, status: string) {
    const res = await apiClient.patch<ApiResponse<Internship>>(`/admin/careers/openings/${id}/status?status=${status}`);
    return res.data.data;
  },

  async adminDeleteInternship(id: string) {
    const res = await apiClient.delete<ApiResponse<void>>(`/admin/careers/openings/${id}`);
    return res.data;
  },

  async adminGetApplications(params?: { internshipId?: string; status?: string; search?: string; page?: number; size?: number }) {
    const res = await apiClient.get<ApiResponse<{ content: InternshipApplication[]; totalElements: number; totalPages: number }>>(
      '/admin/careers/applications',
      { params }
    );
    return res.data.data;
  },

  async adminUpdateApplicationStatus(id: string, status: string, adminNotes?: string) {
    const res = await apiClient.patch<ApiResponse<InternshipApplication>>(`/admin/careers/applications/${id}/status`, {
      status,
      adminNotes,
    });
    return res.data.data;
  },

  async adminScheduleInterview(id: string, payload: { scheduledAt: string; meetingLink?: string; interviewerName?: string; roundName?: string }) {
    const res = await apiClient.post<ApiResponse<any>>(`/admin/careers/applications/${id}/schedule-interview`, payload);
    return res.data.data;
  },

  async adminEnrollStudent(applicationId: string) {
    const res = await apiClient.post<ApiResponse<InternshipEnrollment>>(`/admin/careers/applications/${applicationId}/enroll`);
    return res.data.data;
  },

  async adminCompleteEnrollment(enrollmentId: string) {
    const res = await apiClient.post<ApiResponse<InternshipCertificate>>(`/admin/careers/enrollments/${enrollmentId}/complete`);
    return res.data.data;
  },

  async adminGetAnalytics() {
    const res = await apiClient.get<ApiResponse<InternshipAnalytics>>('/admin/careers/analytics');
    return res.data.data;
  },

  async adminExportApplicationsCsv(internshipId?: string, status?: string) {
    const params = new URLSearchParams();
    if (internshipId && internshipId !== 'ALL') params.append('internshipId', internshipId);
    if (status && status !== 'ALL') params.append('status', status);

    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`/api/v1/admin/careers/applications/export?${params.toString()}`, {
      headers,
    });
    if (!res.ok) throw new Error('Failed to download CSV export');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kaizenq_applicant_directory_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  },
};
