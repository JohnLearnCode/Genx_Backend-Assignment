import { Document } from 'mongoose';

export enum SessionStatus {
  SCHEDULED = 'scheduled',
  ONGOING = 'ongoing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface IScheduleSession extends Document {
  classId: string;
  sessionDate: Date;
  status: SessionStatus;
  startTime?: string;
  endTime?: string;
  topic?: string;
  notes?: string;
  attendanceCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IScheduleSessionResponse {
  _id: string;
  classId: string;
  sessionDate: Date;
  status: SessionStatus;
  startTime?: string;
  endTime?: string;
  topic?: string;
  notes?: string;
  attendanceCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateScheduleSessionDTO {
  classId: string;
  sessionDate: Date;
  status?: SessionStatus;
  startTime?: string;
  endTime?: string;
  topic?: string;
  notes?: string;
}

export interface IUpdateScheduleSessionDTO {
  sessionDate?: Date;
  status?: SessionStatus;
  startTime?: string;
  endTime?: string;
  topic?: string;
  notes?: string;
  attendanceCount?: number;
}

export interface IGenerateSessionsDTO {
  classId: string;
  startDate: Date;
  endDate: Date;
  schedule: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }[];
}
