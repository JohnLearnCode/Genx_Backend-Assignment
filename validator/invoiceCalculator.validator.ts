import Joi from 'joi';
import { CoursePaymentType, PromoCodeType } from '../types/invoiceCalculator.types';

export const calcInvoiceSchema = Joi.object({
  courseType: Joi.string()
    .valid(...Object.values(CoursePaymentType))
    .required()
    .messages({
      'string.empty': 'Course type is required',
      'any.only': 'Course type must be MONTHLY or FULL_COURSE',
    }),
  basePrice: Joi.number().min(0).required().messages({
    'number.base': 'Base price must be a number',
    'number.min': 'Base price cannot be negative',
    'any.required': 'Base price is required',
  }),
  months: Joi.number().integer().min(1).max(3).required().messages({
    'number.base': 'Months must be a number',
    'number.integer': 'Months must be an integer',
    'number.min': 'Months must be between 1 and 3',
    'number.max': 'Months must be between 1 and 3',
    'any.required': 'Months is required',
  }),
  promoCode: Joi.string()
    .valid(...Object.values(PromoCodeType))
    .allow(null)
    .default(null)
    .messages({
      'any.only': 'Promo code must be SAVE10, FLAT50K, or null',
    }),
  canceledClasses: Joi.number().integer().min(0).required().messages({
    'number.base': 'Canceled classes must be a number',
    'number.integer': 'Canceled classes must be an integer',
    'number.min': 'Canceled classes cannot be negative',
    'any.required': 'Canceled classes is required',
  }),
  refundPerClass: Joi.number().min(0).required().messages({
    'number.base': 'Refund per class must be a number',
    'number.min': 'Refund per class cannot be negative',
    'any.required': 'Refund per class is required',
  }),
});
