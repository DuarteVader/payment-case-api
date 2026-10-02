import { Payment } from '../entities/payment';
import { PaymentMethod } from '../enums/payment-method.enum';

export interface PaymentFilters {
  cpf?: string;
  paymentMethod?: PaymentMethod;
}

export interface PaymentRepository {
  create(payment: Payment): Promise<Payment>;

  update(payment: Payment): Promise<Payment>;

  findById(id: string): Promise<Payment | null>;

  findByExternalId(externalId: string): Promise<Payment | null>;

  findAll(filters?: PaymentFilters): Promise<Payment[]>;
}
