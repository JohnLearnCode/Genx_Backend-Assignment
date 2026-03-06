import { Router } from 'express';
import { InvoiceController } from '../controller/invoice.controller';
import { validate } from '../middleware/validator.middleware';
import {
  createInvoiceSchema,
  updateInvoiceSchema,
  payInvoiceSchema,
  refundInvoiceSchema,
  applyPromoCodeSchema,
} from '../validator/invoice.validator';
import { authenticate } from '../middleware/auth.middleware';
import { requireTeacherOrAdmin, requireAdmin } from '../middleware/authorization.middleware';

const invoiceRouter = Router();
const invoiceController = new InvoiceController();

// Tất cả routes đều yêu cầu authentication
invoiceRouter.use(authenticate);

// GET all invoices - Teacher/Admin
invoiceRouter.get(
  '/',
  requireTeacherOrAdmin,
  invoiceController.getAllInvoices.bind(invoiceController)
);

// GET pending invoices - Teacher/Admin
invoiceRouter.get(
  '/pending',
  requireTeacherOrAdmin,
  invoiceController.getPendingInvoices.bind(invoiceController)
);

// GET overdue invoices - Teacher/Admin
invoiceRouter.get(
  '/overdue',
  requireTeacherOrAdmin,
  invoiceController.getOverdueInvoices.bind(invoiceController)
);

// GET my invoices (student's own invoices)
invoiceRouter.get(
  '/my-invoices',
  invoiceController.getMyInvoices.bind(invoiceController)
);

// GET invoice stats - Teacher/Admin
invoiceRouter.get(
  '/stats',
  requireTeacherOrAdmin,
  invoiceController.getInvoiceStats.bind(invoiceController)
);

// GET invoice by enrollment ID
invoiceRouter.get(
  '/enrollment/:enrollmentId',
  invoiceController.getInvoiceByEnrollmentId.bind(invoiceController)
);

// GET invoice by ID
invoiceRouter.get(
  '/:id',
  invoiceController.getInvoiceById.bind(invoiceController)
);

// CREATE invoice - Teacher/Admin
invoiceRouter.post(
  '/',
  requireTeacherOrAdmin,
  validate(createInvoiceSchema),
  invoiceController.createInvoice.bind(invoiceController)
);

// UPDATE invoice - Teacher/Admin
invoiceRouter.put(
  '/:id',
  requireTeacherOrAdmin,
  validate(updateInvoiceSchema),
  invoiceController.updateInvoice.bind(invoiceController)
);

// DELETE invoice - Admin only
invoiceRouter.delete(
  '/:id',
  requireAdmin,
  invoiceController.deleteInvoice.bind(invoiceController)
);

// PAY invoice - Any authenticated user
invoiceRouter.patch(
  '/:id/pay',
  validate(payInvoiceSchema),
  invoiceController.payInvoice.bind(invoiceController)
);

// REFUND invoice - Admin only
invoiceRouter.patch(
  '/:id/refund',
  requireAdmin,
  validate(refundInvoiceSchema),
  invoiceController.refundInvoice.bind(invoiceController)
);

// CANCEL invoice - Teacher/Admin
invoiceRouter.patch(
  '/:id/cancel',
  requireTeacherOrAdmin,
  invoiceController.cancelInvoice.bind(invoiceController)
);

// APPLY promo code - Any authenticated user
invoiceRouter.patch(
  '/:id/apply-promo',
  validate(applyPromoCodeSchema),
  invoiceController.applyPromoCode.bind(invoiceController)
);

export default invoiceRouter;
