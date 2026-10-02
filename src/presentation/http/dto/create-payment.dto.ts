import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Length,
} from 'class-validator';

import { PaymentMethod } from '../../../domain/payment/enums/payment-method.enum';

export class CreatePaymentDto {
  @IsString()
  @Length(11, 11)
  cpf: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber({
    maxDecimalPlaces: 2,
  })
  @IsPositive()
  amount: number;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;
}
