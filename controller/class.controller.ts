import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ClassService } from '../service/class.service';
import { IAuthRequest } from '../types/auth.types';

const classService = new ClassService();

export class ClassController {
  async createClass(req: IAuthRequest, res: Response): Promise<void> {
    try {
      const teacherId = req.user!.userId;
      const classData = await classService.createClass(req.body, teacherId);
      res.status(StatusCodes.CREATED).json({
        message: 'Class created successfully',
        data: classData,
      });
    } catch (error: any) {
      res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Failed to create class',
      });
    }
  }

  async getClassById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const classData = await classService.getClassById(id);
      res.status(StatusCodes.OK).json({
        message: 'Class retrieved successfully',
        data: classData,
      });
    } catch (error: any) {
      res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Failed to get class',
      });
    }
  }

  async getAllClasses(req: Request, res: Response): Promise<void> {
    try {
      const { courseId, teacherId, supportStaffId, isActive, page, limit } = req.query;
      const filters = {
        courseId: courseId as string,
        teacherId: teacherId as string,
        supportStaffId: supportStaffId as string,
        isActive: isActive ? isActive === 'true' : undefined,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      };

      const result = await classService.getAllClasses(filters);
      res.status(StatusCodes.OK).json({
        message: 'Classes retrieved successfully',
        data: result,
      });
    } catch (error: any) {
      res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Failed to get classes',
      });
    }
  }

  async getClassesByCourse(req: Request, res: Response): Promise<void> {
    try {
      const { courseId } = req.params;
      const classes = await classService.getClassesByCourse(courseId);
      res.status(StatusCodes.OK).json({
        message: 'Classes retrieved successfully',
        data: classes,
      });
    } catch (error: any) {
      res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Failed to get classes',
      });
    }
  }

  async getClassesByTeacher(req: Request, res: Response): Promise<void> {
    try {
      const { teacherId } = req.params;
      const classes = await classService.getClassesByTeacher(teacherId);
      res.status(StatusCodes.OK).json({
        message: 'Classes retrieved successfully',
        data: classes,
      });
    } catch (error: any) {
      res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Failed to get classes',
      });
    }
  }

  async getMyClasses(req: IAuthRequest, res: Response): Promise<void> {
    try {
      const teacherId = req.user!.userId;
      const classes = await classService.getClassesByTeacher(teacherId);
      res.status(StatusCodes.OK).json({
        message: 'Your classes retrieved successfully',
        data: classes,
      });
    } catch (error: any) {
      res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Failed to get your classes',
      });
    }
  }

  async getClassesBySupportStaff(req: Request, res: Response): Promise<void> {
    try {
      const { supportStaffId } = req.params;
      const classes = await classService.getClassesBySupportStaff(supportStaffId);
      res.status(StatusCodes.OK).json({
        message: 'Classes retrieved successfully',
        data: classes,
      });
    } catch (error: any) {
      res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Failed to get classes',
      });
    }
  }

  async getAvailableClasses(req: Request, res: Response): Promise<void> {
    try {
      const classes = await classService.getAvailableClasses();
      res.status(StatusCodes.OK).json({
        message: 'Available classes retrieved successfully',
        data: classes,
      });
    } catch (error: any) {
      res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Failed to get available classes',
      });
    }
  }

  async updateClass(req: IAuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;
      const userRole = req.user!.role;
      const classData = await classService.updateClass(id, req.body, userId, userRole);
      res.status(StatusCodes.OK).json({
        message: 'Class updated successfully',
        data: classData,
      });
    } catch (error: any) {
      res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Failed to update class',
      });
    }
  }

  async deleteClass(req: IAuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;
      const userRole = req.user!.role;
      await classService.deleteClass(id, userId, userRole);
      res.status(StatusCodes.OK).json({
        message: 'Class deleted successfully',
      });
    } catch (error: any) {
      res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Failed to delete class',
      });
    }
  }

  async toggleClassStatus(req: IAuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;
      const userRole = req.user!.role;
      const classData = await classService.toggleClassStatus(id, userId, userRole);
      res.status(StatusCodes.OK).json({
        message: 'Class status toggled successfully',
        data: classData,
      });
    } catch (error: any) {
      res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Failed to toggle class status',
      });
    }
  }

  async assignSupportStaff(req: IAuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { supportStaffId } = req.body;
      const userId = req.user!.userId;
      const userRole = req.user!.role;

      if (!supportStaffId) {
        res.status(StatusCodes.BAD_REQUEST).json({
          message: 'Support staff ID is required',
        });
        return;
      }

      const classData = await classService.assignSupportStaff(id, supportStaffId, userId, userRole);
      res.status(StatusCodes.OK).json({
        message: 'Support staff assigned successfully',
        data: classData,
      });
    } catch (error: any) {
      res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Failed to assign support staff',
      });
    }
  }

  async removeSupportStaff(req: IAuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;
      const userRole = req.user!.role;
      const classData = await classService.removeSupportStaff(id, userId, userRole);
      res.status(StatusCodes.OK).json({
        message: 'Support staff removed successfully',
        data: classData,
      });
    } catch (error: any) {
      res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Failed to remove support staff',
      });
    }
  }
}
