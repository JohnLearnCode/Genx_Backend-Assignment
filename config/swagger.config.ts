import swaggerJsdoc from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Learning Management System API',
    version: '1.0.0',
    description: `
# Learning Management System API

Backend API cho hệ thống quản lý học tập.

## Features
- 🔐 Authentication & Authorization (JWT)
- 👥 User Management (Student, Teacher, Admin)
- 📚 Course & Class Management
- 📅 Schedule Session Management
- 🎫 Service Request System
- ✍️ Enrollment Management
- 💰 Invoice & Payment System
- 🗓️ Schedule Generator (tránh ngày lễ)
- 🧮 Invoice Calculator (tính học phí)

## Authentication
Most endpoints require authentication using Bearer token:
\`\`\`
Authorization: Bearer <access_token>
\`\`\`

Get access token by:
1. POST /api/auth/register - Register new account
2. POST /api/auth/login - Login to get tokens

## Rate Limiting
- General endpoints: 100 requests per 15 minutes
- Auth endpoints: 5 requests per 15 minutes

## Roles
- **student**: Basic user, can enroll in classes
- **teacher**: Can create courses/classes, manage enrollments
- **admin**: Full system access
    `,
    contact: {
      name: 'API Support',
      email: 'support@example.com',
    },
    license: {
      name: 'ISC',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server',
    },
    {
      url: 'https://api.example.com',
      description: 'Production server',
    },
  ],
  tags: [
    {
      name: 'Auth',
      description: 'Authentication endpoints',
    },
    {
      name: 'Users',
      description: 'User management endpoints',
    },
    {
      name: 'Courses',
      description: 'Course management endpoints',
    },
    {
      name: 'Classes',
      description: 'Class management endpoints',
    },
    {
      name: 'Sessions',
      description: 'Schedule session management endpoints',
    },
    {
      name: 'Service Requests',
      description: 'Service request management endpoints',
    },
    {
      name: 'Enrollments',
      description: 'Enrollment management endpoints',
    },
    {
      name: 'Invoices',
      description: 'Invoice & payment management endpoints',
    },
    {
      name: 'Schedule Generator',
      description: 'Auto-generate schedule avoiding holidays',
    },
    {
      name: 'Invoice Calculator',
      description: 'Calculate tuition fees with promo & refund',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT token obtained from login',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            description: 'Error message',
          },
          errors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: {
                  type: 'string',
                },
                message: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
      User: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
          },
          name: {
            type: 'string',
          },
          email: {
            type: 'string',
            format: 'email',
          },
          phone: {
            type: 'string',
          },
          role: {
            type: 'string',
            enum: ['student', 'teacher', 'admin'],
          },
          isActive: {
            type: 'boolean',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      Course: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
          },
          name: {
            type: 'string',
          },
          description: {
            type: 'string',
          },
          courseCode: {
            type: 'string',
          },
          startDate: {
            type: 'string',
            format: 'date',
          },
          endDate: {
            type: 'string',
            format: 'date',
          },
          capacity: {
            type: 'integer',
          },
          book: {
            type: 'string',
          },
          teacherId: {
            type: 'string',
          },
          enrolledCount: {
            type: 'integer',
          },
          isActive: {
            type: 'boolean',
          },
        },
      },
      Class: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
          },
          courseId: {
            type: 'string',
          },
          teacherId: {
            type: 'string',
          },
          supportStaffId: {
            type: 'string',
          },
          meetLink: {
            type: 'string',
            format: 'uri',
          },
          capacity: {
            type: 'integer',
          },
          enrolledCount: {
            type: 'integer',
          },
          schedule: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                dayOfWeek: {
                  type: 'integer',
                  minimum: 0,
                  maximum: 6,
                },
                startTime: {
                  type: 'string',
                  pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$',
                },
                endTime: {
                  type: 'string',
                  pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$',
                },
              },
            },
          },
          isActive: {
            type: 'boolean',
          },
        },
      },
      Session: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
          },
          classId: {
            type: 'string',
          },
          sessionDate: {
            type: 'string',
            format: 'date',
          },
          status: {
            type: 'string',
            enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
          },
          startTime: {
            type: 'string',
          },
          endTime: {
            type: 'string',
          },
          topic: {
            type: 'string',
          },
          notes: {
            type: 'string',
          },
          attendanceCount: {
            type: 'integer',
          },
        },
      },
      ServiceRequest: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
          },
          customerId: {
            type: 'string',
          },
          staffId: {
            type: 'string',
          },
          serviceName: {
            type: 'string',
          },
          description: {
            type: 'string',
          },
          status: {
            type: 'string',
            enum: ['pending', 'assigned', 'in_progress', 'completed', 'rejected', 'cancelled'],
          },
          priority: {
            type: 'string',
            enum: ['low', 'medium', 'high'],
          },
        },
      },
      Enrollment: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
          },
          studentId: {
            type: 'string',
          },
          classId: {
            type: 'string',
          },
          status: {
            type: 'string',
            enum: ['pending', 'enrolled', 'completed', 'dropped', 'rejected'],
          },
          enrollAt: {
            type: 'string',
            format: 'date-time',
          },
          grade: {
            type: 'string',
          },
        },
      },
      Invoice: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
          },
          enrollmentId: {
            type: 'string',
          },
          courseType: {
            type: 'string',
            enum: ['online', 'offline', 'hybrid'],
          },
          subtotal: {
            type: 'number',
          },
          discount: {
            type: 'number',
          },
          refund: {
            type: 'number',
          },
          total: {
            type: 'number',
          },
          promoCode: {
            type: 'string',
          },
          status: {
            type: 'string',
            enum: ['pending', 'paid', 'refunded', 'cancelled', 'overdue'],
          },
        },
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};

const options: swaggerJsdoc.Options = {
  definition: swaggerDefinition,
  apis: [
    './docs/swagger/*.swagger.ts',
    './router/*.ts',
    './controller/*.ts',
  ], // Path to the API routes
};

export const swaggerSpec = swaggerJsdoc(options);
