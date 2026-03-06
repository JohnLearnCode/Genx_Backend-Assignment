import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { UserService } from '../service/user.service';

const userService = new UserService();

export class UserController {
  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const user = await userService.createUser(req.body);
      res.status(StatusCodes.CREATED).json({
        message: 'User created successfully',
        data: user,
      });
    } catch (error: any) {
      res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Failed to create user',
      });
    }
  }

  async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = await userService.getUserById(id);
      res.status(StatusCodes.OK).json({
        message: 'User retrieved successfully',
        data: user,
      });
    } catch (error: any) {
      res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Failed to get user',
      });
    }
  }

  async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const { role, isActive, page, limit } = req.query;
      const filters = {
        role: role as string,
        isActive: isActive ? isActive === 'true' : undefined,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      };

      const result = await userService.getAllUsers(filters);
      res.status(StatusCodes.OK).json({
        message: 'Users retrieved successfully',
        data: result,
      });
    } catch (error: any) {
      res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Failed to get users',
      });
    }
  }

  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = await userService.updateUser(id, req.body);
      res.status(StatusCodes.OK).json({
        message: 'User updated successfully',
        data: user,
      });
    } catch (error: any) {
      res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Failed to update user',
      });
    }
  }

  async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await userService.deleteUser(id);
      res.status(StatusCodes.OK).json({
        message: 'User deleted successfully',
      });
    } catch (error: any) {
      res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Failed to delete user',
      });
    }
  }

  async toggleUserStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = await userService.toggleUserStatus(id);
      res.status(StatusCodes.OK).json({
        message: 'User status toggled successfully',
        data: user,
      });
    } catch (error: any) {
      res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Failed to toggle user status',
      });
    }
  }

  async getUsersByRole(req: Request, res: Response): Promise<void> {
    try {
      const { role } = req.params;
      const users = await userService.getUsersByRole(role);
      res.status(StatusCodes.OK).json({
        message: 'Users retrieved successfully',
        data: users,
      });
    } catch (error: any) {
      res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Failed to get users by role',
      });
    }
  }
}
