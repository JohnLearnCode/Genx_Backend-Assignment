import { Document } from 'mongoose';

export enum ServiceRequestStatus {
  PENDING = 'pending',
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

export interface IServiceRequest extends Document {
  customerId: string;
  staffId?: string;
  serviceName: string;
  description: string;
  status: ServiceRequestStatus;
  priority?: 'low' | 'medium' | 'high';
  attachments?: string[];
  response?: string;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IServiceRequestResponse {
  _id: string;
  customerId: string;
  staffId?: string;
  serviceName: string;
  description: string;
  status: ServiceRequestStatus;
  priority?: 'low' | 'medium' | 'high';
  attachments?: string[];
  response?: string;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateServiceRequestDTO {
  serviceName: string;
  description: string;
  priority?: 'low' | 'medium' | 'high';
  attachments?: string[];
}

export interface IUpdateServiceRequestDTO {
  serviceName?: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  attachments?: string[];
  response?: string;
}

export interface IAssignStaffDTO {
  staffId: string;
}

export interface IUpdateStatusDTO {
  status: ServiceRequestStatus;
  response?: string;
}
