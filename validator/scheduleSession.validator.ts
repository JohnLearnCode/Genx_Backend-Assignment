import Joi from 'joi';
import { SessionStatus } from '../types/scheduleSession.types';

export const createScheduleSessionSchema = Joi.object({
  classId: Joi.string().required().messages({
    'string.empty': 'Class ID is required',
  }),
  sessionDate: Joi.date().iso().required().messages({
    'date.base': 'Session date must be a valid date',
    'any.required': 'Session date is required',
  }),
  status: Joi.string()
    .valid(...Object.values(SessionStatus))
    .optional()
    .messages({
      'any.only': 'Status must be scheduled, ongoing, completed, or cancelled',
    }),
  startTime: Joi.string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .optional()
    .allow('')
    .messages({
      'string.pattern.base': 'Start time must be in HH:mm format',
    }),
  endTime: Joi.string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .optional()
    .allow('')
    .messages({
      'string.pattern.base': 'End time must be in HH:mm format',
    }),
  topic: Joi.string().max(200).optional().allow(''),
  notes: Joi.string().max(1000).optional().allow(''),
});

export const updateScheduleSessionSchema = Joi.object({
  sessionDate: Joi.date().iso().optional(),
  status: Joi.string()
    .valid(...Object.values(SessionStatus))
    .optional(),
  startTime: Joi.string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .optional()
    .allow(''),
  endTime: Joi.string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .optional()
    .allow(''),
  topic: Joi.string().max(200).optional().allow(''),
  notes: Joi.string().max(1000).optional().allow(''),
  attendanceCount: Joi.number().integer().min(0).optional(),
}).min(1);

const scheduleItemSchema = Joi.object({
  dayOfWeek: Joi.number().integer().min(0).max(6).required(),
  startTime: Joi.string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .required(),
  endTime: Joi.string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .required(),
});

export const generateSessionsSchema = Joi.object({
  classId: Joi.string().required().messages({
    'string.empty': 'Class ID is required',
  }),
  startDate: Joi.date().iso().required().messages({
    'date.base': 'Start date must be a valid date',
    'any.required': 'Start date is required',
  }),
  endDate: Joi.date().iso().greater(Joi.ref('startDate')).required().messages({
    'date.base': 'End date must be a valid date',
    'date.greater': 'End date must be after start date',
    'any.required': 'End date is required',
  }),
  schedule: Joi.array().items(scheduleItemSchema).min(1).required().messages({
    'array.min': 'At least one schedule item is required',
    'any.required': 'Schedule is required',
  }),
});
