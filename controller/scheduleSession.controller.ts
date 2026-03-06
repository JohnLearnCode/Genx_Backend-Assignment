import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ScheduleSessionService } from '../service/scheduleSession.service';
import { IAuthRequest } from '../types/auth.types';
import { SessionStatus } from '../types/scheduleSession.types';

const scheduleSessionService = new ScheduleSessionService();

export class ScheduleSessionController {
  async createSession(req: IAuthRequest, res: Response): Promise<void> {
    try {
      const session = await scheduleSessionService.createSession(req.body);
      res.status(StatusCodes.CREATED).json({
        message: 'Session created successfully',
        data: session,
      });
    } catch (error: any) {
      res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Failed to create session',
      });
    }
  }

  async getSessionById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const session = await scheduleSessionService.getSessionById(id);
      res.status(StatusCodes.OK).json({
        message: 'Session retrieved successfully',
        data: session,
      });
    } catch (error: any) {
      res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Failed to get session',
      });
    }
  }

  async getAllSessions(req: Request, res: Response): Promise<void> {
    try {
      const { classId, status, startDate, endDate, page, limit } = req.query;
      const filters = {
        classId: classId as string,
        status: status as SessionStatus,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      };

      const result = await scheduleSessionService.getAllSessions(filters);
      res.status(StatusCodes.OK).json({
        message: 'Sessions retrieved successfully',
        data: result,
      });
    } catch (error: any) {
      res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Failed to get sessions',
      });
    }
  }

  async getSessionsByClass(req: Request, res: Response): Promise<void> {
    try {
      const { classId } = req.params;
      const sessions = await scheduleSessionService.getSessionsByClass(classId);
      res.status(StatusCodes.OK).json({
        message: 'Sessions retrieved successfully',
        data: sessions,
      });
    } catch (error: any) {
      res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Failed to get sessions',
      });
    }
  }

  async getUpcomingSessions(req: Request, res: Response): Promise<void> {
    try {
      const { classId } = req.query;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const sessions = await scheduleSessionService.getUpcomingSessions(
        classId as string,
        limit
      );
      res.status(StatusCodes.OK).json({
        message: 'Upcoming sessions retrieved successfully',
        data: sessions,
      });
    } catch (error: any) {
      res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Failed to get upcoming sessions',
      });
    }
  }

  async getTodaySessions(req: Request, res: Response): Promise<void> {
    try {
      const { classId } = req.query;
      const sessions = await scheduleSessionService.getTodaySessions(classId as string);
      res.status(StatusCodes.OK).json({
        message: "Today's sessions retrieved successfully",
        data: sessions,
      });
    } catch (error: any) {
      res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message || "Failed to get today's sessions",
      });
    }
  }

  async updateSession(req: IAuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;
      const userRole = req.user!.role;
      const session = await scheduleSessionService.updateSession(id, req.body, userId, userRole);
      res.status(StatusCodes.OK).json({
        message: 'Session updated successfully',
        data: session,
      });
    } catch (error: any) {
      res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Failed to update session',
      });
    }
  }

  async deleteSession(req: IAuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;
      const userRole = req.user!.role;
      await scheduleSessionService.deleteSession(id, userId, userRole);
      res.status(StatusCodes.OK).json({
        message: 'Session deleted successfully',
      });
    } catch (error: any) {
      res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Failed to delete session',
      });
    }
  }

  async updateSessionStatus(req: IAuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const userId = req.user!.userId;
      const userRole = req.user!.role;

      if (!status) {
        res.status(StatusCodes.BAD_REQUEST).json({
          message: 'Status is required',
        });
        return;
      }

      const session = await scheduleSessionService.updateSessionStatus(
        id,
        status as SessionStatus,
        userId,
        userRole
      );
      res.status(StatusCodes.OK).json({
        message: 'Session status updated successfully',
        data: session,
      });
    } catch (error: any) {
      res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Failed to update session status',
      });
    }
  }

  async generateSessions(req: IAuthRequest, res: Response): Promise<void> {
    try {
      const sessions = await scheduleSessionService.generateSessions(req.body);
      res.status(StatusCodes.CREATED).json({
        message: `${sessions.length} sessions generated successfully`,
        data: sessions,
      });
    } catch (error: any) {
      res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Failed to generate sessions',
      });
    }
  }

  async getSessionStats(req: Request, res: Response): Promise<void> {
    try {
      const { classId } = req.params;
      const stats = await scheduleSessionService.getSessionStats(classId);
      res.status(StatusCodes.OK).json({
        message: 'Session stats retrieved successfully',
        data: stats,
      });
    } catch (error: any) {
      res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Failed to get session stats',
      });
    }
  }
}
