import { Router } from 'express';
import { UserController } from '../controller/user.controller';
import { validate } from '../middleware/validator.middleware';
import { createUserSchema, updateUserSchema } from '../validator/user.validator';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin, requireOwnerOrAdmin, requireTeacherOrAdmin } from '../middleware/authorization.middleware';

const userRouter = Router();
const userController = new UserController();

// Tất cả routes đều yêu cầu authentication
userRouter.use(authenticate);

// GET all users - Chỉ admin và teacher
userRouter.get(
  '/',
  requireTeacherOrAdmin,
  userController.getAllUsers.bind(userController)
);

// GET users by role - Chỉ admin và teacher
userRouter.get(
  '/role/:role',
  requireTeacherOrAdmin,
  userController.getUsersByRole.bind(userController)
);

// GET user by ID - Owner hoặc admin
userRouter.get(
  '/:id',
  requireOwnerOrAdmin,
  userController.getUserById.bind(userController)
);

// CREATE user - Chỉ admin
userRouter.post(
  '/',
  requireAdmin,
  validate(createUserSchema),
  userController.createUser.bind(userController)
);

// UPDATE user - Owner hoặc admin
userRouter.put(
  '/:id',
  requireOwnerOrAdmin,
  validate(updateUserSchema),
  userController.updateUser.bind(userController)
);

// DELETE user - Chỉ admin
userRouter.delete(
  '/:id',
  requireAdmin,
  userController.deleteUser.bind(userController)
);

// TOGGLE user status - Chỉ admin
userRouter.patch(
  '/:id/toggle-status',
  requireAdmin,
  userController.toggleUserStatus.bind(userController)
);

export default userRouter;
