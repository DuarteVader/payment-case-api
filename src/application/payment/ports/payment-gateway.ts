import { Payment } from '../../../domain/payment/entities/payment';

export interface CheckoutResult {
  externalId: string;
  checkoutUrl: string;
}

export interface PaymentStatusResult {
  externalReference: string | null;
  status: string;
}

export interface PaymentGateway {
  createCheckout(payment: Payment): Promise<CheckoutResult>;

  getPaymentStatus(paymentId: string): Promise<PaymentStatusResult>;
}
