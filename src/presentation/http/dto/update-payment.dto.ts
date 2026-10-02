import { IsEnum, IsOptional, IsString } from 'class-validator';

import { PaymentStatus } from '../../../domain/payment/enums/payment-status.enum';

export class UpdatePaymentDto {
  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;
}
