import mongoose, { Schema } from 'mongoose';
import { ICourse } from '../types/course.types';

const courseSchema = new Schema<ICourse>(
  {
    name: {
      type: String,
      required: [true, 'Course name is required'],
      trim: true,
      minlength: [3, 'Course name must be at least 3 characters'],
      maxlength: [200, 'Course name must be less than 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Course description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
      maxlength: [2000, 'Description must be less than 2000 characters'],
    },
    courseCode: {
      type: String,
      required: [true, 'Course code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      match: [/^[A-Z0-9-]+$/, 'Course code must contain only uppercase letters, numbers, and hyphens'],
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
      validate: {
        validator: function (this: ICourse, value: Date) {
          return value > this.startDate;
        },
        message: 'End date must be after start date',
      },
    },
    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: [1, 'Capacity must be at least 1'],
      max: [500, 'Capacity must be less than 500'],
    },
    book: {
      type: String,
      required: [true, 'Book name is required'],
      trim: true,
    },
    teacherId: {
      type: String,
      required: [true, 'Teacher ID is required'],
      ref: 'User',
    },
    enrolledCount: {
      type: Number,
      default: 0,
      min: [0, 'Enrolled count cannot be negative'],
    },
    isActive: {
      type: Boolean,
      default: true,
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

// Virtual field: Available slots
courseSchema.virtual('availableSlots').get(function (this: ICourse) {
  return this.capacity - this.enrolledCount;
});

// Virtual field: Is full
courseSchema.virtual('isFull').get(function (this: ICourse) {
  return this.enrolledCount >= this.capacity;
});

// Virtual field: Is upcoming
courseSchema.virtual('isUpcoming').get(function (this: ICourse) {
  return new Date() < this.startDate;
});

// Virtual field: Is ongoing
courseSchema.virtual('isOngoing').get(function (this: ICourse) {
  const now = new Date();
  return now >= this.startDate && now <= this.endDate;
});

// Virtual field: Is completed
courseSchema.virtual('isCompleted').get(function (this: ICourse) {
  return new Date() > this.endDate;
});

// Index cho tìm kiếm nhanh
courseSchema.index({ courseCode: 1 });
courseSchema.index({ teacherId: 1 });
courseSchema.index({ startDate: 1 });
courseSchema.index({ isActive: 1 });
courseSchema.index({ name: 'text', description: 'text' });

export const CourseModel = mongoose.model<ICourse>('Course', courseSchema);
