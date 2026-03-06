/**
 * Error Handling Examples
 * 
 * Demonstrates how to use AppError and standardized error responses
 */

import { AppError } from '../utils/AppError';
import { ErrorCode } from '../types/error.types';

// ============================================================================
// VALIDATION ERRORS (400)
// ============================================================================

// Example 1: Simple validation error
export const validationError1 = AppError.validation('Invalid input', [
  { field: 'months', reason: 'must be between 1 and 3' },
]);
// Response:
// {
//   "code": "VALIDATION_ERROR",
//   "message": "Invalid input",
//   "details": [
//     { "field": "months", "reason": "must be between 1 and 3" }
//   ],
//   "timestamp": "2024-01-15T10:00:00.000Z",
//   "path": "/api/invoice-calculator/calculate"
// }

// Example 2: Multiple validation errors
export const validationError2 = AppError.validation('Validation failed', [
  { field: 'email', reason: 'must be a valid email' },
  { field: 'password', reason: 'must be at least 6 characters' },
  { field: 'name', reason: 'is required' },
]);

// Example 3: Validation with value
export const validationError3 = AppError.validation('Invalid input', [
  { 
    field: 'months', 
    reason: 'must be between 1 and 3',
    value: 5 
  },
]);

// ============================================================================
// AUTHENTICATION ERRORS (401)
// ============================================================================

// Example 4: Unauthorized (no token)
export const unauthorizedError = AppError.unauthorized();
// Response:
// {
//   "code": "UNAUTHORIZED",
//   "message": "Unauthorized",
//   "timestamp": "...",
//   "path": "/api/users"
// }

// Example 5: Invalid token
export const invalidTokenError = AppError.invalidToken();
// Response:
// {
//   "code": "INVALID_TOKEN",
//   "message": "Invalid or expired token",
//   "timestamp": "...",
//   "path": "/api/auth/profile"
// }

// Example 6: Invalid credentials
export const invalidCredentialsError = AppError.invalidCredentials();
// Response:
// {
//   "code": "INVALID_CREDENTIALS",
//   "message": "Invalid credentials",
//   "timestamp": "...",
//   "path": "/api/auth/login"
// }

// ============================================================================
// AUTHORIZATION ERRORS (403)
// ============================================================================

// Example 7: Forbidden
export const forbiddenError = AppError.forbidden();
// Response:
// {
//   "code": "FORBIDDEN",
//   "message": "Forbidden",
//   "timestamp": "...",
//   "path": "/api/users/123"
// }

// Example 8: Insufficient permissions
export const insufficientPermissionsError = AppError.insufficientPermissions();
// Response:
// {
//   "code": "INSUFFICIENT_PERMISSIONS",
//   "message": "You do not have permission to access this resource",
//   "timestamp": "...",
//   "path": "/api/admin/dashboard"
// }

// ============================================================================
// NOT FOUND ERRORS (404)
// ============================================================================

// Example 9: Resource not found
export const notFoundError = AppError.notFound('User');
// Response:
// {
//   "code": "NOT_FOUND",
//   "message": "User not found",
//   "timestamp": "...",
//   "path": "/api/users/123"
// }

// ============================================================================
// CONFLICT ERRORS (409)
// ============================================================================

// Example 10: Already exists
export const alreadyExistsError = AppError.alreadyExists('Email');
// Response:
// {
//   "code": "ALREADY_EXISTS",
//   "message": "Email already exists",
//   "timestamp": "...",
//   "path": "/api/auth/register"
// }

// Example 11: Conflict with details
export const conflictError = AppError.conflict('Cannot complete operation', [
  { field: 'email', reason: 'already registered', value: 'john@example.com' },
]);

// ============================================================================
// BUSINESS LOGIC ERRORS (422)
// ============================================================================

// Example 12: Business rule violation
export const businessRuleError = AppError.businessRuleViolation(
  'Cannot delete class with enrolled students',
  [
    { field: 'enrolledCount', reason: 'must be 0 to delete', value: 15 },
  ]
);
// Response:
// {
//   "code": "BUSINESS_RULE_VIOLATION",
//   "message": "Cannot delete class with enrolled students",
//   "details": [
//     { "field": "enrolledCount", "reason": "must be 0 to delete", "value": 15 }
//   ],
//   "timestamp": "...",
//   "path": "/api/classes/123"
// }

// Example 13: Invalid operation
export const invalidOperationError = AppError.invalidOperation(
  'Cannot approve already rejected enrollment'
);

// ============================================================================
// RATE LIMITING (429)
// ============================================================================

// Example 14: Rate limit exceeded
export const rateLimitError = AppError.rateLimitExceeded();
// Response:
// {
//   "code": "RATE_LIMIT_EXCEEDED",
//   "message": "Too many requests, please try again later",
//   "timestamp": "...",
//   "path": "/api/auth/login"
// }

// ============================================================================
// SERVER ERRORS (500)
// ============================================================================

// Example 15: Internal server error
export const internalError = AppError.internal();
// Response (production):
// {
//   "code": "INTERNAL_SERVER_ERROR",
//   "message": "Internal server error",
//   "timestamp": "...",
//   "path": "/api/users"
// }

// Example 16: Database error
export const databaseError = AppError.database('Failed to connect to database');

// ============================================================================
// USAGE IN SERVICES
// ============================================================================

// Example usage in service layer
export class ExampleService {
  async getUser(userId: string) {
    // Check if user exists
    const user = null; // Simulate not found
    
    if (!user) {
      throw AppError.notFound('User');
    }
    
    return user;
  }

  async updateUser(userId: string, data: any) {
    // Validate input
    if (!data.email) {
      throw AppError.validation('Invalid input', [
        { field: 'email', reason: 'is required' },
      ]);
    }

    // Check if email already exists
    const existingUser = true; // Simulate duplicate
    if (existingUser) {
      throw AppError.conflict('Email already exists', [
        { field: 'email', reason: 'is already registered', value: data.email },
      ]);
    }

    // Business rule check
    const enrolledCount = 15;
    if (enrolledCount > 0) {
      throw AppError.businessRuleViolation(
        'Cannot delete user with active enrollments',
        [{ field: 'enrolledCount', reason: 'must be 0', value: enrolledCount }]
      );
    }

    return { updated: true };
  }

  async deleteClass(classId: string, userId: string) {
    // Authorization check
    const isOwner = false;
    if (!isOwner) {
      throw AppError.insufficientPermissions(
        'You can only delete your own classes'
      );
    }

    // Business rule check
    const enrolledStudents = 5;
    if (enrolledStudents > 0) {
      throw AppError.invalidOperation(
        'Cannot delete class with enrolled students'
      );
    }
  }
}

// ============================================================================
// USAGE IN CONTROLLERS
// ============================================================================

// Example usage in controller
export class ExampleController {
  async getUser(req: any, res: any) {
    try {
      const service = new ExampleService();
      const user = await service.getUser(req.params.id);
      res.json(user);
    } catch (error) {
      // Error will be caught by error handler middleware
      throw error;
    }
  }

  // OR use async error wrapper
  async updateUser(req: any, res: any, next: any) {
    try {
      const service = new ExampleService();
      const result = await service.updateUser(req.params.id, req.body);
      res.json(result);
    } catch (error) {
      next(error); // Pass to error handler
    }
  }
}

// ============================================================================
// CUSTOM ERROR CODES
// ============================================================================

// You can also create custom errors
export const customError = new AppError(
  'Custom error message',
  422,
  ErrorCode.BUSINESS_RULE_VIOLATION,
  [
    { field: 'custom', reason: 'custom reason' },
  ]
);
