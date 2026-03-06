import mongoose, { Schema } from 'mongoose';
import { IScheduleSession, SessionStatus } from '../types/scheduleSession.types';

const scheduleSessionSchema = new Schema<IScheduleSession>(
  {
    classId: {
      type: String,
      required: [true, 'Class ID is required'],
      ref: 'Class',
    },
    sessionDate: {
      type: Date,
      required: [true, 'Session date is required'],
    },
    status: {
      type: String,
      enum: Object.values(SessionStatus),
      default: SessionStatus.SCHEDULED,
    },
    startTime: {
      type: String,
      trim: true,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format. Use HH:mm'],
    },
    endTime: {
      type: String,
      trim: true,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format. Use HH:mm'],
    },
    topic: {
      type: String,
      trim: true,
      maxlength: [200, 'Topic must be less than 200 characters'],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes must be less than 1000 characters'],
    },
    attendanceCount: {
      type: Number,
      default: 0,
      min: [0, 'Attendance count cannot be negative'],
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

// Virtual field: Is past
scheduleSessionSchema.virtual('isPast').get(function (this: IScheduleSession) {
  return new Date() > this.sessionDate;
});

// Virtual field: Is today
scheduleSessionSchema.virtual('isToday').get(function (this: IScheduleSession) {
  const today = new Date();
  const sessionDate = new Date(this.sessionDate);
  return (
    today.getDate() === sessionDate.getDate() &&
    today.getMonth() === sessionDate.getMonth() &&
    today.getFullYear() === sessionDate.getFullYear()
  );
});

// Virtual field: Is upcoming
scheduleSessionSchema.virtual('isUpcoming').get(function (this: IScheduleSession) {
  return new Date() < this.sessionDate && this.status === SessionStatus.SCHEDULED;
});

// Compound index để tránh duplicate session
scheduleSessionSchema.index({ classId: 1, sessionDate: 1 }, { unique: true });

// Index cho tìm kiếm nhanh
scheduleSessionSchema.index({ classId: 1 });
scheduleSessionSchema.index({ sessionDate: 1 });
scheduleSessionSchema.index({ status: 1 });
scheduleSessionSchema.index({ classId: 1, status: 1 });

export const ScheduleSessionModel = mongoose.model<IScheduleSession>(
  'ScheduleSession',
  scheduleSessionSchema
);
