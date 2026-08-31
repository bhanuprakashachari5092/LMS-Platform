import { Request, Response, NextFunction } from 'express';
import { enrollmentService } from './enrollment.service';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';

export class EnrollmentController {
  // GET /api/enrollments/my-courses
  public async getMyCourses(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const headerUid = req.headers['x-user-id'];
      const studentId = req.user?.uid || (req.query.studentId as string) || (typeof headerUid === 'string' ? headerUid : undefined);

      if (!studentId) {
        res.status(401).json({ success: false, error: 'Unauthorized: Student authentication required' });
        return;
      }

      const enrollments = await enrollmentService.getStudentEnrollments(studentId);
      res.json({ success: true, count: enrollments.length, enrollments });
    } catch (err) {
      next(err);
    }
  }

  // GET /api/enrollments/:courseId
  public async getCourseEnrollment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const headerUid = req.headers['x-user-id'];
      const studentId = req.user?.uid || (req.query.studentId as string) || (typeof headerUid === 'string' ? headerUid : undefined);
      const courseId = String(req.params.courseId || '');

      if (!studentId) {
        res.status(401).json({ success: false, error: 'Unauthorized: Student authentication required' });
        return;
      }

      const enrollment = await enrollmentService.getEnrollment(studentId, courseId);
      if (!enrollment) {
        res.status(404).json({ success: false, isEnrolled: false, message: 'Not enrolled in this course' });
        return;
      }

      res.json({
        success: true,
        isEnrolled: enrollment.status === 'ACTIVE',
        enrollment,
      });
    } catch (err) {
      next(err);
    }
  }

  // POST /api/enrollments (Free or admin enrollment creation)
  public async createEnrollment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const studentId = req.user?.uid || req.body.studentId;
      const studentEmail = req.user?.email || req.body.studentEmail;
      const studentName = req.body.studentName || 'Student';
      const { courseId, accessType = 'FREE', paymentId, courseTitle } = req.body;

      if (!studentId || !courseId) {
        res.status(400).json({ success: false, error: 'studentId and courseId are required' });
        return;
      }

      const result = await enrollmentService.createEnrollment({
        studentId,
        studentEmail,
        studentName,
        courseId,
        accessType,
        paymentId,
        courseTitle,
      });

      res.status(201).json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }

  // GET /api/courses/:courseId/access (Verify access status)
  public async checkCourseAccess(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const headerUid = req.headers['x-user-id'];
      const headerRole = req.headers['x-user-role'];
      const headerEmail = req.headers['x-user-email'];

      const studentId = req.user?.uid || (req.query.studentId as string) || (typeof headerUid === 'string' ? headerUid : '');
      const userRole = req.user?.role || (req.query.userRole as string) || (typeof headerRole === 'string' ? headerRole : undefined);
      const userEmail = req.user?.email || (req.query.userEmail as string) || (typeof headerEmail === 'string' ? headerEmail : undefined);
      const courseId = String(req.params.courseId || '');

      const result = await enrollmentService.verifyCourseAccess(studentId, courseId, userRole, userEmail);

      if (!result.hasAccess) {
        res.status(403).json({
          success: false,
          hasAccess: false,
          message: result.reason || 'You are not enrolled in this course.',
        });
        return;
      }

      res.json({
        success: true,
        hasAccess: true,
        enrollment: result.enrollment,
      });
    } catch (err) {
      next(err);
    }
  }

  // POST /api/enrollments/progress
  public async updateProgress(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const headerUid = req.headers['x-user-id'];
      const authUid = req.user?.uid;
      const isAdmin = req.user?.role === 'admin';

      // If authenticated as a non-admin student, strictly enforce own studentId
      if (authUid && !isAdmin && req.body.studentId && req.body.studentId !== authUid) {
        res.status(403).json({ success: false, error: 'Forbidden: You cannot modify another student\'s learning progress.' });
        return;
      }

      const studentId = authUid || req.body.studentId || (typeof headerUid === 'string' ? headerUid : undefined);
      const courseId = req.body.courseId || req.params.courseId;
      const lessonId = req.body.lessonId || req.body.unitId;
      const totalLessonsInCourse = req.body.totalLessonsInCourse ? Number(req.body.totalLessonsInCourse) : 1;

      if (!studentId || !courseId || !lessonId) {
        res.status(400).json({ success: false, error: 'studentId, courseId, and lessonId are required' });
        return;
      }

      const result = await enrollmentService.updateLessonProgress({
        studentId: String(studentId),
        courseId: String(courseId),
        lessonId: String(lessonId),
        totalLessonsInCourse,
      });

      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  // GET /api/enrollments/:courseId/progress
  public async getCourseProgress(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const headerUid = req.headers['x-user-id'];
      const authUid = req.user?.uid;
      const isAdmin = req.user?.role === 'admin';

      // If authenticated as a non-admin student, strictly enforce own studentId
      if (authUid && !isAdmin && req.query.studentId && req.query.studentId !== authUid) {
        res.status(403).json({ success: false, error: 'Forbidden: You cannot access another student\'s learning progress.' });
        return;
      }

      const studentId = authUid || (req.query.studentId as string) || (typeof headerUid === 'string' ? headerUid : undefined);
      const courseId = String(req.params.courseId || '');

      if (!studentId || !courseId) {
        res.status(400).json({ success: false, error: 'studentId and courseId are required' });
        return;
      }

      const enrollment = await enrollmentService.getEnrollment(String(studentId), courseId);
      const completedLessons = enrollment?.completedLessons || [];
      const progressPercentage = enrollment?.progressPercentage || 0;

      res.json({
        success: true,
        completedLessons,
        progressPercentage,
        status: enrollment?.status || 'NOT_STARTED',
      });
    } catch (err) {
      next(err);
    }
  }
}

export const enrollmentController = new EnrollmentController();
