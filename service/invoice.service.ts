import { StatusCodes } from 'http-status-codes';
import { InvoiceModel } from '../model/invoice.model';
import { EnrollmentModel } from '../model/enrollment.model';
import {
  ICreateInvoiceDTO,
  IUpdateInvoiceDTO,
  InvoiceStatus,
} from '../types/invoice.types';
import { UserRole } from '../types/user.types';

// Mock promo codes (trong thực tế nên lưu trong DB)
const PROMO_CODES: { [key: string]: number } = {
  'SAVE10': 0.1, // 10% discount
  'SAVE20': 0.2, // 20% discount
  'WELCOME': 50, // Fixed $50 discount
  'STUDENT50': 50, // Fixed $50 discount
};

export class InvoiceService {
  async createInvoice(data: ICreateInvoiceDTO): Promise<any> {
    // Kiểm tra enrollment tồn tại
    const enrollment = await EnrollmentModel.findById(data.enrollmentId);
    if (!enrollment) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: 'Enrollment not found',
      };
    }

    // Kiểm tra đã có invoice chưa
    const existingInvoice = await InvoiceModel.findOne({ enrollmentId: data.enrollmentId });
    if (existingInvoice) {
      throw {
        status: StatusCodes.CONFLICT,
        message: 'Invoice already exists for this enrollment',
      };
    }

    // Apply promo code nếu có
    let discount = data.discount || 0;
    if (data.promoCode) {
      const promoDiscount = this.calculatePromoDiscount(data.subtotal, data.promoCode);
      discount += promoDiscount;
    }

    // Tạo invoice
    const invoice = await InvoiceModel.create({
      enrollmentId: data.enrollmentId,
      courseType: data.courseType,
      subtotal: data.subtotal,
      discount: discount,
      refund: 0,
      promoCode: data.promoCode,
      dueDate: data.dueDate,
      notes: data.notes,
      status: InvoiceStatus.PENDING,
    });

    return invoice.toJSON();
  }

  async getInvoiceById(invoiceId: string): Promise<any> {
    const invoice = await InvoiceModel.findById(invoiceId);
    if (!invoice) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: 'Invoice not found',
      };
    }
    return invoice.toJSON();
  }

  async getInvoiceByEnrollmentId(enrollmentId: string): Promise<any> {
    const invoice = await InvoiceModel.findOne({ enrollmentId });
    if (!invoice) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: 'Invoice not found for this enrollment',
      };
    }
    return invoice.toJSON();
  }

  async getAllInvoices(filters?: {
    status?: InvoiceStatus;
    courseType?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }): Promise<{ invoices: any[]; total: number; page: number; totalPages: number }> {
    const { status, courseType, startDate, endDate, page = 1, limit = 10 } = filters || {};

    const query: any = {};
    if (status) query.status = status;
    if (courseType) query.courseType = courseType;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = startDate;
      if (endDate) query.createdAt.$lte = endDate;
    }

    const skip = (page - 1) * limit;

    const [invoices, total] = await Promise.all([
      InvoiceModel.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
      InvoiceModel.countDocuments(query),
    ]);

    return {
      invoices: invoices.map((invoice) => invoice.toJSON()),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getPendingInvoices(): Promise<any[]> {
    const invoices = await InvoiceModel.find({
      status: InvoiceStatus.PENDING,
    }).sort({ dueDate: 1 }); // Earliest due date first

    return invoices.map((invoice) => invoice.toJSON());
  }

  async getOverdueInvoices(): Promise<any[]> {
    const now = new Date();
    const invoices = await InvoiceModel.find({
      status: InvoiceStatus.PENDING,
      dueDate: { $lt: now },
    }).sort({ dueDate: 1 });

    return invoices.map((invoice) => invoice.toJSON());
  }

  async updateInvoice(
    invoiceId: string,
    data: IUpdateInvoiceDTO,
    userId: string,
    userRole: UserRole
  ): Promise<any> {
    const invoice = await InvoiceModel.findById(invoiceId);
    if (!invoice) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: 'Invoice not found',
      };
    }

    // Chỉ admin hoặc teacher mới được update invoice
    if (![UserRole.ADMIN, UserRole.TEACHER].includes(userRole)) {
      throw {
        status: StatusCodes.FORBIDDEN,
        message: 'You do not have permission to update invoices',
      };
    }

    // Không cho phép update invoice đã paid hoặc refunded
    if ([InvoiceStatus.PAID, InvoiceStatus.REFUNDED].includes(invoice.status)) {
      throw {
        status: StatusCodes.BAD_REQUEST,
        message: 'Cannot update paid or refunded invoices',
      };
    }

    const updatedInvoice = await InvoiceModel.findByIdAndUpdate(
      invoiceId,
      { $set: data },
      { new: true, runValidators: true }
    );

    return updatedInvoice!.toJSON();
  }

  async deleteInvoice(invoiceId: string, userRole: UserRole): Promise<void> {
    const invoice = await InvoiceModel.findById(invoiceId);
    if (!invoice) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: 'Invoice not found',
      };
    }

    // Chỉ admin mới được xóa invoice
    if (userRole !== UserRole.ADMIN) {
      throw {
        status: StatusCodes.FORBIDDEN,
        message: 'Only admin can delete invoices',
      };
    }

    // Chỉ có thể xóa invoice pending hoặc cancelled
    if (![InvoiceStatus.PENDING, InvoiceStatus.CANCELLED].includes(invoice.status)) {
      throw {
        status: StatusCodes.BAD_REQUEST,
        message: 'Can only delete pending or cancelled invoices',
      };
    }

    await InvoiceModel.findByIdAndDelete(invoiceId);
  }

  async payInvoice(
    invoiceId: string,
    paymentMethod: string,
    transactionId: string | undefined
  ): Promise<any> {
    const invoice = await InvoiceModel.findById(invoiceId);
    if (!invoice) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: 'Invoice not found',
      };
    }

    // Kiểm tra status
    if (invoice.status !== InvoiceStatus.PENDING) {
      throw {
        status: StatusCodes.BAD_REQUEST,
        message: 'Only pending invoices can be paid',
      };
    }

    invoice.status = InvoiceStatus.PAID;
    invoice.paymentMethod = paymentMethod;
    invoice.transactionId = transactionId;
    invoice.paidAt = new Date();
    await invoice.save();

    return invoice.toJSON();
  }

  async refundInvoice(
    invoiceId: string,
    refundAmount: number,
    reason: string | undefined
  ): Promise<any> {
    const invoice = await InvoiceModel.findById(invoiceId);
    if (!invoice) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: 'Invoice not found',
      };
    }

    // Chỉ có thể refund invoice đã paid
    if (invoice.status !== InvoiceStatus.PAID) {
      throw {
        status: StatusCodes.BAD_REQUEST,
        message: 'Only paid invoices can be refunded',
      };
    }

    // Kiểm tra refund amount không vượt quá total
    if (refundAmount > invoice.total) {
      throw {
        status: StatusCodes.BAD_REQUEST,
        message: 'Refund amount cannot exceed invoice total',
      };
    }

    invoice.refund = refundAmount;
    invoice.status = InvoiceStatus.REFUNDED;
    invoice.refundedAt = new Date();
    if (reason) {
      invoice.notes = (invoice.notes ? invoice.notes + '\n' : '') + `Refund reason: ${reason}`;
    }
    await invoice.save();

    return invoice.toJSON();
  }

  async cancelInvoice(invoiceId: string): Promise<any> {
    const invoice = await InvoiceModel.findById(invoiceId);
    if (!invoice) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: 'Invoice not found',
      };
    }

    // Chỉ có thể cancel invoice pending
    if (invoice.status !== InvoiceStatus.PENDING) {
      throw {
        status: StatusCodes.BAD_REQUEST,
        message: 'Only pending invoices can be cancelled',
      };
    }

    invoice.status = InvoiceStatus.CANCELLED;
    await invoice.save();

    return invoice.toJSON();
  }

  async applyPromoCode(invoiceId: string, promoCode: string): Promise<any> {
    const invoice = await InvoiceModel.findById(invoiceId);
    if (!invoice) {
      throw {
        status: StatusCodes.NOT_FOUND,
        message: 'Invoice not found',
      };
    }

    // Chỉ có thể apply promo code cho invoice pending
    if (invoice.status !== InvoiceStatus.PENDING) {
      throw {
        status: StatusCodes.BAD_REQUEST,
        message: 'Can only apply promo code to pending invoices',
      };
    }

    // Kiểm tra promo code có tồn tại không
    if (!PROMO_CODES[promoCode]) {
      throw {
        status: StatusCodes.BAD_REQUEST,
        message: 'Invalid promo code',
      };
    }

    // Apply discount
    const additionalDiscount = this.calculatePromoDiscount(invoice.subtotal, promoCode);
    invoice.discount += additionalDiscount;
    invoice.promoCode = promoCode;
    await invoice.save();

    return invoice.toJSON();
  }

  private calculatePromoDiscount(subtotal: number, promoCode: string): number {
    const promoValue = PROMO_CODES[promoCode];
    if (!promoValue) return 0;

    // Nếu giá trị < 1, coi như là phần trăm
    if (promoValue < 1) {
      return subtotal * promoValue;
    }

    // Nếu >= 1, coi như là fixed amount
    return promoValue;
  }

  async getInvoiceStats(filters?: {
    startDate?: Date;
    endDate?: Date;
  }): Promise<any> {
    const query: any = {};
    if (filters?.startDate || filters?.endDate) {
      query.createdAt = {};
      if (filters.startDate) query.createdAt.$gte = filters.startDate;
      if (filters.endDate) query.createdAt.$lte = filters.endDate;
    }

    const invoices = await InvoiceModel.find(query);

    const stats = {
      total: invoices.length,
      pending: 0,
      paid: 0,
      refunded: 0,
      cancelled: 0,
      overdue: 0,
      totalRevenue: 0,
      totalRefunded: 0,
      byCourseType: {
        online: 0,
        offline: 0,
        hybrid: 0,
      },
    };

    const now = new Date();

    invoices.forEach((invoice) => {
      // Count by status
      switch (invoice.status) {
        case InvoiceStatus.PENDING:
          stats.pending++;
          // Check if overdue
          if (invoice.dueDate && invoice.dueDate < now) {
            stats.overdue++;
          }
          break;
        case InvoiceStatus.PAID:
          stats.paid++;
          stats.totalRevenue += invoice.total;
          break;
        case InvoiceStatus.REFUNDED:
          stats.refunded++;
          stats.totalRefunded += invoice.refund;
          break;
        case InvoiceStatus.CANCELLED:
          stats.cancelled++;
          break;
      }

      // Count by course type
      if (invoice.status === InvoiceStatus.PAID) {
        stats.byCourseType[invoice.courseType] += invoice.total;
      }
    });

    return stats;
  }

  async getMyInvoices(
    studentId: string,
    filters?: { status?: InvoiceStatus; page?: number; limit?: number }
  ): Promise<{ invoices: any[]; total: number; page: number; totalPages: number }> {
    const { status, page = 1, limit = 10 } = filters || {};

    // Tìm tất cả enrollments của student
    const enrollments = await EnrollmentModel.find({ studentId }).select('_id');
    const enrollmentIds = enrollments.map((e) => e._id.toString());

    const query: any = { enrollmentId: { $in: enrollmentIds } };
    if (status) query.status = status;

    const skip = (page - 1) * limit;

    const [invoices, total] = await Promise.all([
      InvoiceModel.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
      InvoiceModel.countDocuments(query),
    ]);

    return {
      invoices: invoices.map((invoice) => invoice.toJSON()),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }
}
