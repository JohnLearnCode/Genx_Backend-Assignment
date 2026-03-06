import Joi from 'joi';

export const createCourseSchema = Joi.object({
  name: Joi.string().min(3).max(200).required().messages({
    'string.empty': 'Course name is required',
    'string.min': 'Course name must be at least 3 characters',
    'string.max': 'Course name must be less than 200 characters',
  }),
  description: Joi.string().min(10).max(2000).required().messages({
    'string.empty': 'Course description is required',
    'string.min': 'Description must be at least 10 characters',
    'string.max': 'Description must be less than 2000 characters',
  }),
  courseCode: Joi.string()
    .pattern(/^[A-Z0-9-]+$/)
    .required()
    .messages({
      'string.empty': 'Course code is required',
      'string.pattern.base': 'Course code must contain only uppercase letters, numbers, and hyphens',
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
  capacity: Joi.number().integer().min(1).max(500).required().messages({
    'number.base': 'Capacity must be a number',
    'number.min': 'Capacity must be at least 1',
    'number.max': 'Capacity must be less than 500',
    'any.required': 'Capacity is required',
  }),
  book: Joi.string().required().messages({
    'string.empty': 'Book name is required',
  }),
});

export const updateCourseSchema = Joi.object({
  name: Joi.string().min(3).max(200).optional(),
  description: Joi.string().min(10).max(2000).optional(),
  courseCode: Joi.string()
    .pattern(/^[A-Z0-9-]+$/)
    .optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  capacity: Joi.number().integer().min(1).max(500).optional(),
  book: Joi.string().optional(),
  isActive: Joi.boolean().optional(),
}).min(1);
