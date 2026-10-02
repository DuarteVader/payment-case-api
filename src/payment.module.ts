import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CreatePaymentUseCase } from './application/payment/use-cases/create-payment.use-case';
import { GetPaymentUseCase } from './application/payment/use-cases/get-payment.use-case';
import { ListPaymentsUseCase } from './application/payment/use-cases/list-payments.use-case';
import { UpdatePaymentUseCase } from './application/payment/use-cases/update-payment.use-case';
import { ProcessPaymentWebhookUseCase } from './application/payment/use-cases/process-payment-webhook.use-case';

import {
  PAYMENT_GATEWAY,
  PAYMENT_REPOSITORY,
} from './application/payment/tokens';

import { PaymentOrmEntity } from './infrastructure/database/entities/payment.orm-entity';
import { TypeOrmPaymentRepository } from './infrastructure/database/repositories/typeorm-payment.repository';
import { MercadoPagoGateway } from './infrastructure/integrations/mercado-pago/mercado-pago.gateway';

import { PaymentController } from './presentation/http/controllers/payment.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentOrmEntity])],

  controllers: [PaymentController],

  providers: [
    CreatePaymentUseCase,
    GetPaymentUseCase,
    ListPaymentsUseCase,
    UpdatePaymentUseCase,
    ProcessPaymentWebhookUseCase,

    {
      provide: PAYMENT_REPOSITORY,
      useClass: TypeOrmPaymentRepository,
    },

    {
      provide: PAYMENT_GATEWAY,
      useClass: MercadoPagoGateway,
    },
  ],
})
export class PaymentModule {}
