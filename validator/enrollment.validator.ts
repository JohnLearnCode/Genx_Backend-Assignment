import Joi from 'joi';
import { EnrollmentStatus } from '../types/enrollment.types';

export const createEnrollmentSchema = Joi.object({
  classId: Joi.string().required().messages({
    'string.empty': 'Class ID is required',
  }),
  notes: Joi.string().max(500).optional().allow(''),
});

export const enrollStudentSchema = Joi.object({
  studentId: Joi.string().required().messages({
    'string.empty': 'Student ID is required',
  }),
  classId: Joi.string().required().messages({
    'string.empty': 'Class ID is required',
  }),
  notes: Joi.string().max(500).optional().allow(''),
});

export const updateEnrollmentSchema = Joi.object({
  status: Joi.string()
    .valid(...Object.values(EnrollmentStatus))
    .optional()
    .messages({
      'any.only': 'Invalid status value',
    }),
  notes: Joi.string().max(500).optional().allow(''),
  grade: Joi.string().max(10).optional().allow(''),
}).min(1);
