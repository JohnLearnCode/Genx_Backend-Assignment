import { Router } from 'express';
import { InvoiceCalculatorController } from '../controller/invoiceCalculator.controller';
import { validate } from '../middleware/validator.middleware';
import { calcInvoiceSchema } from '../validator/invoiceCalculator.validator';
import { authenticate } from '../middleware/auth.middleware';

const invoiceCalculatorRouter = Router();
const invoiceCalculatorController = new InvoiceCalculatorController();

// All routes require authentication
invoiceCalculatorRouter.use(authenticate);

// Calculate invoice
invoiceCalculatorRouter.post(
  '/calculate',
  validate(calcInvoiceSchema),
  invoiceCalculatorController.calcInvoice.bind(invoiceCalculatorController)
);

// Calculate invoice with detailed breakdown
invoiceCalculatorRouter.post(
  '/calculate-with-details',
  validate(calcInvoiceSchema),
  invoiceCalculatorController.calcInvoiceWithDetails.bind(invoiceCalculatorController)
);

export default invoiceCalculatorRouter;
