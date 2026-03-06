import { ErrorCode, IErrorDetail } from '../types/error.types';

/**
 * Custom Application Error Class
 * Used for operational errors (known, expected errors)
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode;
  public readonly details?: IErrorDetail[];
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number,
    code: ErrorCode,
    details?: IErrorDetail[],
    isOperational: boolean = true
  ) {
    super(message);
    
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = isOperational;

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
    
    // Set the prototype explicitly
    Object.setPrototypeOf(this, AppError.prototype);
  }

  /**
   * Create a validation error
   */
  static validation(message: string, details?: IErrorDetail[]): AppError {
    return new AppError(message, 400, ErrorCode.VALIDATION_ERROR, details);
  }

  /**
   * Create an unauthorized error
   */
  static unauthorized(message: string = 'Unauthorized'): AppError {
    return new AppError(message, 401, ErrorCode.UNAUTHORIZED);
  }

  /**
   * Create an invalid token error
   */
  static invalidToken(message: string = 'Invalid or expired token'): AppError {
    return new AppError(message, 401, ErrorCode.INVALID_TOKEN);
  }

  /**
   * Create an invalid credentials error
   */
  static invalidCredentials(message: string = 'Invalid credentials'): AppError {
    return new AppError(message, 401, ErrorCode.INVALID_CREDENTIALS);
  }

  /**
   * Create a forbidden error
   */
  static forbidden(message: string = 'Forbidden'): AppError {
    return new AppError(message, 403, ErrorCode.FORBIDDEN);
  }

  /**
   * Create an insufficient permissions error
   */
  static insufficientPermissions(
    message: string = 'You do not have permission to access this resource'
  ): AppError {
    return new AppError(message, 403, ErrorCode.INSUFFICIENT_PERMISSIONS);
  }

  /**
   * Create a not found error
   */
  static notFound(resource: string = 'Resource'): AppError {
    return new AppError(`${resource} not found`, 404, ErrorCode.NOT_FOUND);
  }

  /**
   * Create a conflict error
   */
  static conflict(message: string, details?: IErrorDetail[]): AppError {
    return new AppError(message, 409, ErrorCode.CONFLICT, details);
  }

  /**
   * Create an already exists error
   */
  static alreadyExists(resource: string): AppError {
    return new AppError(`${resource} already exists`, 409, ErrorCode.ALREADY_EXISTS);
  }

  /**
   * Create a business rule violation error
   */
  static businessRuleViolation(message: string, details?: IErrorDetail[]): AppError {
    return new AppError(message, 422, ErrorCode.BUSINESS_RULE_VIOLATION, details);
  }

  /**
   * Create an invalid operation error
   */
  static invalidOperation(message: string): AppError {
    return new AppError(message, 422, ErrorCode.INVALID_OPERATION);
  }

  /**
   * Create a rate limit error
   */
  static rateLimitExceeded(
    message: string = 'Too many requests, please try again later'
  ): AppError {
    return new AppError(message, 429, ErrorCode.RATE_LIMIT_EXCEEDED);
  }

  /**
   * Create an internal server error
   */
  static internal(message: string = 'Internal server error'): AppError {
    return new AppError(message, 500, ErrorCode.INTERNAL_SERVER_ERROR, undefined, false);
  }

  /**
   * Create a database error
   */
  static database(message: string = 'Database error'): AppError {
    return new AppError(message, 500, ErrorCode.DATABASE_ERROR, undefined, false);
  }
}
