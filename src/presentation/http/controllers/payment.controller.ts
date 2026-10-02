import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';

import { CreatePaymentUseCase } from '../../../application/payment/use-cases/create-payment.use-case';
import { GetPaymentUseCase } from '../../../application/payment/use-cases/get-payment.use-case';
import { ListPaymentsUseCase } from '../../../application/payment/use-cases/list-payments.use-case';
import { UpdatePaymentUseCase } from '../../../application/payment/use-cases/update-payment.use-case';
import { ProcessPaymentWebhookUseCase } from '../../../application/payment/use-cases/process-payment-webhook.use-case';

import { CreatePaymentDto } from '../dto/create-payment.dto';
import { ListPaymentsQueryDto } from '../dto/list-payments-query.dto';
import { UpdatePaymentDto } from '../dto/update-payment.dto';
import { PaymentWebhookDto } from '../dto/payment-webhook.dto';

@Controller('api/payment')
export class PaymentController {
  constructor(
    private readonly createPayment: CreatePaymentUseCase,

    private readonly getPayment: GetPaymentUseCase,

    private readonly listPayments: ListPaymentsUseCase,

    private readonly updatePayment: UpdatePaymentUseCase,

    private readonly processWebhook: ProcessPaymentWebhookUseCase,
  ) {}

  @Post()
  create(
    @Body()
    body: CreatePaymentDto,
  ) {
    return this.createPayment.execute(body);
  }

  @Get()
  findAll(
    @Query()
    query: ListPaymentsQueryDto,
  ) {
    return this.listPayments.execute(query);
  }

  @Get(':id')
  findOne(
    @Param('id')
    id: string,
  ) {
    return this.getPayment.execute(id);
  }

  @Put(':id')
  update(
    @Param('id')
    id: string,

    @Body()
    body: UpdatePaymentDto,
  ) {
    return this.updatePayment.execute(id, body);
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  webhook(
    @Body()
    body: PaymentWebhookDto,
  ) {
    return this.processWebhook.execute(body);
  }
}
