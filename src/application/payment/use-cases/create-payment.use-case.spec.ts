import { BadRequestException } from '@nestjs/common';

import { PaymentMethod } from '../../../domain/payment/enums/payment-method.enum';
import { PaymentStatus } from '../../../domain/payment/enums/payment-status.enum';
import type { PaymentRepository } from '../../../domain/payment/repositories/payment.repository';

import type { PaymentGateway } from '../ports/payment-gateway';

import { CreatePaymentUseCase } from './create-payment.use-case';

describe('CreatePaymentUseCase', () => {
  let paymentRepository: jest.Mocked<PaymentRepository>;
  let paymentGateway: jest.Mocked<PaymentGateway>;
  let useCase: CreatePaymentUseCase;

  beforeEach(() => {
    paymentRepository = {
      create: jest.fn(async (payment) => payment),

      update: jest.fn(async (payment) => payment),

      findById: jest.fn(),

      findByExternalId: jest.fn(),

      findAll: jest.fn(),
    };

    paymentGateway = {
      createCheckout: jest.fn(),

      getPaymentStatus: jest.fn(),
    };

    useCase = new CreatePaymentUseCase(paymentRepository, paymentGateway);
  });

  it('should create a PIX payment with PENDING status without calling Mercado Pago', async () => {
    const payment = await useCase.execute({
      cpf: '11144477735',

      description: 'Pagamento PIX',

      amount: 100,

      paymentMethod: PaymentMethod.PIX,
    });

    expect(payment.status).toBe(PaymentStatus.PENDING);

    expect(paymentRepository.create).toHaveBeenCalledTimes(1);

    expect(paymentGateway.createCheckout).not.toHaveBeenCalled();

    expect(paymentRepository.update).not.toHaveBeenCalled();
  });

  it('should create a CREDIT_CARD payment and create a checkout', async () => {
    paymentGateway.createCheckout.mockResolvedValue({
      externalId: 'preference-123',

      checkoutUrl: 'https://checkout.test/payment',
    });

    const payment = await useCase.execute({
      cpf: '11144477735',

      description: 'Pagamento cartão',

      amount: 199.9,

      paymentMethod: PaymentMethod.CREDIT_CARD,
    });

    expect(payment.status).toBe(PaymentStatus.PENDING);

    expect(payment.externalId).toBe('preference-123');

    expect(payment.checkoutUrl).toBe('https://checkout.test/payment');

    expect(paymentGateway.createCheckout).toHaveBeenCalledTimes(1);

    expect(paymentRepository.update).toHaveBeenCalledTimes(1);
  });

  it('should reject an invalid CPF', async () => {
    await expect(
      useCase.execute({
        cpf: '123',

        description: 'Pagamento inválido',

        amount: 100,

        paymentMethod: PaymentMethod.PIX,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(paymentRepository.create).not.toHaveBeenCalled();

    expect(paymentGateway.createCheckout).not.toHaveBeenCalled();
  });
});
