import Joi from 'joi';
import { ServiceRequestStatus } from '../types/serviceRequest.types';

export const createServiceRequestSchema = Joi.object({
  serviceName: Joi.string().min(3).max(200).required().messages({
    'string.empty': 'Service name is required',
    'string.min': 'Service name must be at least 3 characters',
    'string.max': 'Service name must be less than 200 characters',
  }),
  description: Joi.string().min(10).max(2000).required().messages({
    'string.empty': 'Description is required',
    'string.min': 'Description must be at least 10 characters',
    'string.max': 'Description must be less than 2000 characters',
  }),
  priority: Joi.string().valid('low', 'medium', 'high').optional().messages({
    'any.only': 'Priority must be low, medium, or high',
  }),
  attachments: Joi.array().items(Joi.string().uri()).optional(),
});

export const updateServiceRequestSchema = Joi.object({
  serviceName: Joi.string().min(3).max(200).optional(),
  description: Joi.string().min(10).max(2000).optional(),
  priority: Joi.string().valid('low', 'medium', 'high').optional(),
  attachments: Joi.array().items(Joi.string().uri()).optional(),
  response: Joi.string().max(2000).optional().allow(''),
}).min(1);

export const assignStaffSchema = Joi.object({
  staffId: Joi.string().required().messages({
    'string.empty': 'Staff ID is required',
  }),
});

export const updateStatusSchema = Joi.object({
  status: Joi.string()
    .valid(...Object.values(ServiceRequestStatus))
    .required()
    .messages({
      'string.empty': 'Status is required',
      'any.only': 'Invalid status value',
    }),
  response: Joi.string().max(2000).optional().allow(''),
});
