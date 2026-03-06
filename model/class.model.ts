import mongoose, { Schema } from 'mongoose';
import { IClass } from '../types/class.types';

const scheduleSchema = new Schema(
  {
    dayOfWeek: {
      type: Number,
      required: true,
      min: 0,
      max: 6,
    },
    startTime: {
      type: String,
      required: true,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format. Use HH:mm'],
    },
    endTime: {
      type: String,
      required: true,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format. Use HH:mm'],
    },
  },
  { _id: false }
);

const classSchema = new Schema<IClass>(
  {
    courseId: {
      type: String,
      required: [true, 'Course ID is required'],
      ref: 'Course',
    },
    teacherId: {
      type: String,
      required: [true, 'Teacher ID is required'],
      ref: 'User',
    },
    supportStaffId: {
      type: String,
      ref: 'User',
    },
    meetLink: {
      type: String,
      required: [true, 'Meet link is required'],
      trim: true,
      match: [
        /^https?:\/\/.+/,
        'Meet link must be a valid URL',
      ],
    },
    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: [1, 'Capacity must be at least 1'],
      max: [500, 'Capacity must be less than 500'],
    },
    enrolledCount: {
      type: Number,
      default: 0,
      min: [0, 'Enrolled count cannot be negative'],
    },
    schedule: {
      type: [scheduleSchema],
      default: [],
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
classSchema.virtual('availableSlots').get(function (this: IClass) {
  return this.capacity - this.enrolledCount;
});

// Virtual field: Is full
classSchema.virtual('isFull').get(function (this: IClass) {
  return this.enrolledCount >= this.capacity;
});

// Validate capacity không được nhỏ hơn enrolledCount
classSchema.pre('save', function (next) {
  if (this.capacity < this.enrolledCount) {
    next(new Error('Capacity cannot be less than enrolled count'));
  } else {
    next();
  }
});

// Index cho tìm kiếm nhanh
classSchema.index({ courseId: 1 });
classSchema.index({ teacherId: 1 });
classSchema.index({ supportStaffId: 1 });
classSchema.index({ isActive: 1 });
classSchema.index({ courseId: 1, teacherId: 1 });

export const ClassModel = mongoose.model<IClass>('Class', classSchema);
