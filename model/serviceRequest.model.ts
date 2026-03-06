import mongoose, { Schema } from 'mongoose';
import { IServiceRequest, ServiceRequestStatus } from '../types/serviceRequest.types';

const serviceRequestSchema = new Schema<IServiceRequest>(
  {
    customerId: {
      type: String,
      required: [true, 'Customer ID is required'],
      ref: 'User',
    },
    staffId: {
      type: String,
      ref: 'User',
    },
    serviceName: {
      type: String,
      required: [true, 'Service name is required'],
      trim: true,
      minlength: [3, 'Service name must be at least 3 characters'],
      maxlength: [200, 'Service name must be less than 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
      maxlength: [2000, 'Description must be less than 2000 characters'],
    },
    status: {
      type: String,
      enum: Object.values(ServiceRequestStatus),
      default: ServiceRequestStatus.PENDING,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    attachments: {
      type: [String],
      default: [],
    },
    response: {
      type: String,
      trim: true,
      maxlength: [2000, 'Response must be less than 2000 characters'],
    },
    completedAt: {
      type: Date,
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

// Virtual field: Is pending
serviceRequestSchema.virtual('isPending').get(function (this: IServiceRequest) {
  return this.status === ServiceRequestStatus.PENDING;
});

// Virtual field: Is assigned
serviceRequestSchema.virtual('isAssigned').get(function (this: IServiceRequest) {
  return !!this.staffId && this.status !== ServiceRequestStatus.PENDING;
});

// Virtual field: Is closed (completed, rejected, or cancelled)
serviceRequestSchema.virtual('isClosed').get(function (this: IServiceRequest) {
  return [
    ServiceRequestStatus.COMPLETED,
    ServiceRequestStatus.REJECTED,
    ServiceRequestStatus.CANCELLED,
  ].includes(this.status);
});

// Virtual field: Duration (in days)
serviceRequestSchema.virtual('durationInDays').get(function (this: IServiceRequest) {
  if (!this.completedAt) return null;
  const diff = this.completedAt.getTime() - this.createdAt.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
});

// Automatically set completedAt when status changes to completed
serviceRequestSchema.pre('save', function (next) {
  if (this.isModified('status') && this.status === ServiceRequestStatus.COMPLETED && !this.completedAt) {
    this.completedAt = new Date();
  }
  next();
});

// Index cho tìm kiếm nhanh
serviceRequestSchema.index({ customerId: 1 });
serviceRequestSchema.index({ staffId: 1 });
serviceRequestSchema.index({ status: 1 });
serviceRequestSchema.index({ priority: 1 });
serviceRequestSchema.index({ createdAt: -1 });
serviceRequestSchema.index({ customerId: 1, status: 1 });
serviceRequestSchema.index({ staffId: 1, status: 1 });

export const ServiceRequestModel = mongoose.model<IServiceRequest>(
  'ServiceRequest',
  serviceRequestSchema
);
