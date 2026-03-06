import { Router } from 'express';
import { ClassController } from '../controller/class.controller';
import { validate } from '../middleware/validator.middleware';
import { createClassSchema, updateClassSchema } from '../validator/class.validator';
import { authenticate } from '../middleware/auth.middleware';
import { requireTeacherOrAdmin } from '../middleware/authorization.middleware';

const classRouter = Router();
const classController = new ClassController();

// Public routes (không cần authentication)
classRouter.get(
  '/available',
  classController.getAvailableClasses.bind(classController)
);

// Protected routes (yêu cầu authentication)
classRouter.use(authenticate);

// GET all classes
classRouter.get(
  '/',
  classController.getAllClasses.bind(classController)
);

// GET my classes (teacher's own classes)
classRouter.get(
  '/my-classes',
  requireTeacherOrAdmin,
  classController.getMyClasses.bind(classController)
);

// GET classes by course ID
classRouter.get(
  '/course/:courseId',
  classController.getClassesByCourse.bind(classController)
);

// GET classes by teacher ID
classRouter.get(
  '/teacher/:teacherId',
  classController.getClassesByTeacher.bind(classController)
);

// GET classes by support staff ID
classRouter.get(
  '/support-staff/:supportStaffId',
  classController.getClassesBySupportStaff.bind(classController)
);

// GET class by ID
classRouter.get(
  '/:id',
  classController.getClassById.bind(classController)
);

// CREATE class - Chỉ teacher và admin
classRouter.post(
  '/',
  requireTeacherOrAdmin,
  validate(createClassSchema),
  classController.createClass.bind(classController)
);

// UPDATE class - Teacher (owner) hoặc admin
classRouter.put(
  '/:id',
  requireTeacherOrAdmin,
  validate(updateClassSchema),
  classController.updateClass.bind(classController)
);

// DELETE class - Teacher (owner) hoặc admin
classRouter.delete(
  '/:id',
  requireTeacherOrAdmin,
  classController.deleteClass.bind(classController)
);

// TOGGLE class status - Teacher (owner) hoặc admin
classRouter.patch(
  '/:id/toggle-status',
  requireTeacherOrAdmin,
  classController.toggleClassStatus.bind(classController)
);

// ASSIGN support staff - Teacher (owner) hoặc admin
classRouter.patch(
  '/:id/assign-support-staff',
  requireTeacherOrAdmin,
  classController.assignSupportStaff.bind(classController)
);

// REMOVE support staff - Teacher (owner) hoặc admin
classRouter.patch(
  '/:id/remove-support-staff',
  requireTeacherOrAdmin,
  classController.removeSupportStaff.bind(classController)
);

export default classRouter;
