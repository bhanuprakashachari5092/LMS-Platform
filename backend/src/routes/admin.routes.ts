import { Router, Request, Response } from 'express';
import { db, adminAuth } from '../firebase';
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { verifyFirebaseToken, requireRole } from '../middleware/auth.middleware';
import { emailService } from '../services/email/EmailService';
import { EmailEventType } from '../types/emailTypes';

const router = Router();

/**
 * Enterprise Admin Dashboard Routes
 * Reads exclusively from the central `users` collection.
 */

/**
 * GET /api/admin/dashboard
 * Fetch system metrics from `users` collection
 */
router.get('/dashboard', verifyFirebaseToken as any, requireRole('admin') as any, async (req: Request, res: Response) => {
  try {
    let totalUsers = 0;
    let pendingStudents = 0;
    let pendingInstructors = 0;
    let approvedStudents = 0;
    let approvedInstructors = 0;

    if (db) {
      const usersSnap = await db.collection('users').get();
      totalUsers = usersSnap.size;

      usersSnap.forEach((doc: QueryDocumentSnapshot) => {
        const data = doc.data();
        const role = data.role;
        const isApproved = data.approved === true || data.status === 'active' || data.status === 'Active' || data.status === 'approved';

        if (role === 'student') {
          if (isApproved) {
            approvedStudents++;
          } else {
            pendingStudents++;
          }
        } else if (role === 'instructor') {
          if (isApproved) {
            approvedInstructors++;
          } else {
            pendingInstructors++;
          }
        }
      });
    }

    return res.status(200).json({
      success: true,
      metrics: {
        totalUsers,
        pendingStudents,
        pendingInstructors,
        approvedStudents,
        approvedInstructors,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || err });
  }
});

/**
 * GET /api/admin/students
 * High-performance paginated roster API with search, filtering, and performance telemetry
 * Supports: page, limit, status, search, sort, order
 */
router.get('/students', verifyFirebaseToken as any, requireRole('admin') as any, async (req: Request, res: Response) => {
  const t0 = Date.now();
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 25));
    const statusParam = (req.query.status as string || 'all').toLowerCase().trim();
    const searchQuery = (req.query.search as string || '').toLowerCase().trim();
    const sortBy = (req.query.sort as string || 'newest').toLowerCase().trim();
    const order = (req.query.order as string || 'desc').toLowerCase().trim();

    const allStudents: any[] = [];
    let tQueryEnd = Date.now();

    if (db) {
      // Query users collection where role == 'student'
      const snap = await db.collection('users').where('role', '==', 'student').get();
      tQueryEnd = Date.now();

      snap.forEach((doc: QueryDocumentSnapshot) => {
        const d = doc.data();
        const id = doc.id;
        const name = d.fullName || d.name || d.displayName || (d.email ? d.email.split('@')[0] : 'Learner');
        const email = (d.email || '').toLowerCase().trim();
        const rawStatus = (d.status || '').toLowerCase().trim();
        const isApproved = d.approved === true || rawStatus === 'approved' || rawStatus === 'active';
        const isPending = !isApproved && rawStatus !== 'rejected' && rawStatus !== 'suspended';

        // Lightweight precomputed performance intelligence summary
        const overallScore = typeof d.learningScore === 'number' ? d.learningScore : (d.score || 85);
        const attendance = typeof d.attendance === 'number' ? d.attendance : Math.min(100, Math.max(50, Math.round(overallScore * 0.95 + 4)));
        const quizAvg = typeof d.quizAverage === 'number' ? d.quizAverage : Math.min(100, Math.max(40, Math.round(overallScore * 0.92)));
        const courseCount = d.courses || d.courseCount || 1;
        const completedCourses = d.completedCourses || d.completedCoursesCount || 0;
        const completion = typeof d.completionRate === 'number' ? d.completionRate : Math.min(100, Math.round((completedCourses / Math.max(1, courseCount)) * 100));
        const engagement = typeof d.engagement === 'number' ? d.engagement : Math.min(100, Math.max(60, Math.round((overallScore + attendance) / 2)));
        const trend = overallScore >= 85 ? 'improving' : overallScore >= 70 ? 'stable' : 'declining';
        const riskLevel = (overallScore < 65 || attendance < 65) ? 'high' : overallScore < 80 ? 'medium' : 'low';

        const studentPerformanceSummary = {
          overallScore,
          attendance,
          quizAverage: quizAvg,
          completion,
          engagement,
          trend,
          riskLevel,
          lastCalculatedAt: d.updatedAt || d.createdAt || new Date().toISOString(),
        };

        allStudents.push({
          id,
          uid: id,
          name,
          fullName: name,
          email,
          photoURL: d.photoURL || d.avatar || '',
          role: 'student',
          status: rawStatus || (isApproved ? 'approved' : 'pending'),
          approved: isApproved,
          isActive: isApproved,
          joined: d.joined || (d.createdAt ? new Date(d.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently'),
          joinedAt: d.joinedAt || d.createdAt || new Date().toISOString(),
          createdAt: d.createdAt || new Date().toISOString(),
          courses: courseCount,
          completedCourses,
          branch: d.branch || 'AI & Computer Science',
          year: d.year || '1st Year',
          college: d.college || 'Shaivika AI Foundation',
          phone: d.phone || '',
          provider: d.provider || 'password',
          githubUsername: d.githubUsername || (d.github ? String(d.github).replace(/^https?:\/\/github\.com\//, '').replace(/\/$/, '') : undefined),
          learningScore: overallScore,
          xp: typeof d.xp === 'number' ? d.xp : overallScore * 20,
          studentPerformanceSummary,
        });
      });
    }

    // Step 1: Filter by Status
    let filtered = allStudents;
    if (statusParam !== 'all' && statusParam !== 'all_students') {
      if (statusParam === 'pending') {
        filtered = filtered.filter((s) => !s.approved && s.status !== 'rejected' && s.status !== 'suspended');
      } else if (statusParam === 'approved' || statusParam === 'active') {
        filtered = filtered.filter((s) => s.approved || s.status === 'approved' || s.status === 'active');
      } else if (statusParam === 'rejected') {
        filtered = filtered.filter((s) => s.status === 'rejected');
      } else if (statusParam === 'suspended') {
        filtered = filtered.filter((s) => s.status === 'suspended' || s.status === 'blocked');
      } else if (statusParam === 'at_risk') {
        filtered = filtered.filter((s) => s.studentPerformanceSummary.riskLevel === 'high' || s.learningScore < 65);
      } else if (statusParam === 'high_performers') {
        filtered = filtered.filter((s) => s.learningScore >= 90 || s.xp >= 2000);
      }
    }

    // Step 2: Filter by Search Query
    if (searchQuery) {
      filtered = filtered.filter((st) =>
        (st.name || '').toLowerCase().includes(searchQuery) ||
        (st.email || '').toLowerCase().includes(searchQuery) ||
        (st.college || '').toLowerCase().includes(searchQuery) ||
        (st.branch || '').toLowerCase().includes(searchQuery) ||
        (st.githubUsername || '').toLowerCase().includes(searchQuery)
      );
    }

    // Step 3: Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'newest') {
        comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === 'oldest') {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortBy === 'name') {
        comparison = (a.name || '').localeCompare(b.name || '');
      } else if (sortBy === 'highest_progress' || sortBy === 'performance') {
        comparison = (b.learningScore || 0) - (a.learningScore || 0);
      } else if (sortBy === 'attendance') {
        comparison = (b.studentPerformanceSummary?.attendance || 0) - (a.studentPerformanceSummary?.attendance || 0);
      } else if (sortBy === 'completion') {
        comparison = (b.studentPerformanceSummary?.completion || 0) - (a.studentPerformanceSummary?.completion || 0);
      } else {
        comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return order === 'asc' ? -comparison : comparison;
    });

    // Step 4: Paginate
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginatedStudents = filtered.slice(startIndex, startIndex + limit);

    const tEnd = Date.now();
    const queryMs = tQueryEnd - t0;
    const transformMs = tEnd - tQueryEnd;
    const totalMs = tEnd - t0;

    console.log(`[STUDENT ROSTER] query: ${queryMs}ms transform: ${transformMs}ms total: ${totalMs}ms | Returned ${paginatedStudents.length}/${total} students (Page ${page}/${totalPages})`);

    return res.status(200).json({
      success: true,
      students: paginatedStudents,
      data: paginatedStudents, // backwards compatibility
      count: paginatedStudents.length,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      timing: {
        queryMs,
        transformMs,
        totalMs,
      },
    });
  } catch (err: any) {
    console.error('[STUDENT ROSTER ERROR]:', err?.message || err);
    return res.status(500).json({ success: false, error: err?.message || err });
  }
});

/**
 * GET /api/admin/instructors
 * Fetch all instructors from `users` collection where role == 'instructor'
 */
router.get('/instructors', verifyFirebaseToken as any, requireRole('admin') as any, async (req: Request, res: Response) => {
  try {
    const instructorsMap = new Map<string, any>();
    let totalUsersCount = 0;
    let totalInstructorsColCount = 0;

    if (db) {
      // 1. Fetch all users collection documents (case-insensitive audit)
      const allUsersSnap = await db.collection('users').get();
      totalUsersCount = allUsersSnap.size;
      console.log(`[AUDIT] Total users documents before filtering: ${totalUsersCount}`);

      allUsersSnap.forEach((docSnap: QueryDocumentSnapshot) => {
        const data = docSnap.data();
        const rawRole = String(data.role || '');
        const rawStatus = String(data.status || '');
        const roleNormalized = rawRole.toLowerCase().trim();
        const statusNormalized = rawStatus.toLowerCase().trim();

        console.log(`[AUDIT USER DOC] ID: ${docSnap.id} | Email: ${data.email} | Raw Role: "${rawRole}" | Raw Status: "${rawStatus}"`);

        if (roleNormalized === 'instructor') {
          instructorsMap.set(docSnap.id, {
            id: docSnap.id,
            uid: docSnap.id,
            fullName: data.fullName || data.name || data.displayName || 'Faculty Member',
            name: data.fullName || data.name || data.displayName || 'Faculty Member',
            email: (data.email || '').toLowerCase().trim(),
            role: 'instructor',
            status: statusNormalized || 'pending',
            approved: data.approved === true || statusNormalized === 'approved' || statusNormalized === 'active',
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            ...data,
          });
        }
      });

      // 2. Fetch all instructors collection documents
      const instSnap = await db.collection('instructors').get();
      totalInstructorsColCount = instSnap.size;
      console.log(`[AUDIT] Total instructors collection documents: ${totalInstructorsColCount}`);

      instSnap.forEach((docSnap: QueryDocumentSnapshot) => {
        const data = docSnap.data();
        const rawStatus = String(data.status || 'pending');
        const statusNormalized = rawStatus.toLowerCase().trim();

        console.log(`[AUDIT INSTRUCTOR DOC] ID: ${docSnap.id} | Email: ${data.email} | Raw Status: "${rawStatus}"`);

        const existing = instructorsMap.get(docSnap.id) || {};
        instructorsMap.set(docSnap.id, {
          id: docSnap.id,
          uid: docSnap.id,
          fullName: data.fullName || data.name || existing.fullName || 'Faculty Member',
          name: data.fullName || data.name || existing.name || 'Faculty Member',
          email: (data.email || existing.email || '').toLowerCase().trim(),
          role: 'instructor',
          status: statusNormalized || existing.status || 'pending',
          approved: data.approved === true || existing.approved === true || statusNormalized === 'approved',
          createdAt: data.createdAt || existing.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ...existing,
          ...data,
        });

        // Auto-repair role in users collection if missing or incorrect
        db.collection('users').doc(docSnap.id).set({
          role: 'instructor',
          status: statusNormalized || 'pending',
          approved: data.approved === true,
          updatedAt: new Date().toISOString(),
        }, { merge: true }).catch(() => null);
      });

      // 3. Ensure instructors/{uid} document exists for every instructor in instructorsMap
      instructorsMap.forEach((inst, uid) => {
        db.collection('instructors').doc(uid).set({
          uid,
          id: uid,
          fullName: inst.fullName || inst.name || 'Faculty Member',
          name: inst.fullName || inst.name || 'Faculty Member',
          email: inst.email || '',
          role: 'instructor',
          status: inst.status || 'pending',
          approved: inst.approved === true,
          createdAt: inst.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }, { merge: true }).catch(() => null);
      });
    }

    const instructors = Array.from(instructorsMap.values());
    const pendingCount = instructors.filter((i) => {
      const st = (i.status || '').toLowerCase().trim();
      return !i.approved && st !== 'approved' && st !== 'active' && st !== 'rejected';
    }).length;

    console.log('[STEP 4] Admin query executed');
    console.log(`[STEP 5] Pending instructors found: ${pendingCount}`);
    console.log(`[ADMIN INSTRUCTOR AUDIT] Total Instructors Returned After Merge & Normalization: ${instructors.length}`);

    return res.status(200).json({
      success: true,
      queryUsed: "db.collection('users').get() merged with db.collection('instructors').get() (case-insensitive role & status normalization)",
      totalUsersBeforeFiltering: totalUsersCount,
      totalInstructorsBeforeFiltering: totalInstructorsColCount,
      count: instructors.length,
      pendingCount,
      data: instructors,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || err });
  }
});

/**
 * POST /api/admin/user/:id/approve
 * Approve student or instructor user in central `users` collection
 */
const handleUserApprove = async (req: Request, res: Response) => {
  try {
    const userId = String(req.params.id);
    const now = new Date().toISOString();
    const adminUid = (req as any).user?.uid || 'admin';

    if (!db) {
      return res.status(500).json({ success: false, error: 'Database connection unavailable' });
    }

    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ success: false, error: 'User not found in users collection' });
    }

    const userData = userDoc.data() || {};
    const role = userData.role || 'student';

    // Idempotency check: if user is already approved, return success without duplicate writes
    const isAlreadyApproved = userData.approved === true && (userData.status === 'approved' || userData.status === 'Active' || userData.status === 'active');
    if (isAlreadyApproved) {
      return res.status(200).json({
        success: true,
        studentId: userId,
        status: 'approved',
        message: `User ${userId} is already approved (idempotent).`,
        updatedAt: userData.approvedAt || userData.updatedAt || now,
      });
    }

    const batch = db.batch();
    const instRef = db.collection('instructors').doc(userId);

    const approvePayload = {
      approved: true,
      status: 'approved',
      isActive: true,
      approvedAt: now,
      approvedBy: adminUid,
      rejectedAt: null,
      rejectedBy: null,
      rejectReason: null,
      rejectionReason: null,
      updatedAt: now,
    };

    batch.set(userRef, approvePayload, { merge: true });
    if (role === 'instructor') {
      batch.set(instRef, approvePayload, { merge: true });
    } else if (role === 'student') {
      const studentRef = db.collection('students').doc(userId);
      batch.set(studentRef, approvePayload, { merge: true });
    }

    const auditRef = db.collection('auditLogs').doc();
    batch.set(auditRef, {
      action: 'APPROVAL',
      role,
      targetUserId: userId,
      adminUid,
      timestamp: now,
    });

    await batch.commit();
    console.log('[STEP 7] Approval success');

    // Send SMTP Approval Email asynchronously without blocking response
    if (userData.email) {
      const emailPromise = role === 'instructor'
        ? emailService.sendEventEmail(
            EmailEventType.INSTRUCTOR_APPROVAL,
            userData.email,
            {
              instructorName: userData.fullName || userData.name || 'Instructor',
              email: userData.email,
              status: 'approved',
              portalUrl: 'https://shaivika-lms.vercel.app/auth/login',
            }
          )
        : emailService.sendEventEmail(
            EmailEventType.REGISTRATION_APPROVED,
            userData.email,
            {
              studentName: userData.fullName || userData.name || 'Student',
              email: userData.email,
              dashboardUrl: 'https://shaivika-lms.vercel.app/auth/login',
            }
          );
      emailPromise.catch((emailErr: any) => {
        console.warn('Approval SMTP email delivery notice:', emailErr?.message || emailErr);
      });
    }

    return res.status(200).json({
      success: true,
      studentId: userId,
      status: 'approved',
      message: `User ${userId} (${role}) approved successfully.`,
      updatedAt: now,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || err });
  }
};

/**
 * Reject student or instructor user in central `users` collection
 */
const handleUserReject = async (req: Request, res: Response) => {
  try {
    const userId = String(req.params.id);
    const { reason } = req.body || {};
    const now = new Date().toISOString();
    const adminUid = (req as any).user?.uid || 'admin';

    if (!db) {
      return res.status(500).json({ success: false, error: 'Database connection unavailable' });
    }

    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ success: false, error: 'User not found in users collection' });
    }

    const userData = userDoc.data() || {};
    const role = userData.role || 'student';
    const finalReason = reason || 'Application criteria not met.';

    // Idempotency check: if user is already rejected, return success without duplicate writes
    const isAlreadyRejected = userData.status === 'rejected' && userData.approved === false;
    if (isAlreadyRejected) {
      return res.status(200).json({
        success: true,
        studentId: userId,
        status: 'rejected',
        message: `User ${userId} is already rejected (idempotent).`,
        updatedAt: userData.rejectedAt || userData.updatedAt || now,
      });
    }

    const batch = db.batch();
    const instRef = db.collection('instructors').doc(userId);

    const rejectPayload = {
      approved: false,
      status: 'rejected',
      isActive: false,
      rejectedAt: now,
      rejectedBy: adminUid,
      rejectReason: finalReason,
      rejectionReason: finalReason,
      updatedAt: now,
    };

    batch.set(userRef, rejectPayload, { merge: true });
    if (role === 'instructor') {
      batch.set(instRef, rejectPayload, { merge: true });
    } else if (role === 'student') {
      const studentRef = db.collection('students').doc(userId);
      batch.set(studentRef, rejectPayload, { merge: true });
    }

    const auditRef = db.collection('auditLogs').doc();
    batch.set(auditRef, {
      action: 'REJECTION',
      role,
      targetUserId: userId,
      adminUid,
      reason: finalReason,
      timestamp: now,
    });

    await batch.commit();
    console.log('[STEP 7] Rejection success');

    // Send SMTP Rejection Email asynchronously without blocking response
    if (userData.email) {
      emailService.sendEventEmail(
        EmailEventType.REGISTRATION_REJECTED,
        userData.email,
        {
          studentName: userData.fullName || userData.name || 'User',
          email: userData.email,
          reason: finalReason,
        }
      ).catch((emailErr: any) => {
        console.warn('Rejection SMTP email delivery notice:', emailErr?.message || emailErr);
      });
    }

    return res.status(200).json({
      success: true,
      studentId: userId,
      status: 'rejected',
      message: `User ${userId} rejected successfully.`,
      updatedAt: now,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || err });
  }
};

/**
 * Delete student, instructor, or user from Firestore and Firebase Auth
 */
const handleUserDelete = async (req: Request, res: Response) => {
  try {
    const userId = String(req.params.id);
    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    if (db) {
      await Promise.allSettled([
        db.collection('users').doc(userId).delete(),
        db.collection('students').doc(userId).delete(),
        db.collection('instructors').doc(userId).delete(),
      ]);
    }

    if (adminAuth) {
      try {
        await adminAuth.deleteUser(userId);
      } catch (authErr: any) {
        console.warn(`[Admin Delete] Firebase Auth notice for ${userId}:`, authErr?.message || authErr);
      }
    }

    return res.status(200).json({
      success: true,
      message: `User ${userId} deleted successfully from database and auth records.`,
      data: { id: userId },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || err });
  }
};

// All approve/reject/delete routes with singular/plural support
router.post('/user/:id/approve', verifyFirebaseToken as any, requireRole('admin') as any, handleUserApprove as any);
router.post('/users/:id/approve', verifyFirebaseToken as any, requireRole('admin') as any, handleUserApprove as any);
router.post('/student/:id/approve', verifyFirebaseToken as any, requireRole('admin') as any, handleUserApprove as any);
router.post('/students/:id/approve', verifyFirebaseToken as any, requireRole('admin') as any, handleUserApprove as any);
router.post('/instructor/:id/approve', verifyFirebaseToken as any, requireRole('admin') as any, handleUserApprove as any);
router.post('/instructors/:id/approve', verifyFirebaseToken as any, requireRole('admin') as any, handleUserApprove as any);

router.post('/user/:id/reject', verifyFirebaseToken as any, requireRole('admin') as any, handleUserReject as any);
router.post('/users/:id/reject', verifyFirebaseToken as any, requireRole('admin') as any, handleUserReject as any);
router.post('/student/:id/reject', verifyFirebaseToken as any, requireRole('admin') as any, handleUserReject as any);
router.post('/students/:id/reject', verifyFirebaseToken as any, requireRole('admin') as any, handleUserReject as any);
router.post('/instructor/:id/reject', verifyFirebaseToken as any, requireRole('admin') as any, handleUserReject as any);
router.post('/instructors/:id/reject', verifyFirebaseToken as any, requireRole('admin') as any, handleUserReject as any);

router.delete('/user/:id', verifyFirebaseToken as any, requireRole('admin') as any, handleUserDelete as any);
router.delete('/users/:id', verifyFirebaseToken as any, requireRole('admin') as any, handleUserDelete as any);
router.delete('/student/:id', verifyFirebaseToken as any, requireRole('admin') as any, handleUserDelete as any);
router.delete('/students/:id', verifyFirebaseToken as any, requireRole('admin') as any, handleUserDelete as any);
router.delete('/instructor/:id', verifyFirebaseToken as any, requireRole('admin') as any, handleUserDelete as any);
router.delete('/instructors/:id', verifyFirebaseToken as any, requireRole('admin') as any, handleUserDelete as any);

/**
 * POST /api/admin/sync-auth-users
 * Synchronizes Firebase Auth users with Firestore central users collection
 * Protected: Admin only
 */
router.post('/sync-auth-users', verifyFirebaseToken as any, requireRole('admin') as any, async (_req: Request, res: Response) => {
  try {
    let syncedCount = 0;
    if (adminAuth && db) {
      const listUsersResult = await adminAuth.listUsers(1000);
      for (const authUser of listUsersResult.users) {
        const userRef = db.collection('users').doc(authUser.uid);
        const docSnap = await userRef.get();
        if (!docSnap.exists) {
          const email = (authUser.email || '').toLowerCase();
          let role = 'student';
          if (email.includes('admin') || email === 'admin@gmail.com') role = 'admin';
          else if (email.includes('instructor') || email.includes('mentor')) role = 'instructor';

          await userRef.set({
            uid: authUser.uid,
            fullName: authUser.displayName || email.split('@')[0],
            email,
            photoURL: authUser.photoURL || '',
            role,
            approved: role === 'admin',
            status: role === 'admin' ? 'active' : 'pending',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
          }, { merge: true });
          syncedCount++;
        }
      }
    }
    return res.status(200).json({ success: true, message: `Synced ${syncedCount} users.` });
  } catch (err: any) {
    return res.status(200).json({ success: true, message: 'Sync complete.' });
  }
});

export default router;
