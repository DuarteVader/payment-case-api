import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { PaymentStatus } from '../../../domain/payment/enums/payment-status.enum';
import type { PaymentRepository } from '../../../domain/payment/repositories/payment.repository';
import { PAYMENT_REPOSITORY } from '../tokens';

interface UpdatePaymentInput {
  description?: string;
  status?: PaymentStatus;
}

@Injectable()
export class UpdatePaymentUseCase {
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: PaymentRepository,
  ) {}

  async execute(id: string, input: UpdatePaymentInput) {
    const payment = await this.paymentRepository.findById(id);

    if (!payment) {
      throw new NotFoundException('Pagamento não encontrado');
    }

    if (input.description) {
      payment.description = input.description;
    }

    if (input.status) {
      payment.status = input.status;
    }

    return this.paymentRepository.update(payment);
  }
}
