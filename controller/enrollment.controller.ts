import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { EnrollmentService } from '../service/enrollment.service';
import { IAuthRequest } from '../types/auth.types';
import { EnrollmentStatus } from '../types/enrollment.types';

const enrollmentService = new EnrollmentService();

export class EnrollmentController {
  async enrollStudent(req: IAuthRequest, res: Response): Promise<void> {
    try {
      const studentId = req.user!.userId;
      const enrollment = await enrollmentService.enrollStudent(req.body, studentId);
      res.status(StatusCodes.CREATED).json({
        message: 'Enrollment request created successfully',
        data: enrollment,
      });
    } catch (error: any) {
      res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Failed to enroll student',
      });
    }
  }

  async enrollStudentByAdmin(req: IAuthRequest, res: Response): Promise<void> {
    try {
      const enrollment = await enrollmentService.enrollStudentByAdmin(req.body);
      res.status(StatusCodes.CREATED).json({
        message: 'Student enrolled successfully',
        data: enrollment,
      });
    } catch (error: any) {
      res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Failed to enroll student',
      });
    }
  }

  async getEnrollmentById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const enrollment = await enrollmentService.getEnrollmentById(id);
      res.status(StatusCodes.OK).json({
        message: 'Enrollment retrieved successfully',
        data: enrollment,
      });
    } catch (error: any) {
      res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Failed to get enrollment',
      });
    }
  }

  async getAllEnrollments(req: Request, res: Response): Promise<void> {
    try {
      const { studentId, classId, status, page, limit } = req.query;
      const filters = {
        studentId: studentId as string,
        classId: classId as string,
        status: status as EnrollmentStatus,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      };

      const result = await enrollmentService.getAllEnrollments(filters);
      res.status(StatusCodes.OK).json({
        message: 'Enrollments retrieved successfully',
        data: result,
      });
    } catch (error: any) {
      res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Failed to get enrollments',
      });
    }
  }

  async getMyEnrollments(req: IAuthRequest, res: Response): Promise<void> {
    try {
      const studentId = req.user!.userId;
      const { status, page, limit } = req.query;
      const filters = {
        status: status as EnrollmentStatus,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      };

      const result = await enrollmentService.getMyEnrollments(studentId, filters);
      res.status(StatusCodes.OK).json({
        message: 'Your enrollments retrieved successfully',
        data: result,
      });
    } catch (error: any) {
      res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Failed to get your enrollments',
      });
    }
  }

  async getEnrollmentsByClass(req: Request, res: Response): Promise<void> {
    try {
      const { classId } = req.params;
      const enrollments = await enrollmentService.getEnrollmentsByClass(classId);
      res.status(StatusCodes.OK).json({
        message: 'Enrollments retrieved successfully',
        data: enrollments,
      });
    } catch (error: any) {
      res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Failed to get enrollments',
      });
    }
  }

  async getPendingEnrollments(req: Request, res: Response): Promise<void> {
    try {
      const { classId } = req.query;
      const enrollments = await enrollmentService.getPendingEnrollments(classId as string);
      res.status(StatusCodes.OK).json({
        message: 'Pending enrollments retrieved successfully',
        data: enrollments,
      });
    } catch (error: any) {
      res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Failed to get pending enrollments',
      });
    }
  }

  async updateEnrollment(req: IAuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;
      const userRole = req.user!.role;
      const enrollment = await enrollmentService.updateEnrollment(id, req.body, userId, userRole);
      res.status(StatusCodes.OK).json({
        message: 'Enrollment updated successfully',
        data: enrollment,
      });
    } catch (error: any) {
      res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Failed to update enrollment',
      });
    }
  }

  async deleteEnrollment(req: IAuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;
      const userRole = req.user!.role;
      await enrollmentService.deleteEnrollment(id, userId, userRole);
      res.status(StatusCodes.OK).json({
        message: 'Enrollment deleted successfully',
      });
    } catch (error: any) {
      res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Failed to delete enrollment',
      });
    }
  }

  async approveEnrollment(req: IAuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;
      const userRole = req.user!.role;
      const enrollment = await enrollmentService.approveEnrollment(id, userId, userRole);
      res.status(StatusCodes.OK).json({
        message: 'Enrollment approved successfully',
        data: enrollment,
      });
    } catch (error: any) {
      res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Failed to approve enrollment',
      });
    }
  }

  async rejectEnrollment(req: IAuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { notes } = req.body;
      const userId = req.user!.userId;
      const userRole = req.user!.role;
      const enrollment = await enrollmentService.rejectEnrollment(id, notes, userId, userRole);
      res.status(StatusCodes.OK).json({
        message: 'Enrollment rejected successfully',
        data: enrollment,
      });
    } catch (error: any) {
      res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Failed to reject enrollment',
      });
    }
  }

  async dropEnrollment(req: IAuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;
      const userRole = req.user!.role;
      const enrollment = await enrollmentService.dropEnrollment(id, userId, userRole);
      res.status(StatusCodes.OK).json({
        message: 'Enrollment dropped successfully',
        data: enrollment,
      });
    } catch (error: any) {
      res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Failed to drop enrollment',
      });
    }
  }

  async getEnrollmentStats(req: Request, res: Response): Promise<void> {
    try {
      const { classId, studentId } = req.query;
      const filters = {
        classId: classId as string,
        studentId: studentId as string,
      };

      const stats = await enrollmentService.getEnrollmentStats(filters);
      res.status(StatusCodes.OK).json({
        message: 'Enrollment stats retrieved successfully',
        data: stats,
      });
    } catch (error: any) {
      res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Failed to get enrollment stats',
      });
    }
  }
}
