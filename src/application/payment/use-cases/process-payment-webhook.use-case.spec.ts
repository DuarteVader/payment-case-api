import { Payment } from '../../../domain/payment/entities/payment';

import { PaymentMethod } from '../../../domain/payment/enums/payment-method.enum';

import { PaymentStatus } from '../../../domain/payment/enums/payment-status.enum';

import type { PaymentRepository } from '../../../domain/payment/repositories/payment.repository';

import type { PaymentGateway } from '../ports/payment-gateway';

import { ProcessPaymentWebhookUseCase } from './process-payment-webhook.use-case';

describe('ProcessPaymentWebhookUseCase', () => {
  let paymentRepository: jest.Mocked<PaymentRepository>;

  let paymentGateway: jest.Mocked<PaymentGateway>;

  let useCase: ProcessPaymentWebhookUseCase;

  beforeEach(() => {
    paymentRepository = {
      create: jest.fn(),

      update: jest.fn(async (payment) => payment),

      findById: jest.fn(),

      findByExternalId: jest.fn(),

      findAll: jest.fn(),
    };

    paymentGateway = {
      createCheckout: jest.fn(),

      getPaymentStatus: jest.fn(),
    };

    useCase = new ProcessPaymentWebhookUseCase(
      paymentRepository,
      paymentGateway,
    );
  });

  it('should mark payment as PAID when Mercado Pago returns approved', async () => {
    const payment = new Payment(
      'local-payment-id',
      '11144477735',
      'Pagamento cartão',
      199.9,
      PaymentMethod.CREDIT_CARD,
      PaymentStatus.PENDING,
    );

    paymentGateway.getPaymentStatus.mockResolvedValue({
      externalReference: payment.id,

      status: 'approved',
    });

    paymentRepository.findById.mockResolvedValue(payment);

    await useCase.execute({
      type: 'payment',

      data: {
        id: '181031463227',
      },
    });

    expect(payment.status).toBe(PaymentStatus.PAID);

    expect(paymentGateway.getPaymentStatus).toHaveBeenCalledWith(
      '181031463227',
    );

    expect(paymentRepository.update).toHaveBeenCalledWith(payment);
  });

  it('should mark payment as FAIL when Mercado Pago returns rejected', async () => {
    const payment = new Payment(
      'local-payment-id',
      '11144477735',
      'Pagamento cartão',
      199.9,
      PaymentMethod.CREDIT_CARD,
      PaymentStatus.PENDING,
    );

    paymentGateway.getPaymentStatus.mockResolvedValue({
      externalReference: payment.id,

      status: 'rejected',
    });

    paymentRepository.findById.mockResolvedValue(payment);

    await useCase.execute({
      type: 'payment',

      data: {
        id: 'payment-rejected',
      },
    });

    expect(payment.status).toBe(PaymentStatus.FAIL);

    expect(paymentRepository.update).toHaveBeenCalledWith(payment);
  });

  it('should ignore events that are not payment events', async () => {
    const result = await useCase.execute({
      type: 'other-event',

      data: {
        id: '123',
      },
    });

    expect(result).toEqual({
      received: true,
    });

    expect(paymentGateway.getPaymentStatus).not.toHaveBeenCalled();

    expect(paymentRepository.findById).not.toHaveBeenCalled();

    expect(paymentRepository.update).not.toHaveBeenCalled();
  });
});
