import mongoose, { Schema } from 'mongoose';
import { IInvoice, InvoiceStatus, CourseType } from '../types/invoice.types';

const invoiceSchema = new Schema<IInvoice>(
  {
    enrollmentId: {
      type: String,
      required: [true, 'Enrollment ID is required'],
      unique: true,
      ref: 'Enrollment',
    },
    courseType: {
      type: String,
      enum: Object.values(CourseType),
      required: [true, 'Course type is required'],
    },
    subtotal: {
      type: Number,
      required: [true, 'Subtotal is required'],
      min: [0, 'Subtotal cannot be negative'],
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative'],
    },
    refund: {
      type: Number,
      default: 0,
      min: [0, 'Refund cannot be negative'],
    },
    total: {
      type: Number,
      required: [true, 'Total is required'],
      min: [0, 'Total cannot be negative'],
    },
    promoCode: {
      type: String,
      uppercase: true,
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(InvoiceStatus),
      default: InvoiceStatus.PENDING,
    },
    dueDate: {
      type: Date,
    },
    paidAt: {
      type: Date,
    },
    refundedAt: {
      type: Date,
    },
    paymentMethod: {
      type: String,
      trim: true,
    },
    transactionId: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes must be less than 500 characters'],
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
    },
  }
);

// Virtual field: Is paid
invoiceSchema.virtual('isPaid').get(function (this: IInvoice) {
  return this.status === InvoiceStatus.PAID;
});

// Virtual field: Is pending
invoiceSchema.virtual('isPending').get(function (this: IInvoice) {
  return this.status === InvoiceStatus.PENDING;
});

// Virtual field: Is overdue
invoiceSchema.virtual('isOverdue').get(function (this: IInvoice) {
  if (!this.dueDate || this.status !== InvoiceStatus.PENDING) return false;
  return new Date() > this.dueDate;
});

// Virtual field: Amount due
invoiceSchema.virtual('amountDue').get(function (this: IInvoice) {
  if (this.status === InvoiceStatus.PAID) return 0;
  return this.total;
});

// Virtual field: Days until due
invoiceSchema.virtual('daysUntilDue').get(function (this: IInvoice) {
  if (!this.dueDate) return null;
  const diff = this.dueDate.getTime() - new Date().getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

// Automatically calculate total before save
invoiceSchema.pre('save', function (next) {
  // total = subtotal - discount + refund
  this.total = this.subtotal - this.discount + this.refund;
  
  // Ensure total is not negative
  if (this.total < 0) {
    this.total = 0;
  }
  
  next();
});

// Automatically set paidAt when status changes to paid
invoiceSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    if (this.status === InvoiceStatus.PAID && !this.paidAt) {
      this.paidAt = new Date();
    }
    if (this.status === InvoiceStatus.REFUNDED && !this.refundedAt) {
      this.refundedAt = new Date();
    }
  }
  next();
});

// Index cho tìm kiếm nhanh
invoiceSchema.index({ enrollmentId: 1 });
invoiceSchema.index({ status: 1 });
invoiceSchema.index({ dueDate: 1 });
invoiceSchema.index({ createdAt: -1 });
invoiceSchema.index({ status: 1, dueDate: 1 });

export const InvoiceModel = mongoose.model<IInvoice>('Invoice', invoiceSchema);
