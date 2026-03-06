import { InvoiceCalculatorService } from '../service/invoiceCalculator.service';
import {
  ICalcInvoiceInput,
  CoursePaymentType,
  PromoCodeType,
} from '../types/invoiceCalculator.types';

describe('Invoice Calculator Service', () => {
  let service: InvoiceCalculatorService;

  beforeEach(() => {
    service = new InvoiceCalculatorService();
  });

  describe('calcInvoice', () => {
    /**
     * Test Case 1: Basic MONTHLY payment without promo code
     */
    test('should calculate MONTHLY payment without promo code', () => {
      const input: ICalcInvoiceInput = {
        courseType: CoursePaymentType.MONTHLY,
        basePrice: 1000000,
        months: 3,
        promoCode: null,
        canceledClasses: 0,
        refundPerClass: 0,
      };

      const result = service.calcInvoice(input);

      expect(result.subtotal).toBe(3000000); // 1,000,000 * 3
      expect(result.discount).toBe(0);
      expect(result.refund).toBe(0);
      expect(result.total).toBe(3000000);
    });

    /**
     * Test Case 2: MONTHLY payment with SAVE10 promo code (10% discount)
     */
    test('should apply SAVE10 promo code (10% discount with floor)', () => {
      const input: ICalcInvoiceInput = {
        courseType: CoursePaymentType.MONTHLY,
        basePrice: 1000000,
        months: 3,
        promoCode: PromoCodeType.SAVE10,
        canceledClasses: 0,
        refundPerClass: 0,
      };

      const result = service.calcInvoice(input);

      expect(result.subtotal).toBe(3000000);
      expect(result.discount).toBe(300000); // floor(3,000,000 * 0.1) = 300,000
      expect(result.refund).toBe(0);
      expect(result.total).toBe(2700000); // 3,000,000 - 300,000
    });

    /**
     * Test Case 3: MONTHLY payment with FLAT50K promo code (flat 50,000 discount)
     */
    test('should apply FLAT50K promo code (flat 50,000 discount)', () => {
      const input: ICalcInvoiceInput = {
        courseType: CoursePaymentType.MONTHLY,
        basePrice: 1000000,
        months: 2,
        promoCode: PromoCodeType.FLAT50K,
        canceledClasses: 0,
        refundPerClass: 0,
      };

      const result = service.calcInvoice(input);

      expect(result.subtotal).toBe(2000000); // 1,000,000 * 2
      expect(result.discount).toBe(50000); // Flat 50k
      expect(result.refund).toBe(0);
      expect(result.total).toBe(1950000); // 2,000,000 - 50,000
    });

    /**
     * Test Case 4: FULL_COURSE payment (months should be ignored)
     */
    test('should calculate FULL_COURSE payment (ignore months parameter)', () => {
      const input: ICalcInvoiceInput = {
        courseType: CoursePaymentType.FULL_COURSE,
        basePrice: 5000000,
        months: 1, // Should be ignored for FULL_COURSE
        promoCode: null,
        canceledClasses: 0,
        refundPerClass: 0,
      };

      const result = service.calcInvoice(input);

      expect(result.subtotal).toBe(5000000); // Base price only
      expect(result.discount).toBe(0);
      expect(result.refund).toBe(0);
      expect(result.total).toBe(5000000);
    });

    /**
     * Test Case 5: Calculate with refunds for canceled classes
     */
    test('should calculate refunds for canceled classes', () => {
      const input: ICalcInvoiceInput = {
        courseType: CoursePaymentType.MONTHLY,
        basePrice: 1000000,
        months: 3,
        promoCode: PromoCodeType.SAVE10,
        canceledClasses: 2,
        refundPerClass: 20000,
      };

      const result = service.calcInvoice(input);

      expect(result.subtotal).toBe(3000000);
      expect(result.discount).toBe(300000); // 10% discount
      expect(result.refund).toBe(40000); // 2 * 20,000
      expect(result.total).toBe(2660000); // 3,000,000 - 300,000 - 40,000
    });

    /**
     * Test Case 6: Edge case - total cannot be negative (clamped to 0)
     */
    test('should clamp total to 0 if discount + refund exceeds subtotal', () => {
      const input: ICalcInvoiceInput = {
        courseType: CoursePaymentType.MONTHLY,
        basePrice: 100000,
        months: 1,
        promoCode: PromoCodeType.FLAT50K,
        canceledClasses: 10,
        refundPerClass: 20000,
      };

      const result = service.calcInvoice(input);

      expect(result.subtotal).toBe(100000);
      expect(result.discount).toBe(50000);
      expect(result.refund).toBe(200000); // 10 * 20,000 = 200,000
      // Total = 100,000 - 50,000 - 200,000 = -150,000 → clamped to 0
      expect(result.total).toBe(0);
    });

    /**
     * Test Case 7: Edge case - invalid months for MONTHLY type
     */
    test('should throw error for months < 1 in MONTHLY type', () => {
      const input: ICalcInvoiceInput = {
        courseType: CoursePaymentType.MONTHLY,
        basePrice: 1000000,
        months: 0, // Invalid
        promoCode: null,
        canceledClasses: 0,
        refundPerClass: 0,
      };

      expect(() => service.calcInvoice(input)).toThrow();
    });

    /**
     * Test Case 8: Edge case - invalid months (exceeds 3) for MONTHLY type
     */
    test('should throw error for months > 3 in MONTHLY type', () => {
      const input: ICalcInvoiceInput = {
        courseType: CoursePaymentType.MONTHLY,
        basePrice: 1000000,
        months: 5, // Invalid (exceeds max 3)
        promoCode: null,
        canceledClasses: 0,
        refundPerClass: 0,
      };

      expect(() => service.calcInvoice(input)).toThrow();
    });

    /**
     * Test Case 9: Edge case - negative values should throw error
     */
    test('should throw error for negative basePrice', () => {
      const input: ICalcInvoiceInput = {
        courseType: CoursePaymentType.MONTHLY,
        basePrice: -1000, // Invalid
        months: 1,
        promoCode: null,
        canceledClasses: 0,
        refundPerClass: 0,
      };

      expect(() => service.calcInvoice(input)).toThrow();
    });

    /**
     * Test Case 10: Edge case - floor function for SAVE10 (test with odd numbers)
     */
    test('should floor SAVE10 discount (not round)', () => {
      const input: ICalcInvoiceInput = {
        courseType: CoursePaymentType.MONTHLY,
        basePrice: 999999, // Odd number to test floor
        months: 1,
        promoCode: PromoCodeType.SAVE10,
        canceledClasses: 0,
        refundPerClass: 0,
      };

      const result = service.calcInvoice(input);

      expect(result.subtotal).toBe(999999);
      // 999999 * 0.1 = 99999.9 → floor = 99999 (not 100000)
      expect(result.discount).toBe(99999);
      expect(result.total).toBe(900000); // 999999 - 99999
    });

    /**
     * Test Case 11: Complex scenario with all features
     */
    test('should calculate complex invoice with all features', () => {
      const input: ICalcInvoiceInput = {
        courseType: CoursePaymentType.MONTHLY,
        basePrice: 2500000,
        months: 3,
        promoCode: PromoCodeType.SAVE10,
        canceledClasses: 5,
        refundPerClass: 30000,
      };

      const result = service.calcInvoice(input);

      expect(result.subtotal).toBe(7500000); // 2,500,000 * 3
      expect(result.discount).toBe(750000); // floor(7,500,000 * 0.1)
      expect(result.refund).toBe(150000); // 5 * 30,000
      expect(result.total).toBe(6600000); // 7,500,000 - 750,000 - 150,000
    });

    /**
     * Test Case 12: Zero values should work
     */
    test('should handle zero values correctly', () => {
      const input: ICalcInvoiceInput = {
        courseType: CoursePaymentType.FULL_COURSE,
        basePrice: 0,
        months: 1,
        promoCode: null,
        canceledClasses: 0,
        refundPerClass: 0,
      };

      const result = service.calcInvoice(input);

      expect(result.subtotal).toBe(0);
      expect(result.discount).toBe(0);
      expect(result.refund).toBe(0);
      expect(result.total).toBe(0);
    });
  });

  describe('calcInvoiceWithDetails', () => {
    /**
     * Test Case 13: Verify detailed breakdown
     */
    test('should return detailed breakdown with applied promo code', () => {
      const input: ICalcInvoiceInput = {
        courseType: CoursePaymentType.MONTHLY,
        basePrice: 1000000,
        months: 3,
        promoCode: PromoCodeType.SAVE10,
        canceledClasses: 2,
        refundPerClass: 20000,
      };

      const result = service.calcInvoiceWithDetails(input);

      expect(result.invoice.subtotal).toBe(3000000);
      expect(result.invoice.discount).toBe(300000);
      expect(result.invoice.refund).toBe(40000);
      expect(result.invoice.total).toBe(2660000);

      expect(result.breakdown.courseType).toBe('MONTHLY');
      expect(result.breakdown.basePrice).toBe(1000000);
      expect(result.breakdown.months).toBe(3);
      expect(result.breakdown.promoCode).toBe('SAVE10');
      expect(result.breakdown.canceledClasses).toBe(2);
      expect(result.breakdown.refundPerClass).toBe(20000);
    });

    /**
     * Test Case 14: Verify breakdown for FULL_COURSE
     */
    test('should show correct breakdown for FULL_COURSE payment', () => {
      const input: ICalcInvoiceInput = {
        courseType: CoursePaymentType.FULL_COURSE,
        basePrice: 5000000,
        months: 1,
        promoCode: PromoCodeType.FLAT50K,
        canceledClasses: 0,
        refundPerClass: 0,
      };

      const result = service.calcInvoiceWithDetails(input);

      expect(result.invoice.subtotal).toBe(5000000);
      expect(result.invoice.discount).toBe(50000);
      expect(result.invoice.total).toBe(4950000);

      expect(result.breakdown.courseType).toBe('FULL_COURSE');
      expect(result.breakdown.promoCode).toBe('FLAT50K');
    });
  });
});
