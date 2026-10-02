import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import type { PaymentRepository } from '../../../domain/payment/repositories/payment.repository';
import { PAYMENT_REPOSITORY } from '../tokens';

@Injectable()
export class GetPaymentUseCase {
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: PaymentRepository,
  ) {}

  async execute(id: string) {
    const payment = await this.paymentRepository.findById(id);

    if (!payment) {
      throw new NotFoundException('Pagamento não encontrado');
    }

    return payment;
  }
}
