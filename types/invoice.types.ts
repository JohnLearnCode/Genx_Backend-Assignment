import { Document } from 'mongoose';

export enum InvoiceStatus {
  PENDING = 'pending',
  PAID = 'paid',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled',
  OVERDUE = 'overdue',
}

export enum CourseType {
  ONLINE = 'online',
  OFFLINE = 'offline',
  HYBRID = 'hybrid',
}

export interface IInvoice extends Document {
  enrollmentId: string;
  courseType: CourseType;
  subtotal: number;
  discount: number;
  refund: number;
  total: number;
  promoCode?: string;
  status: InvoiceStatus;
  dueDate?: Date;
  paidAt?: Date;
  refundedAt?: Date;
  paymentMethod?: string;
  transactionId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IInvoiceResponse {
  _id: string;
  enrollmentId: string;
  courseType: CourseType;
  subtotal: number;
  discount: number;
  refund: number;
  total: number;
  promoCode?: string;
  status: InvoiceStatus;
  dueDate?: Date;
  paidAt?: Date;
  refundedAt?: Date;
  paymentMethod?: string;
  transactionId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateInvoiceDTO {
  enrollmentId: string;
  courseType: CourseType;
  subtotal: number;
  discount?: number;
  promoCode?: string;
  dueDate?: Date;
  notes?: string;
}

export interface IUpdateInvoiceDTO {
  courseType?: CourseType;
  subtotal?: number;
  discount?: number;
  promoCode?: string;
  dueDate?: Date;
  notes?: string;
}

export interface IPayInvoiceDTO {
  paymentMethod: string;
  transactionId?: string;
}

export interface IRefundInvoiceDTO {
  refundAmount: number;
  reason?: string;
}

export interface IApplyPromoCodeDTO {
  promoCode: string;
}
