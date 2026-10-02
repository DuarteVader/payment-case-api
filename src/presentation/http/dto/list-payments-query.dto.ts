import { IsEnum, IsOptional, IsString } from 'class-validator';

import { PaymentMethod } from '../../../domain/payment/enums/payment-method.enum';

export class ListPaymentsQueryDto {
  @IsOptional()
  @IsString()
  cpf?: string;

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;
}
