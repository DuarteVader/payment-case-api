import { PaymentMethod } from '../enums/payment-method.enum';
import { PaymentStatus } from '../enums/payment-status.enum';

export class Payment {
  constructor(
    public id: string,
    public cpf: string,
    public description: string,
    public amount: number,
    public paymentMethod: PaymentMethod,
    public status: PaymentStatus,
    public externalId: string | null = null,
    public checkoutUrl: string | null = null,
    public createdAt?: Date,
    public updatedAt?: Date,
  ) {}

  markAsPaid() {
    this.status = PaymentStatus.PAID;
  }

  markAsFailed() {
    this.status = PaymentStatus.FAIL;
  }
}
