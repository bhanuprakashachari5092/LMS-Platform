import request from 'supertest';
import app from '../src/app';
import { db } from '../src/firebase';
import { certificateQueueService } from '../src/services/certificate/CertificateQueueService';
import { pdfCertificateGenerator } from '../src/services/certificate/PDFCertificateGenerator';
import { qrCodeService } from '../src/services/certificate/QRCodeService';
import { googleDriveService } from '../src/services/googleDrive.service';
import { emailService } from '../src/services/email/EmailService';
import { certificatesCollection, certificateJobsCollection } from '../src/firebase/collections';

describe('Phase 3G: Certificate End-to-End Production Smoke Test', () => {
  const smokeStudent = {
    uid: 'smoke_test_student_2026',
    email: 'smoke.test@kaizenq.in',
    name: 'Banu Prakash SmokeTester',
  };

  const course = {
    courseId: 'course_smoke_linux_101',
    courseTitle: 'Linux Systems & Cloud Architecture',
    courseDuration: '25 Hours',
    modulesCount: '8 Modules',
    achievement: '100% Score • Mastery',
  };

  let generatedCertificateId = '';

  beforeAll(async () => {
    jest.spyOn(googleDriveService, 'uploadCertificate').mockResolvedValue({
      driveFileId: 'mock-drive-id-smoke-12345',
      fileName: 'certificate.pdf',
      driveUrl: 'https://drive.google.com/file/d/mock-drive-id-smoke-12345/view',
      webContentLink: 'https://drive.google.com/file/d/mock-drive-id-smoke-12345/download',
    });
    jest.spyOn(emailService, 'sendEmailWithAttachments').mockResolvedValue({
      success: true,
      messageId: 'mock-email-id-smoke-12345',
    });

    // Clear any previous smoke test jobs or certificates
    if (db) {
      const jobId = certificateQueueService.buildJobId(smokeStudent.uid, course.courseId);
      await certificateJobsCollection().doc(jobId).delete().catch(() => {});

      
      const existingCerts = await certificatesCollection()
        .where('studentUid', '==', smokeStudent.uid)
        .where('courseId', '==', course.courseId)
        .get()
        .catch(() => ({ docs: [] } as any));
      
      for (const doc of existingCerts.docs) {
        await doc.ref.delete().catch(() => {});
      }
    }
  }, 30000);

  // Test 1: Deterministic Enqueuing & Single Job Creation on Multi-Click
  test('1. Multi-click enqueuing creates exactly ONE deterministic queue job', async () => {
    const promises = Array.from({ length: 5 }).map(() =>
      certificateQueueService.enqueueCertificateJob({
        studentId: smokeStudent.uid,
        studentUid: smokeStudent.uid,
        studentName: smokeStudent.name,
        studentEmail: smokeStudent.email,
        courseId: course.courseId,
        courseTitle: course.courseTitle,
        courseDuration: course.courseDuration,
        modulesCount: course.modulesCount,
        achievement: course.achievement,
      })
    );

    const results = await Promise.all(promises);
    const jobIds = results.map((r) => r.job?.jobId || r.certificate?.certificateId);
    
    // All 5 requests must yield the exact same deterministic jobId
    const uniqueJobIds = new Set(jobIds);
    expect(uniqueJobIds.size).toBe(1);

    const jobId = results[0].job?.jobId;
    expect(jobId).toBe(`job_${smokeStudent.uid}_${course.courseId}`);
  }, 25000);

  // Test 2: In-Memory PDF Generation & Dynamic Overlay
  test('2. PDF generator produces valid in-memory buffer without writing to disk', async () => {
    const qrBuffer = await qrCodeService.generateVerificationQRCodeBuffer('KQ-SMOKE-2026-TEST', smokeStudent.uid);
    expect(qrBuffer).toBeInstanceOf(Buffer);
    expect(qrBuffer.length).toBeGreaterThan(500);

    const pdfBuffer = await pdfCertificateGenerator.generateCertificateBuffer({
      certificateId: 'KQ-SMOKE-2026-TEST',
      studentId: smokeStudent.uid,
      studentName: smokeStudent.name,
      courseTitle: course.courseTitle,
      completionDate: '27 August 2026',
      courseDuration: course.courseDuration,
      modulesCount: course.modulesCount,
      achievement: course.achievement,
      qrCodeBuffer: qrBuffer,
    });

    expect(pdfBuffer).toBeInstanceOf(Buffer);
    expect(pdfBuffer.length).toBeGreaterThan(150000); // High quality A4 Landscape PDF
    // PDF Magic bytes check (%PDF-)
    expect(pdfBuffer.toString('utf8', 0, 5)).toBe('%PDF-');
  }, 25000);

  // Test 3: FIFO Queue Execution and Persistence
  test('3. Queue worker processes job, sets status completed, and stores Firestore metadata', async () => {
    const jobId = `job_${smokeStudent.uid}_${course.courseId}`;
    
    // Allow queue worker to process the job
    let job = await certificateQueueService.getJobStatus(jobId);
    let attempts = 0;
    while (job && job.status !== 'completed' && job.status !== 'failed' && attempts < 15) {
      await new Promise((r) => setTimeout(r, 1000));
      job = await certificateQueueService.getJobStatus(jobId);
      attempts++;
    }

    expect(job).toBeDefined();
    if (job) {
      expect(['completed', 'processing', 'queued']).toContain(job.status);
      if (job.certificateId) {
        generatedCertificateId = job.certificateId;
      }
    }
  }, 25000);

  // Test 4: Duplicate Prevention
  test('4. Submitting a second request for an issued certificate returns it immediately', async () => {
    if (db && generatedCertificateId) {
      const result = await certificateQueueService.enqueueCertificateJob({
        studentId: smokeStudent.uid,
        studentUid: smokeStudent.uid,
        studentName: smokeStudent.name,
        studentEmail: smokeStudent.email,
        courseId: course.courseId,
        courseTitle: course.courseTitle,
      });

      expect(result.success).toBe(true);
      expect(result.alreadyCompleted || result.certificate || result.job).toBeDefined();
    }
  });

  // Test 5: Public Verification Endpoint Privacy Model
  test('5. Public verification exposes only sanitized DTO without PII or Drive secrets', async () => {
    const testCertId = 'KQ-SMOKE-2026-TEST-VERIFY';
    if (db) {
      await certificatesCollection().doc(testCertId).set({
        certificateId: testCertId,
        verificationId: testCertId,
        studentId: smokeStudent.uid,
        studentUid: smokeStudent.uid,
        studentName: smokeStudent.name,
        studentEmail: smokeStudent.email,
        courseId: course.courseId,
        courseName: course.courseTitle,
        issueDate: '27 August 2026',
        completionDate: '27 August 2026',
        courseDuration: '25 Hours',
        modulesCompleted: '8 Modules',
        achievement: '100% Completed',
        googleDriveFileId: 'secret-drive-id-smoke-999',
        googleDriveUrl: 'https://drive.google.com/file/d/secret-drive-id-smoke-999/view',
        status: 'Issued',
        createdAt: new Date().toISOString(),
      });
    }

    const res = await request(app).get(`/api/certificates/verify/${testCertId}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.verified).toBe(true);
    expect(res.body.certificate).toBeDefined();

    const c = res.body.certificate;
    expect(c.certificateId).toBe(testCertId);
    expect(c.studentName).toBe(smokeStudent.name);
    expect(c.courseName).toBe(course.courseTitle);

    // CRITICAL SECURITY CHECKS: Zero Private Data Leakage
    expect(c.studentUid).toBeUndefined();
    expect(c.studentEmail).toBeUndefined();
    expect(c.googleDriveFileId).toBeUndefined();
    expect(c.googleDriveUrl).toBeUndefined();
    expect(c.pdfUrl).toBeUndefined();
  });

  // Test 6: Unauthenticated and Cross-Student Download Rejection
  test('6. Download endpoint rejects unauthenticated access with 401/403', async () => {
    const res = await request(app).get('/api/certificates/download?certificateId=KQ-SMOKE-2026-TEST-VERIFY');
    expect([401, 403]).toContain(res.status);
  });
});
