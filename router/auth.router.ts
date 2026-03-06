import { Router } from 'express';
import { AuthController } from '../controller/auth.controller';
import { validate } from '../middleware/validator.middleware';
import { registerSchema, loginSchema } from '../validator/auth.validator';
import { authenticate } from '../middleware/auth.middleware';
import { strictLimiter } from '../middleware/rateLimit.middleware';

const authRouter = Router();
const authController = new AuthController();

// Public routes với strict rate limit
authRouter.post(
  '/register',
  strictLimiter,
  validate(registerSchema),
  authController.register.bind(authController)
);

authRouter.post(
  '/login',
  strictLimiter,
  validate(loginSchema),
  authController.login.bind(authController)
);

authRouter.post(
  '/refresh-token',
  authController.refreshToken.bind(authController)
);

// Protected routes
authRouter.get(
  '/profile',
  authenticate,
  authController.getProfile.bind(authController)
);

export default authRouter;
