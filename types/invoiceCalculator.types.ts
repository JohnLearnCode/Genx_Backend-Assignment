export enum CoursePaymentType {
  MONTHLY = 'MONTHLY',
  FULL_COURSE = 'FULL_COURSE',
}

export enum PromoCodeType {
  SAVE10 = 'SAVE10',
  FLAT50K = 'FLAT50K',
}

export interface ICalcInvoiceInput {
  courseType: CoursePaymentType;
  basePrice: number;
  months: number; // Only used for MONTHLY
  promoCode: PromoCodeType | null;
  canceledClasses: number;
  refundPerClass: number;
}

export interface ICalcInvoiceOutput {
  subtotal: number;
  discount: number;
  refund: number;
  total: number;
}

export interface IInvoiceCalculatorError {
  field: string;
  message: string;
}
