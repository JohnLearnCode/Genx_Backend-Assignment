import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { ErrorCode, IStandardErrorResponse } from '../types/error.types';

/**
 * Convert Joi validation errors to standard format
 */
function formatJoiErrors(joiError: any): IStandardErrorResponse {
  const details = joiError.details.map((detail: any) => ({
    field: detail.path.join('.'),
    reason: detail.message,
    value: detail.context?.value,
  }));

  return {
    code: ErrorCode.VALIDATION_ERROR,
    message: 'Invalid input',
    details,
  };
}

/**
 * Convert Mongoose validation errors to standard format
 */
function formatMongooseErrors(mongooseError: any): IStandardErrorResponse {
  const details = Object.keys(mongooseError.errors).map((key) => ({
    field: key,
    reason: mongooseError.errors[key].message,
    value: mongooseError.errors[key].value,
  }));

  return {
    code: ErrorCode.VALIDATION_ERROR,
    message: 'Validation failed',
    details,
  };
}

/**
 * Convert MongoDB duplicate key error to standard format
 */
function formatDuplicateKeyError(error: any): IStandardErrorResponse {
  const field = Object.keys(error.keyValue)[0];
  const value = error.keyValue[field];

  return {
    code: ErrorCode.DUPLICATE_ENTRY,
    message: 'Duplicate entry',
    details: [
      {
        field,
        reason: `${field} already exists`,
        value,
      },
    ],
  };
}

/**
 * Convert MongoDB cast error to standard format
 */
function formatCastError(error: any): IStandardErrorResponse {
  return {
    code: ErrorCode.INVALID_INPUT,
    message: 'Invalid data format',
    details: [
      {
        field: error.path,
        reason: `Invalid ${error.kind}`,
        value: error.value,
      },
    ],
  };
}

/**
 * Format error response
 */
function formatErrorResponse(
  err: any,
  req: Request
): IStandardErrorResponse {
  // If it's already an AppError, use its data
  if (err instanceof AppError) {
    return {
      code: err.code,
      message: err.message,
      details: err.details,
      timestamp: new Date().toISOString(),
      path: req.path,
    };
  }

  // Joi validation error
  if (err.isJoi || err.name === 'ValidationError' && err.details) {
    return {
      ...formatJoiErrors(err),
      timestamp: new Date().toISOString(),
      path: req.path,
    };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError' && err.errors) {
    return {
      ...formatMongooseErrors(err),
      timestamp: new Date().toISOString(),
      path: req.path,
    };
  }

  // MongoDB duplicate key error (E11000)
  if (err.code === 11000) {
    return {
      ...formatDuplicateKeyError(err),
      timestamp: new Date().toISOString(),
      path: req.path,
    };
  }

  // MongoDB cast error
  if (err.name === 'CastError') {
    return {
      ...formatCastError(err),
      timestamp: new Date().toISOString(),
      path: req.path,
    };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return {
      code: ErrorCode.INVALID_TOKEN,
      message: 'Invalid token',
      timestamp: new Date().toISOString(),
      path: req.path,
    };
  }

  if (err.name === 'TokenExpiredError') {
    return {
      code: ErrorCode.TOKEN_EXPIRED,
      message: 'Token expired',
      timestamp: new Date().toISOString(),
      path: req.path,
    };
  }

  // Default internal server error (hide details in production)
  const isProduction = process.env.NODE_ENV === 'production';
  
  return {
    code: ErrorCode.INTERNAL_SERVER_ERROR,
    message: isProduction 
      ? 'Internal server error' 
      : err.message || 'Internal server error',
    timestamp: new Date().toISOString(),
    path: req.path,
  };
}

/**
 * Centralized error handling middleware
 * Should be the last middleware in the chain
 */
export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Log error for debugging
  if (process.env.NODE_ENV === 'development') {
    console.error('\n' + '='.repeat(80));
    console.error('🚨 ERROR CAUGHT BY ERROR HANDLER');
    console.error('='.repeat(80));
    console.error('Path:', req.method, req.path);
    console.error('Error:', err);
    if (err.stack) {
      console.error('Stack:', err.stack);
    }
    console.error('='.repeat(80) + '\n');
  } else {
    // In production, log minimal error info
    console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);
  }

  // Get status code
  let statusCode = err.statusCode || err.status || 500;
  
  // Some libraries use 'status' instead of 'statusCode'
  if (err.name === 'ValidationError') statusCode = 400;
  if (err.name === 'UnauthorizedError') statusCode = 401;
  if (err.code === 11000) statusCode = 409;

  // Format error response
  const errorResponse = formatErrorResponse(err, req);

  // Send response
  res.status(statusCode).json(errorResponse);
}

/**
 * Handle 404 errors (route not found)
 */
export function notFoundHandler(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const error: IStandardErrorResponse = {
    code: ErrorCode.NOT_FOUND,
    message: 'Route not found',
    details: [
      {
        field: 'path',
        reason: `Cannot ${req.method} ${req.path}`,
      },
    ],
    timestamp: new Date().toISOString(),
    path: req.path,
  };

  res.status(404).json(error);
}

/**
 * Handle uncaught exceptions
 */
export function handleUncaughtException(): void {
  process.on('uncaughtException', (error: Error) => {
    console.error('💥 UNCAUGHT EXCEPTION! Shutting down...');
    console.error(error.name, error.message);
    console.error(error.stack);
    process.exit(1);
  });
}

/**
 * Handle unhandled promise rejections
 */
export function handleUnhandledRejection(): void {
  process.on('unhandledRejection', (reason: any) => {
    console.error('💥 UNHANDLED REJECTION! Shutting down...');
    console.error(reason);
    process.exit(1);
  });
}
