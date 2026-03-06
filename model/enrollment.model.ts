import mongoose, { Schema } from 'mongoose';
import { IEnrollment, EnrollmentStatus } from '../types/enrollment.types';

const enrollmentSchema = new Schema<IEnrollment>(
  {
    studentId: {
      type: String,
      required: [true, 'Student ID is required'],
      ref: 'User',
    },
    classId: {
      type: String,
      required: [true, 'Class ID is required'],
      ref: 'Class',
    },
    status: {
      type: String,
      enum: Object.values(EnrollmentStatus),
      default: EnrollmentStatus.PENDING,
    },
    enrollAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
    droppedAt: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes must be less than 500 characters'],
    },
    grade: {
      type: String,
      trim: true,
      maxlength: [10, 'Grade must be less than 10 characters'],
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

// Virtual field: Is active
enrollmentSchema.virtual('isActive').get(function (this: IEnrollment) {
  return this.status === EnrollmentStatus.ENROLLED;
});

// Virtual field: Is pending
enrollmentSchema.virtual('isPending').get(function (this: IEnrollment) {
  return this.status === EnrollmentStatus.PENDING;
});

// Virtual field: Is completed
enrollmentSchema.virtual('isCompleted').get(function (this: IEnrollment) {
  return this.status === EnrollmentStatus.COMPLETED;
});

// Virtual field: Duration (in days from enroll to complete)
enrollmentSchema.virtual('durationInDays').get(function (this: IEnrollment) {
  if (!this.completedAt) return null;
  const diff = this.completedAt.getTime() - this.enrollAt.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
});

// Automatically set completedAt when status changes to completed
enrollmentSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    if (this.status === EnrollmentStatus.COMPLETED && !this.completedAt) {
      this.completedAt = new Date();
    }
    if (this.status === EnrollmentStatus.DROPPED && !this.droppedAt) {
      this.droppedAt = new Date();
    }
  }
  next();
});

// Compound index để tránh duplicate enrollment
enrollmentSchema.index({ studentId: 1, classId: 1 }, { unique: true });

// Index cho tìm kiếm nhanh
enrollmentSchema.index({ studentId: 1 });
enrollmentSchema.index({ classId: 1 });
enrollmentSchema.index({ status: 1 });
enrollmentSchema.index({ enrollAt: 1 });
enrollmentSchema.index({ studentId: 1, status: 1 });
enrollmentSchema.index({ classId: 1, status: 1 });

export const EnrollmentModel = mongoose.model<IEnrollment>('Enrollment', enrollmentSchema);
