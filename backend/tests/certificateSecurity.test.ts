import request from 'supertest';
import app from '../src/app';
import { db } from '../src/firebase';
import { certificatesCollection, certificateJobsCollection } from '../src/firebase/collections';

describe('Certificate Security & Verification Hardening Tests (Phase 3F)', () => {
  const studentA = {
    uid: 'student_auth_A',
    email: 'studentA@kaizenq.in',
    name: 'Student Alice',
  };

  const studentB = {
    uid: 'student_auth_B',
    email: 'studentB@kaizenq.in',
    name: 'Student Bob',
  };

  const certIdA = 'KQ-TEST-SEC-001';
  const certIdB = 'KQ-TEST-SEC-002';
  const jobIdA = 'job_student_auth_A_course_sec_101';
  const jobIdB = 'job_student_auth_B_course_sec_101';

  beforeAll(async () => {
    if (db) {
      // Seed Certificate A (Alice)
      await certificatesCollection().doc(certIdA).set({
        certificateId: certIdA,
        verificationId: certIdA,
        studentId: studentA.uid,
        studentUid: studentA.uid,
        studentName: studentA.name,
        studentEmail: studentA.email,
        courseId: 'course_sec_101',
        courseName: 'Security & Defensive Architecture',
        issueDate: '27 August 2026',
        completionDate: '27 August 2026',
        courseDuration: '25 Hours',
        modulesCompleted: '10 Modules',
        achievement: '100% Completed',
        googleDriveFileId: 'secret-drive-id-12345',
        googleDriveUrl: 'https://drive.google.com/file/d/secret-drive-id-12345/view',
        status: 'Issued',
        createdAt: new Date().toISOString(),
      });

      // Seed Certificate B (Bob)
      await certificatesCollection().doc(certIdB).set({
        certificateId: certIdB,
        verificationId: certIdB,
        studentId: studentB.uid,
        studentUid: studentB.uid,
        studentName: studentB.name,
        studentEmail: studentB.email,
        courseId: 'course_sec_101',
        courseName: 'Security & Defensive Architecture',
        issueDate: '27 August 2026',
        completionDate: '27 August 2026',
        courseDuration: '25 Hours',
        modulesCompleted: '10 Modules',
        achievement: '100% Completed',
        googleDriveFileId: 'secret-drive-id-67890',
        googleDriveUrl: 'https://drive.google.com/file/d/secret-drive-id-67890/view',
        status: 'Issued',
        createdAt: new Date().toISOString(),
      });

      // Seed Queue Job A
      await certificateJobsCollection().doc(jobIdA).set({
        jobId: jobIdA,
        studentId: studentA.uid,
        studentUid: studentA.uid,
        studentName: studentA.name,
        studentEmail: studentA.email,
        courseId: 'course_sec_101',
        courseTitle: 'Security & Defensive Architecture',
        certificateId: certIdA,
        status: 'completed',
        createdAt: new Date().toISOString(),
        attempts: 1,
      });

      // Seed Queue Job B
      await certificateJobsCollection().doc(jobIdB).set({
        jobId: jobIdB,
        studentId: studentB.uid,
        studentUid: studentB.uid,
        studentName: studentB.name,
        studentEmail: studentB.email,
        courseId: 'course_sec_101',
        courseTitle: 'Security & Defensive Architecture',
        certificateId: certIdB,
        status: 'completed',
        createdAt: new Date().toISOString(),
        attempts: 1,
      });
    }
  }, 30000);

  // 1. Download Security
  test('1. Unauthenticated download is rejected with 401 Unauthorized', async () => {
    const res = await request(app).get(`/api/certificates/download?certificateId=${certIdA}`);
    expect([401, 403]).toContain(res.status);
  });

  // 2. Preview Security
  test('2. Unauthenticated preview is rejected with 401 Unauthorized', async () => {
    const res = await request(app).get(`/api/certificates/preview?certificateId=${certIdA}`);
    expect([401, 403]).toContain(res.status);
  });

  // 3. Email Enumeration Protection
  test('3. Unauthenticated certificate lookup by email is rejected with 401', async () => {
    const res = await request(app).get(`/api/certificates/student/${studentA.email}`);
    expect([401, 403]).toContain(res.status);
  });

  // 4. Public Verification Endpoint - Sanitized Public DTO
  test('4. Public verification for valid certificate returns 200 with sanitized DTO', async () => {
    const res = await request(app).get(`/api/certificates/verify/${certIdA}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.verified).toBe(true);
    expect(res.body.certificate).toBeDefined();

    const cert = res.body.certificate;
    expect(cert.certificateId).toBe(certIdA);
    expect(cert.studentName).toBe(studentA.name);
    expect(cert.courseName).toBe('Security & Defensive Architecture');
    expect(cert.issueDate).toBe('27 August 2026');

    // CRITICAL: Must NOT expose private PII or internal infrastructure IDs
    expect(cert.studentUid).toBeUndefined();
    expect(cert.studentEmail).toBeUndefined();
    expect(cert.googleDriveFileId).toBeUndefined();
    expect(cert.googleDriveUrl).toBeUndefined();
    expect(cert.pdfUrl).toBeUndefined();
  });

  // 5. Public Verification for Non-Existent Certificate
  test('5. Public verification for invalid certificate returns 404 not found', async () => {
    const res = await request(app).get('/api/certificates/verify/NON-EXISTENT-CERT-ID-999');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.verified).toBe(false);
  });
});
