import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { Payment } from '../../../domain/payment/entities/payment';
import { PaymentMethod } from '../../../domain/payment/enums/payment-method.enum';
import { PaymentStatus } from '../../../domain/payment/enums/payment-status.enum';
import type { PaymentRepository } from '../../../domain/payment/repositories/payment.repository';
import { isValidCpf } from '../../../domain/payment/validators/cpf.validator';
import type { PaymentGateway } from '../ports/payment-gateway';
import { PAYMENT_GATEWAY, PAYMENT_REPOSITORY } from '../tokens';

interface CreatePaymentInput {
  cpf: string;
  description: string;
  amount: number;
  paymentMethod: PaymentMethod;
}

@Injectable()
export class CreatePaymentUseCase {
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: PaymentRepository,

    @Inject(PAYMENT_GATEWAY)
    private readonly paymentGateway: PaymentGateway,
  ) {}

  async execute(input: CreatePaymentInput): Promise<Payment> {
    if (!isValidCpf(input.cpf)) {
      throw new BadRequestException('CPF inválido');
    }

    const payment = new Payment(
      randomUUID(),
      input.cpf,
      input.description,
      input.amount,
      input.paymentMethod,
      PaymentStatus.PENDING,
    );

    await this.paymentRepository.create(payment);

    if (payment.paymentMethod === PaymentMethod.CREDIT_CARD) {
      const checkout = await this.paymentGateway.createCheckout(payment);

      payment.externalId = checkout.externalId;
      payment.checkoutUrl = checkout.checkoutUrl;;

      await this.paymentRepository.update(payment);
    }

    return payment;
  }
}
