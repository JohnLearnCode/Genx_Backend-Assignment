import { Router } from 'express';
import { ScheduleGeneratorController } from '../controller/scheduleGenerator.controller';
import { validate } from '../middleware/validator.middleware';
import { generateScheduleSchema } from '../validator/scheduleGenerator.validator';
import { authenticate } from '../middleware/auth.middleware';
import { requireTeacherOrAdmin } from '../middleware/authorization.middleware';

const scheduleGeneratorRouter = Router();
const scheduleGeneratorController = new ScheduleGeneratorController();

// Require authentication and teacher/admin role
scheduleGeneratorRouter.use(authenticate);
scheduleGeneratorRouter.use(requireTeacherOrAdmin);

// Generate schedule
scheduleGeneratorRouter.post(
  '/generate',
  validate(generateScheduleSchema),
  scheduleGeneratorController.generateSchedule.bind(scheduleGeneratorController)
);

// Generate schedule with detailed statistics
scheduleGeneratorRouter.post(
  '/generate-with-details',
  validate(generateScheduleSchema),
  scheduleGeneratorController.generateScheduleWithDetails.bind(scheduleGeneratorController)
);

export default scheduleGeneratorRouter;
