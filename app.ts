import dotenv from 'dotenv';
dotenv.config();

import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { appConfig } from './config/app.config';
import { generalLimiter } from './middleware/rateLimit.middleware';
import { connectDatabase } from './config/database.config';
import { swaggerSpec } from './config/swagger.config';
import { printRoutes } from './utils/routesList';
import { 
  errorHandler, 
  notFoundHandler,
  handleUncaughtException,
  handleUnhandledRejection 
} from './middleware/errorHandler.middleware';

const app: Application = express();

// Middleware cơ bản
app.use(cors({ origin: appConfig.corsOrigin }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Áp dụng rate limit cho tất cả routes
app.use(generalLimiter);

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'LMS API Documentation',
}));

// Swagger JSON
app.get('/api-docs.json', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Ping endpoint (for keep-alive, uptime monitoring)
app.get('/ping', (req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'OK',
    message: 'pong',
    timestamp: new Date().toISOString()
  });
});

// API info endpoint
app.get('/api', (req: Request, res: Response) => {
  res.status(200).json({
    message: 'Learning Management System API',
    version: '1.0.0',
    documentation: `${req.protocol}://${req.get('host')}/api-docs`,
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      courses: '/api/courses',
      classes: '/api/classes',
      sessions: '/api/sessions',
      serviceRequests: '/api/service-requests',
      enrollments: '/api/enrollments',
      invoices: '/api/invoices',
      scheduleGenerator: '/api/schedule-generator',
      invoiceCalculator: '/api/invoice-calculator',
    },
  });
});

// Import routes
import authRouter from './router/auth.router';
import userRouter from './router/user.router';
import courseRouter from './router/course.router';
import classRouter from './router/class.router';
import scheduleSessionRouter from './router/scheduleSession.router';
import serviceRequestRouter from './router/serviceRequest.router';
import enrollmentRouter from './router/enrollment.router';
import invoiceRouter from './router/invoice.router';
import scheduleGeneratorRouter from './router/scheduleGenerator.router';
import invoiceCalculatorRouter from './router/invoiceCalculator.router';

// Cấu hình routes
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/courses', courseRouter);
app.use('/api/classes', classRouter);
app.use('/api/sessions', scheduleSessionRouter);
app.use('/api/service-requests', serviceRequestRouter);
app.use('/api/enrollments', enrollmentRouter);
app.use('/api/invoices', invoiceRouter);
app.use('/api/schedule-generator', scheduleGeneratorRouter);
app.use('/api/invoice-calculator', invoiceCalculatorRouter);

// 404 handler (must be after all routes)
app.use(notFoundHandler);

// Centralized error handler (must be last)
app.use(errorHandler);

// Handle uncaught exceptions and unhandled rejections
handleUncaughtException();
handleUnhandledRejection();

// Kết nối database và start server
const startServer = async () => {
  try {
    await connectDatabase();
    
    app.listen(appConfig.port, () => {
      console.log('\n' + '='.repeat(100));
      console.log('🚀 SERVER STARTED SUCCESSFULLY');
      console.log('='.repeat(100));
      console.log(`✓ Port: ${appConfig.port}`);
      console.log(`✓ Environment: ${appConfig.env}`);
      console.log(`✓ Base URL: http://localhost:${appConfig.port}`);
      console.log(`✓ API Documentation: http://localhost:${appConfig.port}/api-docs`);
      console.log('='.repeat(100));
      
      // Print all routes
      printRoutes(app);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
