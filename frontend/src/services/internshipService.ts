import { apiClient, type ApiResponse } from './apiClient';
import { db } from '@/firebase';
import { collection, doc, setDoc, getDocs, getDoc, deleteDoc } from 'firebase/firestore';
import { DEFAULT_CAREER_OPENINGS } from './careersService';

const LOCAL_STORAGE_OPPORTUNITIES_KEY = 'kaizenq_custom_opportunities';
const LOCAL_STORAGE_DELETED_KEY = 'kaizenq_deleted_opportunities';

export function getDeletedOpportunityIds(): string[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_DELETED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function markOpportunityAsDeletedLocally(ids: string | string[]) {
  try {
    const idList = Array.isArray(ids) ? ids : [ids];
    const currentDeleted = new Set(getDeletedOpportunityIds());
    idList.forEach((id) => {
      if (id) currentDeleted.add(id);
    });
    localStorage.setItem(LOCAL_STORAGE_DELETED_KEY, JSON.stringify(Array.from(currentDeleted)));

    // Clean up from custom opportunities list
    const existing = getLocalCustomOpportunities().filter((e) => !currentDeleted.has(e.id));
    localStorage.setItem(LOCAL_STORAGE_OPPORTUNITIES_KEY, JSON.stringify(existing));
  } catch (err) {
    console.warn('LocalStorage delete tracking notice:', err);
  }
}

export function unmarkOpportunityAsDeletedLocally(id: string) {
  try {
    const currentDeleted = new Set(getDeletedOpportunityIds());
    currentDeleted.delete(id);
    localStorage.setItem(LOCAL_STORAGE_DELETED_KEY, JSON.stringify(Array.from(currentDeleted)));
  } catch (err) {
    console.warn('LocalStorage undelete tracking notice:', err);
  }
}

function getLocalCustomOpportunities(): Internship[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_OPPORTUNITIES_KEY);
    const deletedIds = new Set(getDeletedOpportunityIds());
    const list: Internship[] = raw ? JSON.parse(raw) : [];
    return list.filter((e) => !deletedIds.has(e.id) && e.status !== 'DELETED' && !(e as any).isDeleted);
  } catch {
    return [];
  }
}

function saveCustomOpportunityLocally(op: Internship) {
  try {
    unmarkOpportunityAsDeletedLocally(op.id);
    const existing = getLocalCustomOpportunities();
    const index = existing.findIndex((e) => e.id === op.id);
    if (index >= 0) {
      existing[index] = { ...existing[index], ...op };
    } else {
      existing.unshift(op);
    }
    localStorage.setItem(LOCAL_STORAGE_OPPORTUNITIES_KEY, JSON.stringify(existing));
  } catch (err) {
    console.warn('LocalStorage save notice:', err);
  }
}

function removeCustomOpportunityLocally(id: string | string[]) {
  markOpportunityAsDeletedLocally(id);
}

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
  curriculum?: string;
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
  applicationId?: string;
  referenceNumber?: string;
  internshipId: string;
  internshipTitle: string;
  domain: string;
  department?: string;
  workMode?: string;
  userId?: string;
  fullName: string;
  email: string;
  phone: string;
  college?: string;
  degree?: string;
  branch?: string;
  currentYear?: string;
  graduationYear?: number;
  skills?: string;
  resumeUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  statementOfPurpose?: string;
  coverLetter?: string;
  status: 'New' | 'Under Review' | 'Shortlisted' | 'Interview Scheduled' | 'Selected' | 'Rejected' | 'SUBMITTED' | 'UNDER_REVIEW' | 'SHORTLISTED' | 'INTERVIEW_SCHEDULED' | 'INTERVIEW' | 'SELECTED' | 'REJECTED' | 'WITHDRAWN' | string;
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
  totalOpportunities?: number;
  openInternships: number;
  publishedOpportunities?: number;
  draftInternships?: number;
  archivedInternships?: number;
  totalApplications: number;
  newApplications?: number;
  underReview: number;
  shortlisted: number;
  interviewScheduled?: number;
  selected: number;
  rejected?: number;
  activeEnrollments: number;
  completedEnrollments: number;
  applicationsByDomain: Record<string, number>;
  applicationsByDepartment?: Record<string, number>;
  applicationsByOpportunity?: Record<string, number>;
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
    const deletedIds = new Set(getDeletedOpportunityIds());
    let list: Internship[] = [];
    try {
      const res = await apiClient.get<ApiResponse<{ content: Internship[]; totalElements: number; totalPages: number }>>('/careers', {
        params,
      });
      if (res.data?.data?.content) {
        list = res.data.data.content.filter(
          (o) => !deletedIds.has(o.id) && o.status !== 'DELETED' && !(o as any).isDeleted
        );
      }
    } catch (apiErr) {
      console.warn('Backend /careers offline or unreachable, falling back to cloud Firestore & local storage:', apiErr);
    }

    if (list.length === 0) {
      // Read from Firestore client
      let cloudList: Internship[] = [];
      try {
        if (db) {
          const snap = await getDocs(collection(db, 'careers'));
          cloudList = snap.docs
            .map((d) => ({ id: d.id, ...d.data() } as Internship))
            .filter((o) => !deletedIds.has(o.id) && o.status !== 'DELETED' && !(o as any).isDeleted);
        }
      } catch (fsErr) {
        console.warn('Firestore client read notice:', fsErr);
      }

      const localList = getLocalCustomOpportunities().filter(
        (o) => !deletedIds.has(o.id) && o.status !== 'DELETED' && !(o as any).isDeleted
      );
      const map = new Map<string, Internship>();
      DEFAULT_CAREER_OPENINGS.forEach((o) => {
        if (!deletedIds.has(o.id)) {
          map.set(o.id, o);
        }
      });
      cloudList.forEach((o) => map.set(o.id, o));
      localList.forEach((o) => map.set(o.id, o));
      list = Array.from(map.values());
    }

    // Filter only published/open opportunities and exclude any deleted items
    let filtered = list.filter(
      (o) =>
        !deletedIds.has(o.id) &&
        o.status !== 'DELETED' &&
        !(o as any).isDeleted &&
        (o.status === 'PUBLISHED' || o.status === 'OPEN' || !o.status)
    );

    if (params?.domain && params.domain !== 'ALL') {
      filtered = filtered.filter((o) => o.domain.toLowerCase() === params.domain!.toLowerCase());
    }
    if (params?.department && params.department !== 'ALL') {
      filtered = filtered.filter((o) => o.department?.toLowerCase() === params.department!.toLowerCase());
    }
    if (params?.employmentType && params.employmentType !== 'ALL') {
      filtered = filtered.filter((o) => o.employmentType?.toUpperCase() === params.employmentType!.toUpperCase());
    }
    if (params?.internshipType && params.internshipType !== 'ALL') {
      filtered = filtered.filter((o) => o.internshipType?.toUpperCase() === params.internshipType!.toUpperCase());
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(
        (o) =>
          o.title.toLowerCase().includes(q) ||
          o.requiredSkills.toLowerCase().includes(q) ||
          (o.description && o.description.toLowerCase().includes(q))
      );
    }

    return {
      content: filtered,
      totalElements: filtered.length,
      totalPages: 1,
    };
  },

  async getInternshipDetail(slugOrId: string) {
    const deletedIds = new Set(getDeletedOpportunityIds());
    if (deletedIds.has(slugOrId)) {
      throw new Error('Opportunity has been removed.');
    }

    try {
      const res = await apiClient.get<ApiResponse<InternshipDetail>>(`/careers/${slugOrId}`);
      if (res.data?.data) {
        if (deletedIds.has(res.data.data.id)) {
          throw new Error('Opportunity has been removed.');
        }
        return res.data.data;
      }
    } catch (apiErr: any) {
      if (apiErr?.message?.includes('removed')) throw apiErr;
      console.warn('Backend get detail offline, checking Firestore and local catalog:', apiErr);
    }

    // Fallback to local or default
    const localList = getLocalCustomOpportunities().filter((o) => !deletedIds.has(o.id));
    const found =
      localList.find((o) => o.id === slugOrId || o.slug === slugOrId) ||
      DEFAULT_CAREER_OPENINGS.find((o) => !deletedIds.has(o.id) && (o.id === slugOrId || o.slug === slugOrId));

    if (found) {
      return {
        ...found,
        curriculum: found.curriculum || '',
        tasks: [],
      } as InternshipDetail;
    }

    throw new Error('Opportunity not found.');
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
    const deletedIds = new Set(getDeletedOpportunityIds());

    try {
      const res = await apiClient.get<ApiResponse<{ content: Internship[]; totalElements: number; totalPages: number }>>('/admin/careers/opportunities', {
        params,
      });
      if (res.data?.data?.content) {
        const cleaned = res.data.data.content.filter(
          (o) => !deletedIds.has(o.id) && o.status !== 'DELETED' && !(o as any).isDeleted
        );
        return {
          content: cleaned,
          totalElements: cleaned.length,
          totalPages: 1,
        };
      }
    } catch (apiErr) {
      console.warn('Backend get opportunities unavailable, loading from Firestore & local cache:', apiErr);
    }

    // Read from Firestore client
    let cloudList: Internship[] = [];
    try {
      if (db) {
        const snap = await getDocs(collection(db, 'careers'));
        cloudList = snap.docs
          .map((d) => ({ id: d.id, ...d.data() } as Internship))
          .filter((o) => !deletedIds.has(o.id) && o.status !== 'DELETED' && !(o as any).isDeleted);
      }
    } catch (fsErr) {
      console.warn('Firestore client read notice:', fsErr);
    }

    const localList = getLocalCustomOpportunities().filter(
      (o) => !deletedIds.has(o.id) && o.status !== 'DELETED' && !(o as any).isDeleted
    );
    const map = new Map<string, Internship>();
    DEFAULT_CAREER_OPENINGS.forEach((o) => {
      if (!deletedIds.has(o.id)) {
        map.set(o.id, o);
      }
    });
    cloudList.forEach((o) => map.set(o.id, o));
    localList.forEach((o) => map.set(o.id, o));

    const combined = Array.from(map.values()).filter(
      (o) => !deletedIds.has(o.id) && o.status !== 'DELETED' && !(o as any).isDeleted
    );

    return {
      content: combined,
      totalElements: combined.length,
      totalPages: 1,
    };
  },

  async adminGetInternshipById(id: string) {
    const deletedIds = new Set(getDeletedOpportunityIds());
    if (deletedIds.has(id)) {
      throw new Error('Opportunity has been removed.');
    }

    try {
      const res = await apiClient.get<ApiResponse<Internship>>(`/admin/careers/opportunities/${id}`);
      if (res.data?.data) {
        if (deletedIds.has(res.data.data.id)) {
          throw new Error('Opportunity has been removed.');
        }
        return res.data.data;
      }
    } catch (apiErr: any) {
      if (apiErr?.message?.includes('removed')) throw apiErr;
      console.warn('Backend get by ID unavailable, checking Firestore and local storage:', apiErr);
    }

    try {
      if (db) {
        const snap = await getDoc(doc(collection(db, 'careers'), id));
        if (snap.exists()) {
          const data = { id: snap.id, ...snap.data() } as Internship;
          if (!deletedIds.has(data.id) && data.status !== 'DELETED' && !(data as any).isDeleted) {
            return data;
          }
        }
      }
    } catch (fsErr) {
      console.warn('Firestore getDoc notice:', fsErr);
    }

    const localList = getLocalCustomOpportunities().filter((o) => !deletedIds.has(o.id));
    const foundLocal = localList.find((o) => o.id === id || o.slug === id);
    if (foundLocal) return foundLocal;

    const foundDefault = DEFAULT_CAREER_OPENINGS.find((o) => !deletedIds.has(o.id) && (o.id === id || o.slug === id));
    if (foundDefault) return foundDefault;

    throw new Error('Opportunity not found.');
  },

  async adminCreateInternship(payload: Partial<Internship>) {
    // 1. Try backend API first
    try {
      const res = await apiClient.post<ApiResponse<Internship>>('/admin/careers/opportunities', payload);
      if (res.data?.data) {
        saveCustomOpportunityLocally(res.data.data);
        return res.data.data;
      }
    } catch (apiErr) {
      console.warn('Backend /admin/careers/opportunities unavailable, saving directly to cloud Firestore & local storage:', apiErr);
    }

    // 2. Direct Firestore fallback
    const id = payload.id || `op-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const title = payload.title?.trim() || 'Untitled Opportunity';
    const slug = payload.slug?.trim() || title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-') + `-${randomSuffix}`;

    const newOp: Internship = {
      id,
      title,
      slug,
      domain: payload.domain || 'Engineering',
      department: payload.department || 'Engineering',
      employmentType: payload.employmentType || 'INTERNSHIP',
      internshipType: (payload.internshipType as any) || 'REMOTE',
      duration: payload.duration || '12 Weeks',
      location: payload.location || 'Remote, India',
      openings: Number(payload.openings) || 1,
      stipendType: (payload.stipendType as any) || 'PERFORMANCE_BASED',
      stipendAmount: payload.stipendAmount || 'Performance Stipend + Certificate',
      eligibility: payload.eligibility || 'Open to qualified candidates',
      requiredSkills: payload.requiredSkills || 'Problem Solving',
      preferredSkills: payload.preferredSkills || '',
      description: payload.description || '',
      curriculum: payload.curriculum || '',
      responsibilities: payload.responsibilities || '',
      learningOutcomes: payload.learningOutcomes || '',
      status: (payload.status as any) || 'PUBLISHED',
      isFeatured: Boolean(payload.isFeatured),
      deadline: payload.deadline,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save to Firestore if client is initialized
    try {
      if (db) {
        await setDoc(doc(collection(db, 'careers'), id), newOp, { merge: true });
      }
    } catch (fsErr) {
      console.warn('Firestore client write fallback notice:', fsErr);
    }

    // Save to local cache
    saveCustomOpportunityLocally(newOp);
    return newOp;
  },

  async adminUpdateInternship(id: string, payload: Partial<Internship>) {
    try {
      const res = await apiClient.put<ApiResponse<Internship>>(`/admin/careers/opportunities/${id}`, payload);
      if (res.data?.data) {
        saveCustomOpportunityLocally(res.data.data);
        return res.data.data;
      }
    } catch (apiErr) {
      console.warn('Backend update unavailable, saving directly to cloud Firestore & local storage:', apiErr);
    }

    const updated: any = {
      ...payload,
      id,
      updatedAt: new Date().toISOString(),
    };

    try {
      if (db) {
        await setDoc(doc(collection(db, 'careers'), id), updated, { merge: true });
      }
    } catch (fsErr) {
      console.warn('Firestore client update fallback notice:', fsErr);
    }

    saveCustomOpportunityLocally(updated);
    return updated as Internship;
  },

  async adminPatchInternshipStatus(id: string, status: string) {
    try {
      const res = await apiClient.patch<ApiResponse<Internship>>(`/admin/careers/opportunities/${id}/status?status=${status}`);
      if (res.data?.data) {
        saveCustomOpportunityLocally(res.data.data);
        return res.data.data;
      }
    } catch (apiErr) {
      console.warn('Backend patch status unavailable, updating locally & in Firestore:', apiErr);
    }

    const updated: any = { id, status, updatedAt: new Date().toISOString() };
    try {
      if (db) {
        await setDoc(doc(collection(db, 'careers'), id), updated, { merge: true });
      }
    } catch (fsErr) {
      console.warn('Firestore status patch notice:', fsErr);
    }
    saveCustomOpportunityLocally(updated);
    return updated;
  },

  async adminDeleteInternship(id: string) {
    // 1. Immediately register locally as deleted so all UI and fallbacks immediately exclude it
    markOpportunityAsDeletedLocally(id);

    // 2. Call backend API delete
    try {
      await apiClient.delete<ApiResponse<void>>(`/admin/careers/opportunities/${id}`);
    } catch (apiErr) {
      console.warn('Backend delete unavailable, deleting directly from cloud Firestore & local storage:', apiErr);
    }

    // 3. Delete from Firestore and mark tombstone
    try {
      if (db) {
        await setDoc(
          doc(collection(db, 'careers'), id),
          { status: 'DELETED', isDeleted: true, updatedAt: new Date().toISOString() },
          { merge: true }
        ).catch(() => null);
        await deleteDoc(doc(collection(db, 'careers'), id)).catch(() => null);
      }
    } catch (fsErr) {
      console.warn('Firestore client delete fallback notice:', fsErr);
    }

    return { success: true };
  },

  async adminBulkActionInternships(
    action: 'publish' | 'unpublish' | 'archive' | 'feature' | 'unfeature' | 'delete',
    ids: string[]
  ) {
    if (!ids || ids.length === 0) return { processedCount: 0, failedIds: [] };

    // If deleting, immediately register all IDs locally so they vanish instantly
    if (action === 'delete') {
      markOpportunityAsDeletedLocally(ids);
    }

    try {
      const res = await apiClient.post<ApiResponse<{ action: string; processedCount: number; processedIds: string[]; failedIds: string[] }>>(
        '/admin/careers/opportunities/bulk',
        { action, ids }
      );
      if (res.data?.data) {
        ids.forEach((id) => {
          if (action === 'delete') {
            markOpportunityAsDeletedLocally(id);
          } else {
            const patch: any = { id, updatedAt: new Date().toISOString() };
            if (action === 'publish') patch.status = 'PUBLISHED';
            else if (action === 'unpublish') patch.status = 'DRAFT';
            else if (action === 'archive') patch.status = 'ARCHIVED';
            else if (action === 'feature') patch.isFeatured = true;
            else if (action === 'unfeature') patch.isFeatured = false;
            saveCustomOpportunityLocally(patch);
          }
        });
        return res.data.data;
      }
    } catch (apiErr) {
      console.warn('Backend bulk endpoint unavailable, executing directly on Firestore & local cache:', apiErr);
    }

    // Direct Firestore client fallback
    for (const id of ids) {
      try {
        if (action === 'delete') {
          markOpportunityAsDeletedLocally(id);
          if (db) {
            await setDoc(
              doc(collection(db, 'careers'), id),
              { status: 'DELETED', isDeleted: true, updatedAt: new Date().toISOString() },
              { merge: true }
            ).catch(() => null);
            await deleteDoc(doc(collection(db, 'careers'), id)).catch(() => null);
          }
        } else {
          const patch: any = { updatedAt: new Date().toISOString() };
          if (action === 'publish') patch.status = 'PUBLISHED';
          else if (action === 'unpublish') patch.status = 'DRAFT';
          else if (action === 'archive') patch.status = 'ARCHIVED';
          else if (action === 'feature') patch.isFeatured = true;
          else if (action === 'unfeature') patch.isFeatured = false;

          if (db) await setDoc(doc(collection(db, 'careers'), id), patch, { merge: true });
          saveCustomOpportunityLocally({ id, ...patch } as any);
        }
      } catch (err) {
        console.warn(`Firestore bulk fallback error for ${id}:`, err);
      }
    }

    return {
      action,
      processedCount: ids.length,
      processedIds: ids,
      failedIds: [],
    };
  },

  async adminGetApplications(params?: { internshipId?: string; status?: string; search?: string; page?: number; size?: number }) {
    const res = await apiClient.get<ApiResponse<{ content: InternshipApplication[]; totalElements: number; totalPages: number }>>(
      '/admin/careers/applications',
      { params }
    );
    return res.data.data;
  },

  async adminUpdateApplicationStatus(id: string, status: string, adminNotes?: string, sendStatusEmail?: boolean) {
    const res = await apiClient.patch<ApiResponse<InternshipApplication>>(`/admin/careers/applications/${id}/status`, {
      status,
      adminNotes,
      sendStatusEmail,
    });
    return res.data.data;
  },

  async adminSyncApplicationsWithGoogleSheets() {
    const res = await apiClient.post<ApiResponse<{ totalCount: number; timestamp: string }>>('/admin/careers/sync');
    return res.data;
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
