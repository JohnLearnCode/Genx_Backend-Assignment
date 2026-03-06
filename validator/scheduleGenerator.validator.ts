import Joi from 'joi';

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const generateScheduleSchema = Joi.object({
  startDate: Joi.string()
    .pattern(dateRegex)
    .required()
    .messages({
      'string.empty': 'Start date is required',
      'string.pattern.base': 'Start date must be in YYYY-MM-DD format',
    }),
  totalClasses: Joi.number()
    .integer()
    .min(1)
    .required()
    .messages({
      'number.base': 'Total classes must be a number',
      'number.integer': 'Total classes must be an integer',
      'number.min': 'Total classes must be at least 1',
      'any.required': 'Total classes is required',
    }),
  classWeekdays: Joi.array()
    .items(Joi.number().integer().min(0).max(6))
    .min(1)
    .required()
    .messages({
      'array.base': 'Class weekdays must be an array',
      'array.min': 'Class weekdays must contain at least one day',
      'any.required': 'Class weekdays is required',
      'number.min': 'Weekday must be between 0 (Monday) and 6 (Sunday)',
      'number.max': 'Weekday must be between 0 (Monday) and 6 (Sunday)',
    }),
  holidays: Joi.array()
    .items(Joi.string().pattern(dateRegex))
    .default([])
    .messages({
      'array.base': 'Holidays must be an array',
      'string.pattern.base': 'Holiday dates must be in YYYY-MM-DD format',
    }),
  holidayRanges: Joi.array()
    .items(
      Joi.array()
        .length(2)
        .items(Joi.string().pattern(dateRegex))
    )
    .default([])
    .messages({
      'array.base': 'Holiday ranges must be an array',
      'array.length': 'Each holiday range must contain exactly 2 dates [start, end]',
      'string.pattern.base': 'Holiday range dates must be in YYYY-MM-DD format',
    }),
});
