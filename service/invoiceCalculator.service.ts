import {
  ICalcInvoiceInput,
  ICalcInvoiceOutput,
  IInvoiceCalculatorError,
  CoursePaymentType,
  PromoCodeType,
} from '../types/invoiceCalculator.types';

export class InvoiceCalculatorService {
  /**
   * Validate input parameters
   */
  private validateInput(input: ICalcInvoiceInput): IInvoiceCalculatorError[] {
    const errors: IInvoiceCalculatorError[] = [];

    // Validate courseType
    if (!Object.values(CoursePaymentType).includes(input.courseType)) {
      errors.push({
        field: 'courseType',
        message: 'Course type must be MONTHLY or FULL_COURSE',
      });
    }

    // Validate basePrice
    if (typeof input.basePrice !== 'number') {
      errors.push({
        field: 'basePrice',
        message: 'Base price must be a number',
      });
    } else if (input.basePrice < 0) {
      errors.push({
        field: 'basePrice',
        message: 'Base price cannot be negative',
      });
    }

    // Validate months (only for MONTHLY)
    if (input.courseType === CoursePaymentType.MONTHLY) {
      if (typeof input.months !== 'number') {
        errors.push({
          field: 'months',
          message: 'Months must be a number',
        });
      } else if (!Number.isInteger(input.months)) {
        errors.push({
          field: 'months',
          message: 'Months must be an integer',
        });
      } else if (input.months < 1 || input.months > 3) {
        errors.push({
          field: 'months',
          message: 'Months must be between 1 and 3 for MONTHLY course type',
        });
      }
    }

    // Validate promoCode
    if (input.promoCode !== null) {
      if (!Object.values(PromoCodeType).includes(input.promoCode as PromoCodeType)) {
        errors.push({
          field: 'promoCode',
          message: 'Promo code must be SAVE10, FLAT50K, or null',
        });
      }
    }

    // Validate canceledClasses
    if (typeof input.canceledClasses !== 'number') {
      errors.push({
        field: 'canceledClasses',
        message: 'Canceled classes must be a number',
      });
    } else if (input.canceledClasses < 0) {
      errors.push({
        field: 'canceledClasses',
        message: 'Canceled classes cannot be negative',
      });
    } else if (!Number.isInteger(input.canceledClasses)) {
      errors.push({
        field: 'canceledClasses',
        message: 'Canceled classes must be an integer',
      });
    }

    // Validate refundPerClass
    if (typeof input.refundPerClass !== 'number') {
      errors.push({
        field: 'refundPerClass',
        message: 'Refund per class must be a number',
      });
    } else if (input.refundPerClass < 0) {
      errors.push({
        field: 'refundPerClass',
        message: 'Refund per class cannot be negative',
      });
    }

    return errors;
  }

  /**
   * Calculate subtotal based on course type
   */
  private calculateSubtotal(courseType: CoursePaymentType, basePrice: number, months: number): number {
    if (courseType === CoursePaymentType.MONTHLY) {
      return basePrice * months;
    } else {
      // FULL_COURSE
      return basePrice;
    }
  }

  /**
   * Calculate discount based on promo code
   */
  private calculateDiscount(promoCode: PromoCodeType | null, subtotal: number): number {
    if (promoCode === null) {
      return 0;
    }

    let discount = 0;

    if (promoCode === PromoCodeType.SAVE10) {
      // 10% of subtotal, rounded down to integer
      discount = Math.floor(0.10 * subtotal);
    } else if (promoCode === PromoCodeType.FLAT50K) {
      // Fixed 50,000 discount
      discount = 50000;
    }

    // Clamp: discount cannot exceed subtotal
    return Math.min(discount, subtotal);
  }

  /**
   * Calculate refund
   */
  private calculateRefund(canceledClasses: number, refundPerClass: number): number {
    return canceledClasses * refundPerClass;
  }

  /**
   * Calculate total (clamped to >= 0)
   */
  private calculateTotal(subtotal: number, discount: number, refund: number): number {
    const total = subtotal - discount - refund;
    // Clamp to >= 0
    return Math.max(0, total);
  }

  /**
   * Main calculation function
   */
  calcInvoice(input: ICalcInvoiceInput): ICalcInvoiceOutput {
    // Validate input
    const errors = this.validateInput(input);
    if (errors.length > 0) {
      throw {
        status: 400,
        message: 'Validation errors',
        errors,
      };
    }

    // Step 1: Calculate subtotal
    const subtotal = this.calculateSubtotal(input.courseType, input.basePrice, input.months);

    // Step 2: Calculate discount
    const discount = this.calculateDiscount(input.promoCode, subtotal);

    // Step 3: Calculate refund
    const refund = this.calculateRefund(input.canceledClasses, input.refundPerClass);

    // Step 4: Calculate total (clamped to >= 0)
    const total = this.calculateTotal(subtotal, discount, refund);

    return {
      subtotal,
      discount,
      refund,
      total,
    };
  }

  /**
   * Calculate invoice with detailed breakdown (for debugging/logging)
   */
  calcInvoiceWithDetails(input: ICalcInvoiceInput): {
    invoice: ICalcInvoiceOutput;
    breakdown: {
      courseType: string;
      basePrice: number;
      months: number;
      promoCode: string | null;
      canceledClasses: number;
      refundPerClass: number;
      calculations: {
        subtotalFormula: string;
        discountFormula: string;
        refundFormula: string;
        totalFormula: string;
      };
    };
  } {
    // Get validation errors if any
    const errors = this.validateInput(input);
    if (errors.length > 0) {
      throw {
        status: 400,
        message: 'Validation errors',
        errors,
      };
    }

    // Calculate invoice
    const invoice = this.calcInvoice(input);

    // Build formulas for breakdown
    let subtotalFormula: string;
    if (input.courseType === CoursePaymentType.MONTHLY) {
      subtotalFormula = `${input.basePrice} × ${input.months} = ${invoice.subtotal}`;
    } else {
      subtotalFormula = `${input.basePrice} (FULL_COURSE)`;
    }

    let discountFormula: string;
    if (input.promoCode === PromoCodeType.SAVE10) {
      discountFormula = `floor(0.10 × ${invoice.subtotal}) = ${invoice.discount}`;
    } else if (input.promoCode === PromoCodeType.FLAT50K) {
      const rawDiscount = 50000;
      const clamped = Math.min(rawDiscount, invoice.subtotal);
      discountFormula = `min(50000, ${invoice.subtotal}) = ${clamped}`;
    } else {
      discountFormula = '0 (no promo code)';
    }

    const refundFormula = `${input.canceledClasses} × ${input.refundPerClass} = ${invoice.refund}`;
    const beforeClamp = invoice.subtotal - invoice.discount - invoice.refund;
    const totalFormula = `${invoice.subtotal} - ${invoice.discount} - ${invoice.refund} = ${beforeClamp} → clamped to ${invoice.total}`;

    return {
      invoice,
      breakdown: {
        courseType: input.courseType,
        basePrice: input.basePrice,
        months: input.months,
        promoCode: input.promoCode,
        canceledClasses: input.canceledClasses,
        refundPerClass: input.refundPerClass,
        calculations: {
          subtotalFormula,
          discountFormula,
          refundFormula,
          totalFormula,
        },
      },
    };
  }
}
