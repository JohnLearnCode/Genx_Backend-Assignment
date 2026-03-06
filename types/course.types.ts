import { Document } from 'mongoose';

export interface ICourse extends Document {
  name: string;
  description: string;
  courseCode: string;
  startDate: Date;
  endDate: Date;
  capacity: number;
  book: string;
  teacherId: string;
  enrolledCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICourseResponse {
  _id: string;
  name: string;
  description: string;
  courseCode: string;
  startDate: Date;
  endDate: Date;
  capacity: number;
  book: string;
  teacherId: string;
  enrolledCount: number;
  isActive: boolean;
  availableSlots: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateCourseDTO {
  name: string;
  description: string;
  courseCode: string;
  startDate: Date;
  endDate: Date;
  capacity: number;
  book: string;
  teacherId?: string;
}

export interface IUpdateCourseDTO {
  name?: string;
  description?: string;
  courseCode?: string;
  startDate?: Date;
  endDate?: Date;
  capacity?: number;
  book?: string;
  isActive?: boolean;
}
