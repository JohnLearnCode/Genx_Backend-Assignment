import { Document } from 'mongoose';

export interface IClass extends Document {
  courseId: string;
  teacherId: string;
  supportStaffId?: string;
  meetLink: string;
  capacity: number;
  enrolledCount: number;
  schedule?: {
    dayOfWeek: number; // 0-6 (Sunday-Saturday)
    startTime: string; // HH:mm format
    endTime: string; // HH:mm format
  }[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IClassResponse {
  _id: string;
  courseId: string;
  teacherId: string;
  supportStaffId?: string;
  meetLink: string;
  capacity: number;
  enrolledCount: number;
  availableSlots: number;
  schedule?: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateClassDTO {
  courseId: string;
  teacherId?: string;
  supportStaffId?: string;
  meetLink: string;
  capacity: number;
  schedule?: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }[];
}

export interface IUpdateClassDTO {
  supportStaffId?: string;
  meetLink?: string;
  capacity?: number;
  schedule?: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }[];
  isActive?: boolean;
}
