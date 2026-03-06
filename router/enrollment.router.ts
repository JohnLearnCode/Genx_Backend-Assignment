import { Router } from 'express';
import { EnrollmentController } from '../controller/enrollment.controller';
import { validate } from '../middleware/validator.middleware';
import {
  createEnrollmentSchema,
  enrollStudentSchema,
  updateEnrollmentSchema,
} from '../validator/enrollment.validator';
import { authenticate } from '../middleware/auth.middleware';
import { requireTeacherOrAdmin, requireAdmin } from '../middleware/authorization.middleware';

const enrollmentRouter = Router();
const enrollmentController = new EnrollmentController();

// Tất cả routes đều yêu cầu authentication
enrollmentRouter.use(authenticate);

// GET all enrollments - Teacher/Admin
enrollmentRouter.get(
  '/',
  requireTeacherOrAdmin,
  enrollmentController.getAllEnrollments.bind(enrollmentController)
);

// GET pending enrollments - Teacher/Admin
enrollmentRouter.get(
  '/pending',
  requireTeacherOrAdmin,
  enrollmentController.getPendingEnrollments.bind(enrollmentController)
);

// GET my enrollments (student's own enrollments)
enrollmentRouter.get(
  '/my-enrollments',
  enrollmentController.getMyEnrollments.bind(enrollmentController)
);

// GET enrollment stats - Teacher/Admin
enrollmentRouter.get(
  '/stats',
  requireTeacherOrAdmin,
  enrollmentController.getEnrollmentStats.bind(enrollmentController)
);

// GET enrollments by class ID
enrollmentRouter.get(
  '/class/:classId',
  enrollmentController.getEnrollmentsByClass.bind(enrollmentController)
);

// GET enrollment by ID
enrollmentRouter.get(
  '/:id',
  enrollmentController.getEnrollmentById.bind(enrollmentController)
);

// CREATE enrollment (student self-enroll)
enrollmentRouter.post(
  '/',
  validate(createEnrollmentSchema),
  enrollmentController.enrollStudent.bind(enrollmentController)
);

// CREATE enrollment by admin (enroll any student)
enrollmentRouter.post(
  '/admin/enroll',
  requireAdmin,
  validate(enrollStudentSchema),
  enrollmentController.enrollStudentByAdmin.bind(enrollmentController)
);

// UPDATE enrollment - Student (owner)/Teacher/Admin
enrollmentRouter.put(
  '/:id',
  validate(updateEnrollmentSchema),
  enrollmentController.updateEnrollment.bind(enrollmentController)
);

// DELETE enrollment - Student (owner)/Admin
enrollmentRouter.delete(
  '/:id',
  enrollmentController.deleteEnrollment.bind(enrollmentController)
);

// APPROVE enrollment - Teacher/Admin
enrollmentRouter.patch(
  '/:id/approve',
  requireTeacherOrAdmin,
  enrollmentController.approveEnrollment.bind(enrollmentController)
);

// REJECT enrollment - Teacher/Admin
enrollmentRouter.patch(
  '/:id/reject',
  requireTeacherOrAdmin,
  enrollmentController.rejectEnrollment.bind(enrollmentController)
);

// DROP enrollment - Student (owner)/Admin
enrollmentRouter.patch(
  '/:id/drop',
  enrollmentController.dropEnrollment.bind(enrollmentController)
);

export default enrollmentRouter;
