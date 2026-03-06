import { Router } from 'express';
import { ScheduleSessionController } from '../controller/scheduleSession.controller';
import { validate } from '../middleware/validator.middleware';
import {
  createScheduleSessionSchema,
  updateScheduleSessionSchema,
  generateSessionsSchema,
} from '../validator/scheduleSession.validator';
import { authenticate } from '../middleware/auth.middleware';
import { requireTeacherOrAdmin } from '../middleware/authorization.middleware';

const scheduleSessionRouter = Router();
const scheduleSessionController = new ScheduleSessionController();

// Public routes (không cần authentication)
scheduleSessionRouter.get(
  '/upcoming',
  scheduleSessionController.getUpcomingSessions.bind(scheduleSessionController)
);

scheduleSessionRouter.get(
  '/today',
  scheduleSessionController.getTodaySessions.bind(scheduleSessionController)
);

// Protected routes (yêu cầu authentication)
scheduleSessionRouter.use(authenticate);

// GET all sessions
scheduleSessionRouter.get(
  '/',
  scheduleSessionController.getAllSessions.bind(scheduleSessionController)
);

// GET sessions by class ID
scheduleSessionRouter.get(
  '/class/:classId',
  scheduleSessionController.getSessionsByClass.bind(scheduleSessionController)
);

// GET session stats by class ID
scheduleSessionRouter.get(
  '/stats/:classId',
  scheduleSessionController.getSessionStats.bind(scheduleSessionController)
);

// GET session by ID
scheduleSessionRouter.get(
  '/:id',
  scheduleSessionController.getSessionById.bind(scheduleSessionController)
);

// CREATE session - Chỉ teacher và admin
scheduleSessionRouter.post(
  '/',
  requireTeacherOrAdmin,
  validate(createScheduleSessionSchema),
  scheduleSessionController.createSession.bind(scheduleSessionController)
);

// GENERATE multiple sessions - Chỉ teacher và admin
scheduleSessionRouter.post(
  '/generate',
  requireTeacherOrAdmin,
  validate(generateSessionsSchema),
  scheduleSessionController.generateSessions.bind(scheduleSessionController)
);

// UPDATE session - Teacher (owner) hoặc admin
scheduleSessionRouter.put(
  '/:id',
  requireTeacherOrAdmin,
  validate(updateScheduleSessionSchema),
  scheduleSessionController.updateSession.bind(scheduleSessionController)
);

// UPDATE session status - Teacher (owner) hoặc admin
scheduleSessionRouter.patch(
  '/:id/status',
  requireTeacherOrAdmin,
  scheduleSessionController.updateSessionStatus.bind(scheduleSessionController)
);

// DELETE session - Teacher (owner) hoặc admin
scheduleSessionRouter.delete(
  '/:id',
  requireTeacherOrAdmin,
  scheduleSessionController.deleteSession.bind(scheduleSessionController)
);

export default scheduleSessionRouter;
