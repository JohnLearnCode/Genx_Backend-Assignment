import { Router } from 'express';
import { ServiceRequestController } from '../controller/serviceRequest.controller';
import { validate } from '../middleware/validator.middleware';
import {
  createServiceRequestSchema,
  updateServiceRequestSchema,
  assignStaffSchema,
  updateStatusSchema,
} from '../validator/serviceRequest.validator';
import { authenticate } from '../middleware/auth.middleware';
import { requireTeacherOrAdmin, requireAdmin } from '../middleware/authorization.middleware';

const serviceRequestRouter = Router();
const serviceRequestController = new ServiceRequestController();

// Tất cả routes đều yêu cầu authentication
serviceRequestRouter.use(authenticate);

// GET all service requests - Teacher/Admin
serviceRequestRouter.get(
  '/',
  requireTeacherOrAdmin,
  serviceRequestController.getAllRequests.bind(serviceRequestController)
);

// GET pending requests - Teacher/Admin
serviceRequestRouter.get(
  '/pending',
  requireTeacherOrAdmin,
  serviceRequestController.getPendingRequests.bind(serviceRequestController)
);

// GET my requests (customer's own requests)
serviceRequestRouter.get(
  '/my-requests',
  serviceRequestController.getMyRequests.bind(serviceRequestController)
);

// GET assigned requests (staff's assigned requests) - Teacher/Admin
serviceRequestRouter.get(
  '/assigned',
  requireTeacherOrAdmin,
  serviceRequestController.getAssignedRequests.bind(serviceRequestController)
);

// GET request stats - Teacher/Admin
serviceRequestRouter.get(
  '/stats',
  requireTeacherOrAdmin,
  serviceRequestController.getRequestStats.bind(serviceRequestController)
);

// GET request by ID
serviceRequestRouter.get(
  '/:id',
  serviceRequestController.getRequestById.bind(serviceRequestController)
);

// CREATE service request - Any authenticated user
serviceRequestRouter.post(
  '/',
  validate(createServiceRequestSchema),
  serviceRequestController.createRequest.bind(serviceRequestController)
);

// UPDATE service request - Owner/Staff/Admin
serviceRequestRouter.put(
  '/:id',
  validate(updateServiceRequestSchema),
  serviceRequestController.updateRequest.bind(serviceRequestController)
);

// DELETE service request - Owner/Admin
serviceRequestRouter.delete(
  '/:id',
  serviceRequestController.deleteRequest.bind(serviceRequestController)
);

// ASSIGN staff - Admin only
serviceRequestRouter.patch(
  '/:id/assign-staff',
  requireAdmin,
  validate(assignStaffSchema),
  serviceRequestController.assignStaff.bind(serviceRequestController)
);

// UNASSIGN staff - Admin only
serviceRequestRouter.patch(
  '/:id/unassign-staff',
  requireAdmin,
  serviceRequestController.unassignStaff.bind(serviceRequestController)
);

// UPDATE status - Staff/Admin (or customer for cancel)
serviceRequestRouter.patch(
  '/:id/status',
  validate(updateStatusSchema),
  serviceRequestController.updateStatus.bind(serviceRequestController)
);

export default serviceRequestRouter;
