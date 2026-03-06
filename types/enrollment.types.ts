import { Document } from 'mongoose';

export enum EnrollmentStatus {
  PENDING = 'pending',
  ENROLLED = 'enrolled',
  COMPLETED = 'completed',
  DROPPED = 'dropped',
  REJECTED = 'rejected',
}

export interface IEnrollment extends Document {
  studentId: string;
  classId: string;
  status: EnrollmentStatus;
  enrollAt: Date;
  completedAt?: Date;
  droppedAt?: Date;
  notes?: string;
  grade?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IEnrollmentResponse {
  _id: string;
  studentId: string;
  classId: string;
  status: EnrollmentStatus;
  enrollAt: Date;
  completedAt?: Date;
  droppedAt?: Date;
  notes?: string;
  grade?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateEnrollmentDTO {
  classId: string;
  notes?: string;
}

export interface IUpdateEnrollmentDTO {
  status?: EnrollmentStatus;
  notes?: string;
  grade?: string;
}

export interface IEnrollStudentDTO {
  studentId: string;
  classId: string;
  notes?: string;
}
