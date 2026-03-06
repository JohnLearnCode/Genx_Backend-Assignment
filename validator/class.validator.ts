import Joi from 'joi';

const scheduleItemSchema = Joi.object({
  dayOfWeek: Joi.number().integer().min(0).max(6).required().messages({
    'number.min': 'Day of week must be between 0 (Sunday) and 6 (Saturday)',
    'number.max': 'Day of week must be between 0 (Sunday) and 6 (Saturday)',
    'any.required': 'Day of week is required',
  }),
  startTime: Joi.string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .required()
    .messages({
      'string.pattern.base': 'Start time must be in HH:mm format',
      'any.required': 'Start time is required',
    }),
  endTime: Joi.string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .required()
    .messages({
      'string.pattern.base': 'End time must be in HH:mm format',
      'any.required': 'End time is required',
    }),
});

export const createClassSchema = Joi.object({
  courseId: Joi.string().required().messages({
    'string.empty': 'Course ID is required',
  }),
  supportStaffId: Joi.string().optional().allow(''),
  meetLink: Joi.string().uri().required().messages({
    'string.empty': 'Meet link is required',
    'string.uri': 'Meet link must be a valid URL',
  }),
  capacity: Joi.number().integer().min(1).max(500).required().messages({
    'number.base': 'Capacity must be a number',
    'number.min': 'Capacity must be at least 1',
    'number.max': 'Capacity must be less than 500',
    'any.required': 'Capacity is required',
  }),
  schedule: Joi.array().items(scheduleItemSchema).optional(),
});

export const updateClassSchema = Joi.object({
  supportStaffId: Joi.string().optional().allow('', null),
  meetLink: Joi.string().uri().optional(),
  capacity: Joi.number().integer().min(1).max(500).optional(),
  schedule: Joi.array().items(scheduleItemSchema).optional(),
  isActive: Joi.boolean().optional(),
}).min(1);
