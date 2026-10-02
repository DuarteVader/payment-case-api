import { Inject, Injectable } from '@nestjs/common';

import { PaymentMethod } from '../../../domain/payment/enums/payment-method.enum';
import type { PaymentRepository } from '../../../domain/payment/repositories/payment.repository';
import { PAYMENT_REPOSITORY } from '../tokens';

interface ListPaymentsInput {
  cpf?: string;
  paymentMethod?: PaymentMethod;
}

@Injectable()
export class ListPaymentsUseCase {
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: PaymentRepository,
  ) {}

  execute(filters: ListPaymentsInput) {
    return this.paymentRepository.findAll(filters);
  }
}
