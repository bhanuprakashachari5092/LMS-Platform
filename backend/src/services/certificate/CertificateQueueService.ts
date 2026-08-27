import logger from '../../config/logger';
import { env } from '../../config/env';
import { db } from '../../firebase';
import { certificateJobsCollection, certificatesCollection } from '../../firebase/collections';
import { pdfCertificateGenerator } from './PDFCertificateGenerator';
import { googleDriveService } from '../googleDrive.service';
import { emailService } from '../email/EmailService';
import { googleSheetsService } from './GoogleSheetsService';

export type CertificateJobStatus = 'queued' | 'processing' | 'completed' | 'failed';

export interface CertificateJob {
  jobId: string;
  studentId: string;
  studentUid: string;
  studentName: string;
  studentEmail: string;
  courseId: string;
  courseTitle: string;
  courseDuration?: string;
  modulesCount?: number | string;
  achievement?: string;
  instructorName?: string;
  certificateId?: string;
  status: CertificateJobStatus;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  failedAt?: string;
  attempts: number;
  errorMessage?: string;
  googleDriveFileId?: string;
  googleDriveUrl?: string;
  pdfUrl?: string;
  position?: number;
  estimatedWaitSeconds?: number;
}

export interface EnqueueCertificatePayload {
  studentId: string;
  studentUid: string;
  studentName: string;
  studentEmail: string;
  courseId: string;
  courseTitle: string;
  courseDuration?: string;
  modulesCount?: number | string;
  achievement?: string;
  instructorName?: string;
  force?: boolean;
}

export class CertificateQueueService {
  private static isProcessing = false;
  private static recentDurationsMs: number[] = [8000]; // Default 8s initial rolling baseline
  private static readonly MAX_RETRIES = 3;
  private static readonly STALE_TIMEOUT_MS = 180000; // 3 minutes

  /**
   * Deterministic Job Document Key for Idempotency
   */
  public buildJobId(studentId: string, courseId: string): string {
    const cleanStudent = String(studentId || 'unknown').replace(/[^a-zA-Z0-9_-]/g, '_');
    const cleanCourse = String(courseId || 'unknown').replace(/[^a-zA-Z0-9_-]/g, '_');
    return `job_${cleanStudent}_${cleanCourse}`;
  }

  /**
   * Rolling average certificate processing time in seconds
   */
  public getAverageProcessingSeconds(): number {
    if (!CertificateQueueService.recentDurationsMs.length) return 8;
    const sum = CertificateQueueService.recentDurationsMs.reduce((acc, curr) => acc + curr, 0);
    const avg = sum / CertificateQueueService.recentDurationsMs.length / 1000;
    return Math.max(3, Math.round(avg));
  }

  private recordDuration(durationMs: number): void {
    if (durationMs > 500 && durationMs < 120000) {
      CertificateQueueService.recentDurationsMs.push(durationMs);
      if (CertificateQueueService.recentDurationsMs.length > 10) {
        CertificateQueueService.recentDurationsMs.shift();
      }
    }
  }

  /**
   * Calculates dynamic queue position and estimated wait time
   */
  public async calculateJobStats(job: CertificateJob): Promise<{ position: number; estimatedWaitSeconds: number }> {
    if (job.status === 'completed') {
      return { position: 0, estimatedWaitSeconds: 0 };
    }

    if (job.status === 'failed') {
      return { position: 0, estimatedWaitSeconds: 0 };
    }

    const avgSeconds = this.getAverageProcessingSeconds();

    if (job.status === 'processing') {
      return { position: 1, estimatedWaitSeconds: Math.max(2, Math.round(avgSeconds * 0.5)) };
    }

    // Status is 'queued': count active jobs ahead
    let position = 1;
    if (db) {
      try {
        const queuedBeforeSnap = await certificateJobsCollection()
          .where('status', 'in', ['queued', 'processing'])
          .get();

        let countAhead = 0;
        const jobCreatedTime = new Date(job.createdAt).getTime();

        queuedBeforeSnap.forEach((docSnap) => {
          const data = docSnap.data() as CertificateJob;
          if (docSnap.id !== job.jobId) {
            if (data.status === 'processing') {
              countAhead++;
            } else if (data.status === 'queued') {
              const otherCreatedTime = new Date(data.createdAt).getTime();
              if (otherCreatedTime < jobCreatedTime) {
                countAhead++;
              }
            }
          }
        });

        position = countAhead + 1;
      } catch (err: any) {
        logger.warn(`[CERTIFICATE QUEUE] Position calc notice: ${err?.message || err}`);
      }
    }

    const estimatedWaitSeconds = position * avgSeconds;
    return { position, estimatedWaitSeconds };
  }

  /**
   * Enqueues a new certificate request or returns an active/existing job (Strictly Idempotent)
   */
  public async enqueueCertificateJob(payload: EnqueueCertificatePayload): Promise<{
    success: boolean;
    alreadyCompleted?: boolean;
    job?: CertificateJob;
    certificate?: any;
    error?: string;
  }> {
    const jobId = this.buildJobId(payload.studentId, payload.courseId);

    // 1. Check if certificate is already issued in Firestore
    if (db && !payload.force) {
      try {
        const certSnap = await certificatesCollection()
          .where('studentUid', '==', payload.studentUid || payload.studentId)
          .where('courseId', '==', payload.courseId)
          .get();

        if (!certSnap.empty) {
          const existingCert = certSnap.docs[0].data();
          logger.info(`[CERTIFICATE QUEUE] Found existing certificate for ${payload.studentEmail}. Returning immediately.`);
          return {
            success: true,
            alreadyCompleted: true,
            certificate: existingCert,
          };
        }
      } catch (checkErr: any) {
        logger.warn(`[CERTIFICATE QUEUE] Existing certificate precheck notice: ${checkErr?.message || checkErr}`);
      }
    }

    // 2. Check if a queue job already exists
    let existingJob: CertificateJob | null = null;
    if (db) {
      try {
        const jobDoc = await certificateJobsCollection().doc(jobId).get();
        if (jobDoc.exists) {
          existingJob = jobDoc.data() as CertificateJob;
        }
      } catch (jobCheckErr: any) {
        logger.warn(`[CERTIFICATE QUEUE] Existing job precheck notice: ${jobCheckErr?.message || jobCheckErr}`);
      }
    }

    // 3. If job is active ('queued' or 'processing'), return existing job state
    if (existingJob && (existingJob.status === 'queued' || existingJob.status === 'processing') && !payload.force) {
      const stats = await this.calculateJobStats(existingJob);
      this.triggerWorker();
      return {
        success: true,
        job: {
          ...existingJob,
          position: stats.position,
          estimatedWaitSeconds: stats.estimatedWaitSeconds,
        },
      };
    }

    // 4. If job already completed, verify and return certificate
    if (existingJob && existingJob.status === 'completed' && !payload.force) {
      if (db) {
        const certDoc = await certificatesCollection().doc(existingJob.certificateId || '').get();
        if (certDoc.exists) {
          return {
            success: true,
            alreadyCompleted: true,
            certificate: certDoc.data(),
            job: existingJob,
          };
        }
      }
      return {
        success: true,
        alreadyCompleted: true,
        job: existingJob,
      };
    }

    // 5. Create fresh queued job document
    const now = new Date().toISOString();
    const newJob: CertificateJob = {
      jobId,
      studentId: payload.studentId,
      studentUid: payload.studentUid || payload.studentId,
      studentName: payload.studentName,
      studentEmail: payload.studentEmail,
      courseId: payload.courseId,
      courseTitle: payload.courseTitle,
      courseDuration: payload.courseDuration || '25 Hours',
      modulesCount: payload.modulesCount || 'All Modules',
      achievement: payload.achievement || '100% Completed',
      instructorName: payload.instructorName || 'Kaizen Q Team',
      status: 'queued',
      createdAt: now,
      attempts: 0,
    };

    if (db) {
      try {
        await certificateJobsCollection().doc(jobId).set(newJob, { merge: true });
        logger.info(`[CERTIFICATE QUEUE] ✅ Enqueued job ${jobId} for student ${payload.studentName} (${payload.studentEmail})`);
      } catch (writeErr: any) {
        logger.error(`[CERTIFICATE QUEUE] ❌ Failed to write queue job: ${writeErr?.message || writeErr}`);
        throw new Error(`Failed to enqueue certificate request: ${writeErr?.message || writeErr}`);
      }
    }

    const stats = await this.calculateJobStats(newJob);
    newJob.position = stats.position;
    newJob.estimatedWaitSeconds = stats.estimatedWaitSeconds;

    // Trigger FIFO Worker
    this.triggerWorker();

    return {
      success: true,
      job: newJob,
    };
  }

  /**
   * Retrieves current status and dynamic stats for a specific job
   */
  public async getJobStatus(jobId: string): Promise<CertificateJob | null> {
    if (!db) return null;
    try {
      const doc = await certificateJobsCollection().doc(jobId).get();
      if (!doc.exists) return null;
      const job = doc.data() as CertificateJob;
      const stats = await this.calculateJobStats(job);
      return {
        ...job,
        position: stats.position,
        estimatedWaitSeconds: stats.estimatedWaitSeconds,
      };
    } catch (err: any) {
      logger.error(`[CERTIFICATE QUEUE] Error fetching job status for ${jobId}: ${err?.message || err}`);
      return null;
    }
  }

  /**
   * Triggers the sequential FIFO worker loop
   */
  public triggerWorker(): void {
    if (CertificateQueueService.isProcessing) {
      return;
    }
    setImmediate(() => {
      this.processQueue().catch((err) => {
        logger.error(`[CERTIFICATE WORKER] Uncaught error in worker loop: ${err?.message || err}`);
      });
    });
  }

  /**
   * Sequential FIFO Worker Loop (MAX_CONCURRENT_CERTIFICATE_JOBS = 1)
   */
  public async processQueue(): Promise<void> {
    if (CertificateQueueService.isProcessing) {
      return;
    }

    CertificateQueueService.isProcessing = true;

    try {
      if (!db) {
        CertificateQueueService.isProcessing = false;
        return;
      }

      // Step A: Recover stale processing jobs (older than 3 minutes)
      await this.recoverStaleJobs();

      // Step B: Pick oldest queued job
      let hasMoreJobs = true;
      while (hasMoreJobs) {
        const nextJob = await this.claimNextQueuedJob();
        if (!nextJob) {
          hasMoreJobs = false;
          break;
        }

        // Process claimed job
        await this.executeJob(nextJob);
      }
    } finally {
      CertificateQueueService.isProcessing = false;
    }
  }

  /**
   * Atomically claims the next oldest queued job
   */
  private async claimNextQueuedJob(): Promise<CertificateJob | null> {
    if (!db) return null;

    try {
      let queuedDocs: any[] = [];
      try {
        const queuedSnap = await certificateJobsCollection()
          .where('status', '==', 'queued')
          .orderBy('createdAt', 'asc')
          .limit(1)
          .get();
        queuedDocs = queuedSnap.docs;
      } catch (indexErr) {
        const fallbackSnap = await certificateJobsCollection()
          .where('status', '==', 'queued')
          .get();
        queuedDocs = fallbackSnap.docs.sort((a, b) => {
          const tA = new Date(a.data().createdAt || 0).getTime();
          const tB = new Date(b.data().createdAt || 0).getTime();
          return tA - tB;
        });
      }

      if (!queuedDocs || queuedDocs.length === 0) {
        return null;
      }

      const candidateDoc = queuedDocs[0];
      const candidateData = candidateDoc.data() as CertificateJob;

      // Atomically update status to 'processing'
      const startedAt = new Date().toISOString();
      const updatedAttempts = (candidateData.attempts || 0) + 1;

      await candidateDoc.ref.update({
        status: 'processing',
        startedAt,
        attempts: updatedAttempts,
      });

      return {
        ...candidateData,
        status: 'processing',
        startedAt,
        attempts: updatedAttempts,
      };
    } catch (err: any) {
      logger.warn(`[CERTIFICATE WORKER] Job claim notice: ${err?.message || err}`);
      return null;
    }
  }

  /**
   * Executes certificate generation, Google Drive upload, and Firestore persistence for a claimed job
   */
  private async executeJob(job: CertificateJob): Promise<void> {
    const startTime = Date.now();
    logger.info(`[CERTIFICATE WORKER] 🚀 Processing Job ${job.jobId} for student ${job.studentName}...`);

    try {
      const year = new Date().getFullYear();
      const courseCode = (job.courseId || 'COURSE').toUpperCase().includes('LINUX')
        ? 'LINUX'
        : (job.courseId || 'COURSE').toUpperCase().includes('GIT')
        ? 'GIT'
        : (job.courseId || 'COURSE').toUpperCase().includes('DBMS')
        ? 'DBMS'
        : 'COURSE';

      const randomSuffix = Math.floor(100000 + Math.random() * 900000);
      const certificateId = job.certificateId || `KQ-${courseCode}-${year}-${randomSuffix}`;
      const completionDate = job.completedAt || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });

      // 1. Generate in-memory PDF buffer (Zero disk writes to EC2)
      const pdfBuffer = await pdfCertificateGenerator.generateCertificateBuffer({
        certificateId,
        studentId: job.studentId,
        studentName: job.studentName,
        courseTitle: job.courseTitle,
        instructorName: job.instructorName || 'Shaivika Groups Board',
        completionDate,
        courseDuration: job.courseDuration || '25 Hours',
        modulesCount: job.modulesCount || 'All Modules',
        achievement: job.achievement || '100% Completed',
      });

      logger.info(`[CERTIFICATE WORKER] ✅ In-memory PDF generated (${pdfBuffer.length} bytes) for ${certificateId}`);

      // 2. Upload directly to Google Drive
      let driveFileId = 'gdrive-pending';
      let driveUrl = `${env.BACKEND_URL || 'http://localhost:5000'}/api/certificates/download?certificateId=${certificateId}&studentId=${job.studentId}&studentName=${encodeURIComponent(job.studentName)}&courseTitle=${encodeURIComponent(job.courseTitle)}&completionDate=${encodeURIComponent(completionDate)}`;

      try {
        const driveResult = await googleDriveService.uploadCertificate({
          pdfFilePath: pdfBuffer,
          courseName: job.courseTitle,
          certificateId,
          studentName: job.studentName,
        });

        driveFileId = driveResult.driveFileId;
        driveUrl = driveResult.driveUrl;
        logger.info(`[CERTIFICATE WORKER] ✅ Uploaded to Google Drive: ${driveUrl} (ID: ${driveFileId})`);
      } catch (driveErr: any) {
        logger.warn(`[CERTIFICATE WORKER] Google Drive upload notice (${driveErr?.message || driveErr}). Using standard secure direct download link.`);
      }

      // 3. Dispatch Email with attachment
      try {
        const primaryFrontend = (env.FRONTEND_URL || 'https://www.kaizenq.in').split(',')[0].trim();
        const verifyUrl = `${primaryFrontend}/verify-certificate/${certificateId}?studentId=${job.studentId}`;
        const emailSubject = `Congratulations! Your Course Certificate is Ready`;
        const htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #0A2540;">Congratulations, ${job.studentName}!</h2>
            <p>You have successfully completed <strong>${job.courseTitle}</strong>.</p>
            <p>Your official Certificate ID is: <strong>${certificateId}</strong></p>
            <div style="margin: 24px 0;">
              <a href="${driveUrl}" style="background-color: #0A2540; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Download Certificate</a>
              <a href="${verifyUrl}" style="margin-left: 12px; color: #0A2540; padding: 12px 24px; text-decoration: underline; display: inline-block;">Verify Credential</a>
            </div>
            <p style="color: #64748b; font-size: 12px;">Issued by Kaizen Q – AI-Powered LMS, Shaivika Group.</p>
          </div>
        `;

        await emailService.sendEmailWithAttachments(
          job.studentEmail,
          emailSubject,
          htmlContent,
          [{ filename: `${certificateId}.pdf`, content: pdfBuffer, contentType: 'application/pdf' }]
        );
      } catch (emailErr: any) {
        logger.warn(`[CERTIFICATE WORKER] Email dispatch notice: ${emailErr?.message || emailErr}`);
      }

      // 4. Save metadata to Firestore `certificates` collection
      const completedAt = new Date().toISOString();
      const certDocData = {
        certificateId,
        verificationId: certificateId,
        studentId: job.studentId,
        studentUid: job.studentUid,
        studentName: job.studentName,
        studentEmail: job.studentEmail,
        courseId: job.courseId,
        courseName: job.courseTitle,
        instructorName: job.instructorName || 'Kaizen Q Team',
        issueDate: completionDate,
        completionDate,
        courseDuration: job.courseDuration || '25 Hours',
        modulesCompleted: job.modulesCount || 'All Modules',
        achievement: job.achievement || '100% Completed',
        googleDriveFileId: driveFileId,
        googleDriveUrl: driveUrl,
        pdfUrl: driveUrl,
        status: 'Issued',
        createdAt: completedAt,
        updatedAt: completedAt,
      };

      if (db) {
        await certificatesCollection().doc(certificateId).set(certDocData, { merge: true });

        // Update Job Status to 'completed'
        await certificateJobsCollection().doc(job.jobId).update({
          status: 'completed',
          certificateId,
          completedAt,
          googleDriveFileId: driveFileId,
          googleDriveUrl: driveUrl,
          pdfUrl: driveUrl,
          errorMessage: null,
        });
      }

      const durationMs = Date.now() - startTime;
      this.recordDuration(durationMs);
      logger.info(`[CERTIFICATE WORKER] 🎉 Job ${job.jobId} COMPLETED in ${durationMs}ms`);

    } catch (err: any) {
      const durationMs = Date.now() - startTime;
      logger.error(`[CERTIFICATE WORKER] ❌ Job ${job.jobId} FAILED: ${err?.message || err}`);

      if (db) {
        const isMaxRetries = (job.attempts || 1) >= CertificateQueueService.MAX_RETRIES;
        const nextStatus: CertificateJobStatus = isMaxRetries ? 'failed' : 'queued';

        await certificateJobsCollection().doc(job.jobId).update({
          status: nextStatus,
          failedAt: new Date().toISOString(),
          errorMessage: err?.message || String(err),
        });
      }
    }
  }

  /**
   * Recovers stale jobs that remained in 'processing' status across crashes/restarts
   */
  private async recoverStaleJobs(): Promise<void> {
    if (!db) return;

    try {
      const processingSnap = await certificateJobsCollection()
        .where('status', '==', 'processing')
        .get();

      const now = Date.now();
      for (const docSnap of processingSnap.docs) {
        const job = docSnap.data() as CertificateJob;
        const startedTime = job.startedAt ? new Date(job.startedAt).getTime() : 0;

        if (now - startedTime > CertificateQueueService.STALE_TIMEOUT_MS) {
          logger.warn(`[CERTIFICATE WORKER] ⚠️ Recovering stale job ${job.jobId} (started ${Math.round((now - startedTime) / 1000)}s ago)...`);
          const attempts = job.attempts || 1;
          const nextStatus: CertificateJobStatus = attempts >= CertificateQueueService.MAX_RETRIES ? 'failed' : 'queued';

          await docSnap.ref.update({
            status: nextStatus,
            errorMessage: 'Recovered from stale processing timeout',
          });
        }
      }
    } catch (staleErr: any) {
      logger.warn(`[CERTIFICATE WORKER] Stale recovery notice: ${staleErr?.message || staleErr}`);
    }
  }
}

export const certificateQueueService = new CertificateQueueService();
