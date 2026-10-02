import { Inject, Injectable } from '@nestjs/common';

import type { PaymentRepository } from '../../../domain/payment/repositories/payment.repository';

import type { PaymentGateway } from '../ports/payment-gateway';

import { PAYMENT_GATEWAY, PAYMENT_REPOSITORY } from '../tokens';

interface ProcessWebhookInput {
  type: string;

  data: {
    id: string;
  };
}

@Injectable()
export class ProcessPaymentWebhookUseCase {
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: PaymentRepository,

    @Inject(PAYMENT_GATEWAY)
    private readonly paymentGateway: PaymentGateway,
  ) {}

  async execute(input: ProcessWebhookInput) {
    if (input.type !== 'payment') {
      return {
        received: true,
      };
    }

    const mercadoPagoPayment = await this.paymentGateway.getPaymentStatus(
      input.data.id,
    );

    if (!mercadoPagoPayment.externalReference) {
      return {
        received: true,
      };
    }

    const payment = await this.paymentRepository.findById(
      mercadoPagoPayment.externalReference,
    );

    if (!payment) {
      return {
        received: true,
      };
    }

    if (mercadoPagoPayment.status === 'approved') {
      payment.markAsPaid();
    }

    if (
      mercadoPagoPayment.status === 'rejected' ||
      mercadoPagoPayment.status === 'cancelled'
    ) {
      payment.markAsFailed();
    }

    await this.paymentRepository.update(payment);

    return {
      received: true,
    };
  }
}
