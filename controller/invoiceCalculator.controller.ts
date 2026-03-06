import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { InvoiceCalculatorService } from '../service/invoiceCalculator.service';

const invoiceCalculatorService = new InvoiceCalculatorService();

export class InvoiceCalculatorController {
  async calcInvoice(req: Request, res: Response): Promise<void> {
    try {
      const result = invoiceCalculatorService.calcInvoice(req.body);
      res.status(StatusCodes.OK).json({
        message: 'Invoice calculated successfully',
        data: result,
      });
    } catch (error: any) {
      res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Failed to calculate invoice',
        errors: error.errors,
      });
    }
  }

  async calcInvoiceWithDetails(req: Request, res: Response): Promise<void> {
    try {
      const result = invoiceCalculatorService.calcInvoiceWithDetails(req.body);
      res.status(StatusCodes.OK).json({
        message: 'Invoice calculated successfully with details',
        data: result,
      });
    } catch (error: any) {
      res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Failed to calculate invoice',
        errors: error.errors,
      });
    }
  }
}
