import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { InvoiceService } from '../service/invoice.service';
import { IAuthRequest } from '../types/auth.types';
import { InvoiceStatus } from '../types/invoice.types';

const invoiceService = new InvoiceService();

export class InvoiceController {
  async createInvoice(req: IAuthRequest, res: Response): Promise<void> {
    try {
      const invoice = await invoiceService.createInvoice(req.body);
      res.status(StatusCodes.CREATED).json({
        message: 'Invoice created successfully',
        data: invoice,
      });
    } catch (error: any) {
      res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Failed to create invoice',
      });
    }
  }

  async getInvoiceById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const invoice = await invoiceService.getInvoiceById(id);
      res.status(StatusCodes.OK).json({
        message: 'Invoice retrieved successfully',
        data: invoice,
      });
    } catch (error: any) {
      res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Failed to get invoice',
      });
    }
  }

  async getInvoiceByEnrollmentId(req: Request, res: Response): Promise<void> {
    try {
      const { enrollmentId } = req.params;
      const invoice = await invoiceService.getInvoiceByEnrollmentId(enrollmentId);
      res.status(StatusCodes.OK).json({
        message: 'Invoice retrieved successfully',
        data: invoice,
      });
    } catch (error: any) {
      res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Failed to get invoice',
      });
    }
  }

  async getAllInvoices(req: Request, res: Response): Promise<void> {
    try {
      const { status, courseType, startDate, endDate, page, limit } = req.query;
      const filters = {
        status: status as InvoiceStatus,
        courseType: courseType as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      };

      const result = await invoiceService.getAllInvoices(filters);
      res.status(StatusCodes.OK).json({
        message: 'Invoices retrieved successfully',
        data: result,
      });
    } catch (error: any) {
      res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Failed to get invoices',
      });
    }
  }

  async getMyInvoices(req: IAuthRequest, res: Response): Promise<void> {
    try {
      const studentId = req.user!.userId;
      const { status, page, limit } = req.query;
      const filters = {
        status: status as InvoiceStatus,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      };

      const result = await invoiceService.getMyInvoices(studentId, filters);
      res.status(StatusCodes.OK).json({
        message: 'Your invoices retrieved successfully',
        data: result,
      });
    } catch (error: any) {
      res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Failed to get your invoices',
      });
    }
  }

  async getPendingInvoices(req: Request, res: Response): Promise<void> {
    try {
      const invoices = await invoiceService.getPendingInvoices();
      res.status(StatusCodes.OK).json({
        message: 'Pending invoices retrieved successfully',
        data: invoices,
      });
    } catch (error: any) {
      res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Failed to get pending invoices',
      });
    }
  }

  async getOverdueInvoices(req: Request, res: Response): Promise<void> {
    try {
      const invoices = await invoiceService.getOverdueInvoices();
      res.status(StatusCodes.OK).json({
        message: 'Overdue invoices retrieved successfully',
        data: invoices,
      });
    } catch (error: any) {
      res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Failed to get overdue invoices',
      });
    }
  }

  async updateInvoice(req: IAuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;
      const userRole = req.user!.role;
      const invoice = await invoiceService.updateInvoice(id, req.body, userId, userRole);
      res.status(StatusCodes.OK).json({
        message: 'Invoice updated successfully',
        data: invoice,
      });
    } catch (error: any) {
      res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Failed to update invoice',
      });
    }
  }

  async deleteInvoice(req: IAuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userRole = req.user!.role;
      await invoiceService.deleteInvoice(id, userRole);
      res.status(StatusCodes.OK).json({
        message: 'Invoice deleted successfully',
      });
    } catch (error: any) {
      res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Failed to delete invoice',
      });
    }
  }

  async payInvoice(req: IAuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { paymentMethod, transactionId } = req.body;

      if (!paymentMethod) {
        res.status(StatusCodes.BAD_REQUEST).json({
          message: 'Payment method is required',
        });
        return;
      }

      const invoice = await invoiceService.payInvoice(id, paymentMethod, transactionId);
      res.status(StatusCodes.OK).json({
        message: 'Invoice paid successfully',
        data: invoice,
      });
    } catch (error: any) {
      res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Failed to pay invoice',
      });
    }
  }

  async refundInvoice(req: IAuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { refundAmount, reason } = req.body;

      if (!refundAmount) {
        res.status(StatusCodes.BAD_REQUEST).json({
          message: 'Refund amount is required',
        });
        return;
      }

      const invoice = await invoiceService.refundInvoice(id, refundAmount, reason);
      res.status(StatusCodes.OK).json({
        message: 'Invoice refunded successfully',
        data: invoice,
      });
    } catch (error: any) {
      res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Failed to refund invoice',
      });
    }
  }

  async cancelInvoice(req: IAuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const invoice = await invoiceService.cancelInvoice(id);
      res.status(StatusCodes.OK).json({
        message: 'Invoice cancelled successfully',
        data: invoice,
      });
    } catch (error: any) {
      res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Failed to cancel invoice',
      });
    }
  }

  async applyPromoCode(req: IAuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { promoCode } = req.body;

      if (!promoCode) {
        res.status(StatusCodes.BAD_REQUEST).json({
          message: 'Promo code is required',
        });
        return;
      }

      const invoice = await invoiceService.applyPromoCode(id, promoCode);
      res.status(StatusCodes.OK).json({
        message: 'Promo code applied successfully',
        data: invoice,
      });
    } catch (error: any) {
      res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Failed to apply promo code',
      });
    }
  }

  async getInvoiceStats(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate } = req.query;
      const filters = {
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
      };

      const stats = await invoiceService.getInvoiceStats(filters);
      res.status(StatusCodes.OK).json({
        message: 'Invoice stats retrieved successfully',
        data: stats,
      });
    } catch (error: any) {
      res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Failed to get invoice stats',
      });
    }
  }
}
