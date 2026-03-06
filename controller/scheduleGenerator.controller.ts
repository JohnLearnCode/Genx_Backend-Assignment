import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ScheduleGeneratorService } from '../service/scheduleGenerator.service';

const scheduleGeneratorService = new ScheduleGeneratorService();

export class ScheduleGeneratorController {
  async generateSchedule(req: Request, res: Response): Promise<void> {
    try {
      const result = scheduleGeneratorService.generateSchedule(req.body);
      res.status(StatusCodes.OK).json({
        message: 'Schedule generated successfully',
        data: result,
      });
    } catch (error: any) {
      res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Failed to generate schedule',
        errors: error.errors,
      });
    }
  }

  async generateScheduleWithDetails(req: Request, res: Response): Promise<void> {
    try {
      const result = scheduleGeneratorService.generateScheduleWithDetails(req.body);
      res.status(StatusCodes.OK).json({
        message: 'Schedule generated successfully with details',
        data: result,
      });
    } catch (error: any) {
      res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Failed to generate schedule',
        errors: error.errors,
      });
    }
  }
}
