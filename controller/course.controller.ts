import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { CourseService } from '../service/course.service';
import { IAuthRequest } from '../types/auth.types';

const courseService = new CourseService();

export class CourseController {
  async createCourse(req: IAuthRequest, res: Response): Promise<void> {
    try {
      const teacherId = req.user!.userId;
      const course = await courseService.createCourse(req.body, teacherId);
      res.status(StatusCodes.CREATED).json({
        message: 'Course created successfully',
        data: course,
      });
    } catch (error: any) {
      res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Failed to create course',
      });
    }
  }

  async getCourseById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const course = await courseService.getCourseById(id);
      res.status(StatusCodes.OK).json({
        message: 'Course retrieved successfully',
        data: course,
      });
    } catch (error: any) {
      res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Failed to get course',
      });
    }
  }

  async getCourseByCode(req: Request, res: Response): Promise<void> {
    try {
      const { code } = req.params;
      const course = await courseService.getCourseByCode(code);
      res.status(StatusCodes.OK).json({
        message: 'Course retrieved successfully',
        data: course,
      });
    } catch (error: any) {
      res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Failed to get course',
      });
    }
  }

  async getAllCourses(req: Request, res: Response): Promise<void> {
    try {
      const { teacherId, isActive, search, page, limit } = req.query;
      const filters = {
        teacherId: teacherId as string,
        isActive: isActive ? isActive === 'true' : undefined,
        search: search as string,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      };

      const result = await courseService.getAllCourses(filters);
      res.status(StatusCodes.OK).json({
        message: 'Courses retrieved successfully',
        data: result,
      });
    } catch (error: any) {
      res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Failed to get courses',
      });
    }
  }

  async getUpcomingCourses(req: Request, res: Response): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const courses = await courseService.getUpcomingCourses(limit);
      res.status(StatusCodes.OK).json({
        message: 'Upcoming courses retrieved successfully',
        data: courses,
      });
    } catch (error: any) {
      res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Failed to get upcoming courses',
      });
    }
  }

  async getOngoingCourses(req: Request, res: Response): Promise<void> {
    try {
      const courses = await courseService.getOngoingCourses();
      res.status(StatusCodes.OK).json({
        message: 'Ongoing courses retrieved successfully',
        data: courses,
      });
    } catch (error: any) {
      res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Failed to get ongoing courses',
      });
    }
  }

  async getCoursesByTeacher(req: IAuthRequest, res: Response): Promise<void> {
    try {
      const { teacherId } = req.params;
      const courses = await courseService.getCoursesByTeacher(teacherId);
      res.status(StatusCodes.OK).json({
        message: 'Teacher courses retrieved successfully',
        data: courses,
      });
    } catch (error: any) {
      res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Failed to get teacher courses',
      });
    }
  }

  async getMyCourses(req: IAuthRequest, res: Response): Promise<void> {
    try {
      const teacherId = req.user!.userId;
      const courses = await courseService.getCoursesByTeacher(teacherId);
      res.status(StatusCodes.OK).json({
        message: 'Your courses retrieved successfully',
        data: courses,
      });
    } catch (error: any) {
      res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Failed to get your courses',
      });
    }
  }

  async getAvailableCourses(req: Request, res: Response): Promise<void> {
    try {
      const courses = await courseService.getAvailableCourses();
      res.status(StatusCodes.OK).json({
        message: 'Available courses retrieved successfully',
        data: courses,
      });
    } catch (error: any) {
      res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Failed to get available courses',
      });
    }
  }

  async updateCourse(req: IAuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;
      const userRole = req.user!.role;
      const course = await courseService.updateCourse(id, req.body, userId, userRole);
      res.status(StatusCodes.OK).json({
        message: 'Course updated successfully',
        data: course,
      });
    } catch (error: any) {
      res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Failed to update course',
      });
    }
  }

  async deleteCourse(req: IAuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;
      const userRole = req.user!.role;
      await courseService.deleteCourse(id, userId, userRole);
      res.status(StatusCodes.OK).json({
        message: 'Course deleted successfully',
      });
    } catch (error: any) {
      res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Failed to delete course',
      });
    }
  }

  async toggleCourseStatus(req: IAuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;
      const userRole = req.user!.role;
      const course = await courseService.toggleCourseStatus(id, userId, userRole);
      res.status(StatusCodes.OK).json({
        message: 'Course status toggled successfully',
        data: course,
      });
    } catch (error: any) {
      res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Failed to toggle course status',
      });
    }
  }
}
