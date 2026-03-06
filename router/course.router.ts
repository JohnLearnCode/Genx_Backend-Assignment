import { Router } from 'express';
import { CourseController } from '../controller/course.controller';
import { validate } from '../middleware/validator.middleware';
import { createCourseSchema, updateCourseSchema } from '../validator/course.validator';
import { authenticate } from '../middleware/auth.middleware';
import { requireTeacherOrAdmin } from '../middleware/authorization.middleware';

const courseRouter = Router();
const courseController = new CourseController();

// Public routes (không cần authentication)
courseRouter.get(
  '/available',
  courseController.getAvailableCourses.bind(courseController)
);

courseRouter.get(
  '/upcoming',
  courseController.getUpcomingCourses.bind(courseController)
);

courseRouter.get(
  '/ongoing',
  courseController.getOngoingCourses.bind(courseController)
);

// Protected routes (yêu cầu authentication)
courseRouter.use(authenticate);

// GET all courses
courseRouter.get(
  '/',
  courseController.getAllCourses.bind(courseController)
);

// GET my courses (teacher's own courses)
courseRouter.get(
  '/my-courses',
  requireTeacherOrAdmin,
  courseController.getMyCourses.bind(courseController)
);

// GET courses by teacher ID
courseRouter.get(
  '/teacher/:teacherId',
  courseController.getCoursesByTeacher.bind(courseController)
);

// GET course by ID
courseRouter.get(
  '/:id',
  courseController.getCourseById.bind(courseController)
);

// GET course by code
courseRouter.get(
  '/code/:code',
  courseController.getCourseByCode.bind(courseController)
);

// CREATE course - Chỉ teacher và admin
courseRouter.post(
  '/',
  requireTeacherOrAdmin,
  validate(createCourseSchema),
  courseController.createCourse.bind(courseController)
);

// UPDATE course - Teacher (owner) hoặc admin
courseRouter.put(
  '/:id',
  requireTeacherOrAdmin,
  validate(updateCourseSchema),
  courseController.updateCourse.bind(courseController)
);

// DELETE course - Teacher (owner) hoặc admin
courseRouter.delete(
  '/:id',
  requireTeacherOrAdmin,
  courseController.deleteCourse.bind(courseController)
);

// TOGGLE course status - Teacher (owner) hoặc admin
courseRouter.patch(
  '/:id/toggle-status',
  requireTeacherOrAdmin,
  courseController.toggleCourseStatus.bind(courseController)
);

export default courseRouter;
