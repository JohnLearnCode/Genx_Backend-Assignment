/**
 * Invoice Calculator Examples
 * 
 * This file contains example inputs and expected outputs for the Invoice Calculator Service
 */

import { ICalcInvoiceInput, CoursePaymentType, PromoCodeType } from '../types/invoiceCalculator.types';

// ============================================================================
// VALID EXAMPLES
// ============================================================================

// Example 1: MONTHLY, 3 months, no promo, no refund
export const example1: ICalcInvoiceInput = {
  courseType: CoursePaymentType.MONTHLY,
  basePrice: 1000000, // 1M/month
  months: 3,
  promoCode: null,
  canceledClasses: 0,
  refundPerClass: 0,
};
// Expected output:
// {
//   "subtotal": 3000000,  // 1M × 3
//   "discount": 0,
//   "refund": 0,
//   "total": 3000000
// }

// Example 2: MONTHLY, 3 months, SAVE10 promo, no refund
export const example2: ICalcInvoiceInput = {
  courseType: CoursePaymentType.MONTHLY,
  basePrice: 1000000,
  months: 3,
  promoCode: PromoCodeType.SAVE10,
  canceledClasses: 0,
  refundPerClass: 0,
};
// Expected output:
// {
//   "subtotal": 3000000,
//   "discount": 300000,  // floor(0.10 × 3000000) = 300000
//   "refund": 0,
//   "total": 2700000     // 3000000 - 300000 = 2700000
// }

// Example 3: MONTHLY, 3 months, SAVE10 promo, with refund
export const example3: ICalcInvoiceInput = {
  courseType: CoursePaymentType.MONTHLY,
  basePrice: 1000000,
  months: 3,
  promoCode: PromoCodeType.SAVE10,
  canceledClasses: 2,
  refundPerClass: 20000,
};
// Expected output:
// {
//   "subtotal": 3000000,
//   "discount": 300000,
//   "refund": 40000,     // 2 × 20000
//   "total": 2660000     // 3000000 - 300000 - 40000 = 2660000
// }

// Example 4: FULL_COURSE, no promo, no refund
export const example4: ICalcInvoiceInput = {
  courseType: CoursePaymentType.FULL_COURSE,
  basePrice: 5000000,
  months: 0, // Ignored for FULL_COURSE
  promoCode: null,
  canceledClasses: 0,
  refundPerClass: 0,
};
// Expected output:
// {
//   "subtotal": 5000000,
//   "discount": 0,
//   "refund": 0,
//   "total": 5000000
// }

// Example 5: FULL_COURSE, FLAT50K promo
export const example5: ICalcInvoiceInput = {
  courseType: CoursePaymentType.FULL_COURSE,
  basePrice: 5000000,
  months: 0,
  promoCode: PromoCodeType.FLAT50K,
  canceledClasses: 0,
  refundPerClass: 0,
};
// Expected output:
// {
//   "subtotal": 5000000,
//   "discount": 50000,
//   "refund": 0,
//   "total": 4950000
// }

// Example 6: FULL_COURSE, FLAT50K promo, with refund
export const example6: ICalcInvoiceInput = {
  courseType: CoursePaymentType.FULL_COURSE,
  basePrice: 5000000,
  months: 0,
  promoCode: PromoCodeType.FLAT50K,
  canceledClasses: 5,
  refundPerClass: 30000,
};
// Expected output:
// {
//   "subtotal": 5000000,
//   "discount": 50000,
//   "refund": 150000,    // 5 × 30000
//   "total": 4800000     // 5000000 - 50000 - 150000 = 4800000
// }

// Example 7: MONTHLY, 1 month, SAVE10 promo
export const example7: ICalcInvoiceInput = {
  courseType: CoursePaymentType.MONTHLY,
  basePrice: 1500000,
  months: 1,
  promoCode: PromoCodeType.SAVE10,
  canceledClasses: 0,
  refundPerClass: 0,
};
// Expected output:
// {
//   "subtotal": 1500000,
//   "discount": 150000,  // floor(0.10 × 1500000) = 150000
//   "refund": 0,
//   "total": 1350000
// }

// Example 8: MONTHLY, 2 months, FLAT50K promo
export const example8: ICalcInvoiceInput = {
  courseType: CoursePaymentType.MONTHLY,
  basePrice: 800000,
  months: 2,
  promoCode: PromoCodeType.FLAT50K,
  canceledClasses: 0,
  refundPerClass: 0,
};
// Expected output:
// {
//   "subtotal": 1600000,  // 800000 × 2
//   "discount": 50000,
//   "refund": 0,
//   "total": 1550000
// }

// Example 9: Edge case - Discount clamped to subtotal
export const example9: ICalcInvoiceInput = {
  courseType: CoursePaymentType.MONTHLY,
  basePrice: 100000,
  months: 1,
  promoCode: PromoCodeType.FLAT50K,
  canceledClasses: 0,
  refundPerClass: 0,
};
// Expected output:
// {
//   "subtotal": 100000,
//   "discount": 50000,   // min(50000, 100000) = 50000
//   "refund": 0,
//   "total": 50000
// }

// Example 10: Edge case - Total clamped to 0
export const example10: ICalcInvoiceInput = {
  courseType: CoursePaymentType.MONTHLY,
  basePrice: 500000,
  months: 1,
  promoCode: PromoCodeType.SAVE10,
  canceledClasses: 20,
  refundPerClass: 50000,
};
// Expected output:
// {
//   "subtotal": 500000,
//   "discount": 50000,   // floor(0.10 × 500000) = 50000
//   "refund": 1000000,   // 20 × 50000 = 1000000
//   "total": 0           // max(0, 500000 - 50000 - 1000000) = 0
// }

// Example 11: SAVE10 with decimal result (floor)
export const example11: ICalcInvoiceInput = {
  courseType: CoursePaymentType.MONTHLY,
  basePrice: 555555,
  months: 1,
  promoCode: PromoCodeType.SAVE10,
  canceledClasses: 0,
  refundPerClass: 0,
};
// Expected output:
// {
//   "subtotal": 555555,
//   "discount": 55555,   // floor(0.10 × 555555) = floor(55555.5) = 55555
//   "refund": 0,
//   "total": 500000      // 555555 - 55555 = 500000
// }

// Example 12: Real scenario - 3 month course with partial cancellation
export const example12: ICalcInvoiceInput = {
  courseType: CoursePaymentType.MONTHLY,
  basePrice: 2000000,
  months: 3,
  promoCode: PromoCodeType.SAVE10,
  canceledClasses: 3,
  refundPerClass: 100000,
};
// Expected output:
// {
//   "subtotal": 6000000,   // 2M × 3
//   "discount": 600000,    // floor(0.10 × 6000000) = 600000
//   "refund": 300000,      // 3 × 100000
//   "total": 5100000       // 6000000 - 600000 - 300000 = 5100000
// }

// ============================================================================
// INVALID EXAMPLES (should return validation errors)
// ============================================================================

// Invalid 1: Months out of range (4)
export const invalid1: any = {
  courseType: CoursePaymentType.MONTHLY,
  basePrice: 1000000,
  months: 4, // Invalid: must be 1-3
  promoCode: null,
  canceledClasses: 0,
  refundPerClass: 0,
};

// Invalid 2: Negative base price
export const invalid2: any = {
  courseType: CoursePaymentType.MONTHLY,
  basePrice: -1000000, // Invalid
  months: 3,
  promoCode: null,
  canceledClasses: 0,
  refundPerClass: 0,
};

// Invalid 3: Invalid promo code
export const invalid3: any = {
  courseType: CoursePaymentType.MONTHLY,
  basePrice: 1000000,
  months: 3,
  promoCode: 'INVALID_CODE', // Invalid
  canceledClasses: 0,
  refundPerClass: 0,
};

// Invalid 4: Negative canceled classes
export const invalid4: any = {
  courseType: CoursePaymentType.MONTHLY,
  basePrice: 1000000,
  months: 3,
  promoCode: null,
  canceledClasses: -5, // Invalid
  refundPerClass: 0,
};

// Invalid 5: Negative refund per class
export const invalid5: any = {
  courseType: CoursePaymentType.MONTHLY,
  basePrice: 1000000,
  months: 3,
  promoCode: null,
  canceledClasses: 0,
  refundPerClass: -10000, // Invalid
};

// Invalid 6: Invalid course type
export const invalid6: any = {
  courseType: 'INVALID_TYPE',
  basePrice: 1000000,
  months: 3,
  promoCode: null,
  canceledClasses: 0,
  refundPerClass: 0,
};

// Invalid 7: Months = 0
export const invalid7: any = {
  courseType: CoursePaymentType.MONTHLY,
  basePrice: 1000000,
  months: 0, // Invalid: must be 1-3
  promoCode: null,
  canceledClasses: 0,
  refundPerClass: 0,
};

// Invalid 8: Decimal months
export const invalid8: any = {
  courseType: CoursePaymentType.MONTHLY,
  basePrice: 1000000,
  months: 2.5, // Invalid: must be integer
  promoCode: null,
  canceledClasses: 0,
  refundPerClass: 0,
};

/**
 * Test function to run examples
 */
export async function testInvoiceCalculator() {
  const examples = [
    { name: 'Example 1: MONTHLY 3 months, no promo', data: example1 },
    { name: 'Example 2: MONTHLY with SAVE10', data: example2 },
    { name: 'Example 3: MONTHLY with SAVE10 + refund', data: example3 },
    { name: 'Example 4: FULL_COURSE, no promo', data: example4 },
    { name: 'Example 5: FULL_COURSE with FLAT50K', data: example5 },
    { name: 'Example 6: FULL_COURSE with FLAT50K + refund', data: example6 },
    { name: 'Example 7: MONTHLY 1 month, SAVE10', data: example7 },
    { name: 'Example 8: MONTHLY 2 months, FLAT50K', data: example8 },
    { name: 'Example 9: Discount clamped', data: example9 },
    { name: 'Example 10: Total clamped to 0', data: example10 },
    { name: 'Example 11: SAVE10 floor decimal', data: example11 },
    { name: 'Example 12: Real scenario', data: example12 },
  ];

  console.log('='.repeat(80));
  console.log('Invoice Calculator Test Examples');
  console.log('='.repeat(80));

  for (const example of examples) {
    console.log(`\n${example.name}`);
    console.log('-'.repeat(80));
    console.log('Input:', JSON.stringify(example.data, null, 2));

    try {
      const response = await fetch('http://localhost:3000/api/invoice-calculator/calculate', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer YOUR_TOKEN_HERE',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(example.data),
      });

      const result = await response.json();
      console.log('Output:', JSON.stringify(result, null, 2));
    } catch (error) {
      console.error('Error:', error);
    }
  }

  // Test invalid examples
  console.log('\n');
  console.log('='.repeat(80));
  console.log('Invalid Examples (should return errors)');
  console.log('='.repeat(80));

  const invalidExamples = [
    { name: 'Invalid 1: Months out of range', data: invalid1 },
    { name: 'Invalid 2: Negative base price', data: invalid2 },
    { name: 'Invalid 3: Invalid promo code', data: invalid3 },
    { name: 'Invalid 4: Negative canceled classes', data: invalid4 },
    { name: 'Invalid 5: Negative refund per class', data: invalid5 },
    { name: 'Invalid 6: Invalid course type', data: invalid6 },
    { name: 'Invalid 7: Months = 0', data: invalid7 },
    { name: 'Invalid 8: Decimal months', data: invalid8 },
  ];

  for (const example of invalidExamples) {
    console.log(`\n${example.name}`);
    console.log('-'.repeat(80));
    console.log('Input:', JSON.stringify(example.data, null, 2));

    try {
      const response = await fetch('http://localhost:3000/api/invoice-calculator/calculate', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer YOUR_TOKEN_HERE',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(example.data),
      });

      const result = await response.json();
      console.log('Output:', JSON.stringify(result, null, 2));
    } catch (error) {
      console.error('Error:', error);
    }
  }
}

// Uncomment to run tests
// testInvoiceCalculator();
