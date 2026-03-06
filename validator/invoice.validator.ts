import Joi from 'joi';
import { InvoiceStatus, CourseType } from '../types/invoice.types';

export const createInvoiceSchema = Joi.object({
  enrollmentId: Joi.string().required().messages({
    'string.empty': 'Enrollment ID is required',
  }),
  courseType: Joi.string()
    .valid(...Object.values(CourseType))
    .required()
    .messages({
      'string.empty': 'Course type is required',
      'any.only': 'Course type must be online, offline, or hybrid',
    }),
  subtotal: Joi.number().min(0).required().messages({
    'number.base': 'Subtotal must be a number',
    'number.min': 'Subtotal cannot be negative',
    'any.required': 'Subtotal is required',
  }),
  discount: Joi.number().min(0).optional().messages({
    'number.min': 'Discount cannot be negative',
  }),
  promoCode: Joi.string().uppercase().optional().allow(''),
  dueDate: Joi.date().iso().optional(),
  notes: Joi.string().max(500).optional().allow(''),
});

export const updateInvoiceSchema = Joi.object({
  courseType: Joi.string()
    .valid(...Object.values(CourseType))
    .optional(),
  subtotal: Joi.number().min(0).optional(),
  discount: Joi.number().min(0).optional(),
  promoCode: Joi.string().uppercase().optional().allow(''),
  dueDate: Joi.date().iso().optional(),
  notes: Joi.string().max(500).optional().allow(''),
}).min(1);

export const payInvoiceSchema = Joi.object({
  paymentMethod: Joi.string().required().messages({
    'string.empty': 'Payment method is required',
  }),
  transactionId: Joi.string().optional().allow(''),
});

export const refundInvoiceSchema = Joi.object({
  refundAmount: Joi.number().min(0).required().messages({
    'number.base': 'Refund amount must be a number',
    'number.min': 'Refund amount cannot be negative',
    'any.required': 'Refund amount is required',
  }),
  reason: Joi.string().max(500).optional().allow(''),
});

export const applyPromoCodeSchema = Joi.object({
  promoCode: Joi.string().uppercase().required().messages({
    'string.empty': 'Promo code is required',
  }),
});
