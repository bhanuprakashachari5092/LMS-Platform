import { apiClient, type ApiResponse } from './apiClient';

export interface Internship {
  id: string;
  title: string;
  slug: string;
  domain: string;
  internshipType: 'REMOTE' | 'HYBRID' | 'ONSITE' | string;
  duration: string;
  location: string;
  openings: number;
  deadline?: string;
  stipendType: 'UNPAID' | 'PERFORMANCE_BASED' | 'FIXED' | string;
  stipendAmount?: string;
  eligibility: string;
  requiredSkills: string;
  description: string;
  responsibilities?: string;
  learningOutcomes?: string;
  mentorName?: string;
  mentorTitle?: string;
  status: 'OPEN' | 'CLOSED' | 'ARCHIVED' | string;
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
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'SHORTLISTED' | 'INTERVIEW_SCHEDULED' | 'SELECTED' | 'REJECTED';
  adminNotes?: string;
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
  submissionStatus: 'PENDING' | 'SUBMITTED' | 'REVIEWED' | 'REVISION_REQUESTED' | 'APPROVED';
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
  status: string;
  createdAt: string;
}

export interface InternshipAnalytics {
  totalInternships: number;
  openInternships: number;
  totalApplications: number;
  underReviewApplications: number;
  shortlistedApplications: number;
  selectedApplications: number;
  activeEnrollments: number;
  completedEnrollments: number;
  applicationsByDomain: Record<string, number>;
}

export const internshipService = {
  // Public
  async getOpenInternships(params?: { domain?: string; type?: string; search?: string; page?: number; size?: number }) {
    const res = await apiClient.get<ApiResponse<{ content: Internship[]; totalElements: number; totalPages: number }>>('/internships', {
      params,
    });
    return res.data.data;
  },

  async getInternshipDetail(slugOrId: string) {
    const res = await apiClient.get<ApiResponse<InternshipDetail>>(`/internships/${slugOrId}`);
    return res.data.data;
  },

  async submitApplication(payload: SubmitApplicationPayload) {
    const res = await apiClient.post<ApiResponse<InternshipApplication>>('/internships/apply', payload);
    return res.data;
  },

  async getMyApplications() {
    const res = await apiClient.get<ApiResponse<InternshipApplication[]>>('/internships/my-applications');
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
    const res = await apiClient.get<ApiResponse<InternshipCertificate>>(`/internships/verify/${certificateNumber}`);
    return res.data.data;
  },

  // Admin APIs
  async adminGetInternships(params?: { page?: number; size?: number }) {
    const res = await apiClient.get<ApiResponse<{ content: Internship[]; totalElements: number; totalPages: number }>>('/admin/internships', {
      params,
    });
    return res.data.data;
  },

  async adminCreateInternship(payload: Partial<Internship>) {
    const res = await apiClient.post<ApiResponse<Internship>>('/admin/internships', payload);
    return res.data.data;
  },

  async adminUpdateInternship(id: string, payload: Partial<Internship>) {
    const res = await apiClient.put<ApiResponse<Internship>>(`/admin/internships/${id}`, payload);
    return res.data.data;
  },

  async adminDeleteInternship(id: string) {
    const res = await apiClient.delete<ApiResponse<void>>(`/admin/internships/${id}`);
    return res.data;
  },

  async adminGetApplications(params?: { internshipId?: string; status?: string; search?: string; page?: number; size?: number }) {
    const res = await apiClient.get<ApiResponse<{ content: InternshipApplication[]; totalElements: number; totalPages: number }>>(
      '/admin/internships/applications',
      { params }
    );
    return res.data.data;
  },

  async adminUpdateApplicationStatus(id: string, status: string, adminNotes?: string) {
    const res = await apiClient.patch<ApiResponse<InternshipApplication>>(`/admin/internships/applications/${id}/status`, {
      status,
      adminNotes,
    });
    return res.data.data;
  },

  async adminScheduleInterview(id: string, payload: { scheduledAt: string; meetingLink?: string; interviewerName?: string; roundName?: string }) {
    const res = await apiClient.post<ApiResponse<any>>(`/admin/internships/applications/${id}/schedule-interview`, payload);
    return res.data.data;
  },

  async adminEnrollStudent(applicationId: string) {
    const res = await apiClient.post<ApiResponse<InternshipEnrollment>>(`/admin/internships/applications/${applicationId}/enroll`);
    return res.data.data;
  },

  async adminCompleteEnrollment(enrollmentId: string) {
    const res = await apiClient.post<ApiResponse<InternshipCertificate>>(`/admin/internships/enrollments/${enrollmentId}/complete`);
    return res.data.data;
  },

  async adminGetAnalytics() {
    const res = await apiClient.get<ApiResponse<InternshipAnalytics>>('/admin/internships/analytics');
    return res.data.data;
  },
};

