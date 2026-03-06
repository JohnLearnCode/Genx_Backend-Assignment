import { Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { IAuthRequest } from '../types/auth.types';
import { UserRole } from '../types/user.types';

export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: IAuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        message: 'User not authenticated',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(StatusCodes.FORBIDDEN).json({
        message: 'You do not have permission to access this resource',
      });
      return;
    }

    next();
  };
};

// Middleware kiểm tra quyền admin
export const requireAdmin = authorize(UserRole.ADMIN);

// Middleware kiểm tra quyền teacher hoặc admin
export const requireTeacherOrAdmin = authorize(UserRole.TEACHER, UserRole.ADMIN);

// Middleware cho phép user chỉ truy cập resource của chính họ hoặc admin
export const requireOwnerOrAdmin = (
  req: IAuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(StatusCodes.UNAUTHORIZED).json({
      message: 'User not authenticated',
    });
    return;
  }

  const userId = req.params.id;
  const isOwner = req.user.userId === userId;
  const isAdmin = req.user.role === UserRole.ADMIN;

  if (!isOwner && !isAdmin) {
    res.status(StatusCodes.FORBIDDEN).json({
      message: 'You can only access your own resources',
    });
    return;
  }

  next();
};
