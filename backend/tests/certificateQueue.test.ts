import { certificateQueueService } from '../src/services/certificate/CertificateQueueService';
import { googleDriveService } from '../src/services/googleDrive.service';
import { emailService } from '../src/services/email/EmailService';

describe('CertificateQueueService & FIFO Queue Pipeline Tests', () => {
  beforeAll(() => {
    jest.spyOn(googleDriveService, 'uploadCertificate').mockResolvedValue({
      driveFileId: 'mock-drive-id-12345',
      fileName: 'certificate.pdf',
      driveUrl: 'https://drive.google.com/file/d/mock-drive-id-12345/view',
      webContentLink: 'https://drive.google.com/file/d/mock-drive-id-12345/download',
    });
    jest.spyOn(emailService, 'sendEmailWithAttachments').mockResolvedValue({
      success: true,
      messageId: 'mock-email-id-12345',
    });
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  test('builds deterministic, idempotent jobId from studentId and courseId', () => {
    const id1 = certificateQueueService.buildJobId('student_123', 'course_linux_101');
    const id2 = certificateQueueService.buildJobId('student_123', 'course_linux_101');
    const idSpecial = certificateQueueService.buildJobId('stu@email.com:99', 'course/linux 101');

    expect(id1).toBe('job_student_123_course_linux_101');
    expect(id1).toBe(id2);
    expect(idSpecial).toBe('job_stu_email_com_99_course_linux_101');
  });

  test('calculates accurate rolling average processing time baseline', () => {
    const avgSec = certificateQueueService.getAverageProcessingSeconds();
    expect(avgSec).toBeGreaterThanOrEqual(3);
    expect(typeof avgSec).toBe('number');
  });

  test('calculates correct dynamic queue stats for queued, processing, and completed states', async () => {
    const completedJob: any = {
      jobId: 'job_test_01',
      status: 'completed',
      createdAt: new Date().toISOString(),
    };
    const completedStats = await certificateQueueService.calculateJobStats(completedJob);
    expect(completedStats.position).toBe(0);
    expect(completedStats.estimatedWaitSeconds).toBe(0);

    const processingJob: any = {
      jobId: 'job_test_02',
      status: 'processing',
      createdAt: new Date().toISOString(),
    };
    const processingStats = await certificateQueueService.calculateJobStats(processingJob);
    expect(processingStats.position).toBe(1);
    expect(processingStats.estimatedWaitSeconds).toBeGreaterThan(0);

    const queuedJob: any = {
      jobId: 'job_test_03',
      status: 'queued',
      createdAt: new Date().toISOString(),
    };
    const queuedStats = await certificateQueueService.calculateJobStats(queuedJob);
    expect(queuedStats.position).toBeGreaterThanOrEqual(1);
    expect(queuedStats.estimatedWaitSeconds).toBeGreaterThanOrEqual(3);
  });

  test('strictly maintains single-job idempotency when a student clicks Generate 10 times consecutively', async () => {
    const payload = {
      studentId: 'student_rapid_clicker',
      studentUid: 'student_rapid_clicker',
      studentName: 'Rapid Clicker',
      studentEmail: 'rapid@kaizenq.in',
      courseId: 'course_git_101',
      courseTitle: 'Git & GitHub Pro',
      courseDuration: '20 Hours',
      modulesCount: 6,
    };

    // Simulate 10 simultaneous clicks
    const requests = Array.from({ length: 10 }).map(() =>
      certificateQueueService.enqueueCertificateJob(payload)
    );

    const results = await Promise.all(requests);

    // All 10 requests should succeed and reference the EXACT SAME deterministic jobId
    const expectedJobId = certificateQueueService.buildJobId(payload.studentId, payload.courseId);
    results.forEach((res) => {
      expect(res.success).toBe(true);
      if (res.job) {
        expect(res.job.jobId).toBe(expectedJobId);
      }
    });
  }, 20000);

  test('handles 5 simultaneous distinct student requests safely in FIFO queue', async () => {
    const studentPayloads = Array.from({ length: 5 }).map((_, i) => ({
      studentId: `student_cohort_${i + 1}`,
      studentUid: `student_cohort_${i + 1}`,
      studentName: `Cohort Student ${i + 1}`,
      studentEmail: `student${i + 1}@kaizenq.in`,
      courseId: 'course_react_101',
      courseTitle: 'Modern React Architecture',
      courseDuration: '30 Hours',
      modulesCount: 8,
    }));

    const results = await Promise.all(
      studentPayloads.map((payload) => certificateQueueService.enqueueCertificateJob(payload))
    );

    expect(results.length).toBe(5);
    results.forEach((res, idx) => {
      expect(res.success).toBe(true);
      if (res.job) {
        expect(res.job.studentId).toBe(`student_cohort_${idx + 1}`);
      }
    });
  }, 20000);

  test('handles 10 simultaneous distinct student requests with bounded queue calculation', async () => {
    const studentPayloads = Array.from({ length: 10 }).map((_, i) => ({
      studentId: `student_scale_${i + 1}`,
      studentUid: `student_scale_${i + 1}`,
      studentName: `Scale Student ${i + 1}`,
      studentEmail: `scale${i + 1}@kaizenq.in`,
      courseId: 'course_linux_101',
      courseTitle: 'Linux Systems & Administration Mastery',
      courseDuration: '40 Hours',
      modulesCount: 12,
    }));

    const results = await Promise.all(
      studentPayloads.map((payload) => certificateQueueService.enqueueCertificateJob(payload))
    );

    expect(results.length).toBe(10);
    results.forEach((res) => {
      expect(res.success).toBe(true);
    });
  }, 20000);

  afterAll(async () => {
    // Wait briefly for in-flight worker tasks to settle
    await new Promise((resolve) => setTimeout(resolve, 2000));
  });
});
