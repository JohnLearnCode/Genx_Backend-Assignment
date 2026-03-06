import { StatusCodes } from 'http-status-codes';
import { ScheduleSessionModel } from '../model/scheduleSession.model';
import { ClassModel } from '../model/class.model';
import {
  ICreateScheduleSessionDTO,
  IUpdateScheduleSessionDTO,
  IGenerateSessionsDTO,
  SessionStatus,
} from '../types/scheduleSession.types';
import { UserRole } from '../types/user.types';

export class ScheduleSessionService {
  async createSession(data: ICreateScheduleSessionDTO): Promise<any> {
    // Kiểm tra class tồn tại
    const classData = await ClassModel.findById(data.classId);
    if (!classData) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: 'Class not found',
      };
    }

    // Kiểm tra session đã tồn tại chưa (classId + sessionDate unique)
    const existingSession = await ScheduleSessionModel.findOne({
      classId: data.classId,
      sessionDate: data.sessionDate,
    });
    if (existingSession) {
      throw {
        status: StatusCodes.CONFLICT,
        message: 'Session already exists for this class on this date',
      };
    }

    const session = await ScheduleSessionModel.create(data);
    return session.toJSON();
  }

  async getSessionById(sessionId: string): Promise<any> {
    const session = await ScheduleSessionModel.findById(sessionId);
    if (!session) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: 'Session not found',
      };
    }
    return session.toJSON();
  }

  async getAllSessions(filters?: {
    classId?: string;
    status?: SessionStatus;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }): Promise<{ sessions: any[]; total: number; page: number; totalPages: number }> {
    const { classId, status, startDate, endDate, page = 1, limit = 10 } = filters || {};

    const query: any = {};
    if (classId) query.classId = classId;
    if (status) query.status = status;
    if (startDate || endDate) {
      query.sessionDate = {};
      if (startDate) query.sessionDate.$gte = startDate;
      if (endDate) query.sessionDate.$lte = endDate;
    }

    const skip = (page - 1) * limit;

    const [sessions, total] = await Promise.all([
      ScheduleSessionModel.find(query).skip(skip).limit(limit).sort({ sessionDate: 1 }),
      ScheduleSessionModel.countDocuments(query),
    ]);

    return {
      sessions: sessions.map((session) => session.toJSON()),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getSessionsByClass(classId: string): Promise<any[]> {
    const sessions = await ScheduleSessionModel.find({ classId }).sort({ sessionDate: 1 });
    return sessions.map((session) => session.toJSON());
  }

  async getUpcomingSessions(classId?: string, limit: number = 10): Promise<any[]> {
    const now = new Date();
    const query: any = {
      sessionDate: { $gt: now },
      status: SessionStatus.SCHEDULED,
    };
    if (classId) query.classId = classId;

    const sessions = await ScheduleSessionModel.find(query)
      .sort({ sessionDate: 1 })
      .limit(limit);

    return sessions.map((session) => session.toJSON());
  }

  async getTodaySessions(classId?: string): Promise<any[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const query: any = {
      sessionDate: {
        $gte: today,
        $lt: tomorrow,
      },
    };
    if (classId) query.classId = classId;

    const sessions = await ScheduleSessionModel.find(query).sort({ sessionDate: 1 });

    return sessions.map((session) => session.toJSON());
  }

  async updateSession(
    sessionId: string,
    data: IUpdateScheduleSessionDTO,
    userId: string,
    userRole: UserRole
  ): Promise<any> {
    const session = await ScheduleSessionModel.findById(sessionId);
    if (!session) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: 'Session not found',
      };
    }

    // Kiểm tra quyền: chỉ teacher của class hoặc admin mới được sửa
    if (userRole !== UserRole.ADMIN) {
      const classData = await ClassModel.findById(session.classId);
      if (!classData || classData.teacherId !== userId) {
        throw {
          status: StatusCodes.FORBIDDEN,
          message: 'You can only update sessions of your own classes',
        };
      }
    }

    const updatedSession = await ScheduleSessionModel.findByIdAndUpdate(
      sessionId,
      { $set: data },
      { new: true, runValidators: true }
    );

    return updatedSession!.toJSON();
  }

  async deleteSession(sessionId: string, userId: string, userRole: UserRole): Promise<void> {
    const session = await ScheduleSessionModel.findById(sessionId);
    if (!session) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: 'Session not found',
      };
    }

    // Kiểm tra quyền
    if (userRole !== UserRole.ADMIN) {
      const classData = await ClassModel.findById(session.classId);
      if (!classData || classData.teacherId !== userId) {
        throw {
          status: StatusCodes.FORBIDDEN,
          message: 'You can only delete sessions of your own classes',
        };
      }
    }

    await ScheduleSessionModel.findByIdAndDelete(sessionId);
  }

  async updateSessionStatus(
    sessionId: string,
    status: SessionStatus,
    userId: string,
    userRole: UserRole
  ): Promise<any> {
    const session = await ScheduleSessionModel.findById(sessionId);
    if (!session) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: 'Session not found',
      };
    }

    // Kiểm tra quyền
    if (userRole !== UserRole.ADMIN) {
      const classData = await ClassModel.findById(session.classId);
      if (!classData || classData.teacherId !== userId) {
        throw {
          status: StatusCodes.FORBIDDEN,
          message: 'You can only update status of sessions in your own classes',
        };
      }
    }

    session.status = status;
    await session.save();

    return session.toJSON();
  }

  async generateSessions(data: IGenerateSessionsDTO): Promise<any[]> {
    // Kiểm tra class tồn tại
    const classData = await ClassModel.findById(data.classId);
    if (!classData) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: 'Class not found',
      };
    }

    const sessions: any[] = [];
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    // Lặp qua từng ngày trong khoảng startDate - endDate
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      const dayOfWeek = date.getDay();

      // Kiểm tra xem ngày này có trong schedule không
      const scheduleItem = data.schedule.find((s) => s.dayOfWeek === dayOfWeek);

      if (scheduleItem) {
        const sessionDate = new Date(date);
        sessionDate.setHours(0, 0, 0, 0);

        // Kiểm tra session đã tồn tại chưa
        const existingSession = await ScheduleSessionModel.findOne({
          classId: data.classId,
          sessionDate: sessionDate,
        });

        if (!existingSession) {
          const session = await ScheduleSessionModel.create({
            classId: data.classId,
            sessionDate: sessionDate,
            startTime: scheduleItem.startTime,
            endTime: scheduleItem.endTime,
            status: SessionStatus.SCHEDULED,
          });

          sessions.push(session.toJSON());
        }
      }
    }

    return sessions;
  }

  async getSessionStats(classId: string): Promise<any> {
    const sessions = await ScheduleSessionModel.find({ classId });

    const stats = {
      total: sessions.length,
      scheduled: 0,
      ongoing: 0,
      completed: 0,
      cancelled: 0,
    };

    sessions.forEach((session) => {
      switch (session.status) {
        case SessionStatus.SCHEDULED:
          stats.scheduled++;
          break;
        case SessionStatus.ONGOING:
          stats.ongoing++;
          break;
        case SessionStatus.COMPLETED:
          stats.completed++;
          break;
        case SessionStatus.CANCELLED:
          stats.cancelled++;
          break;
      }
    });

    return stats;
  }
}
