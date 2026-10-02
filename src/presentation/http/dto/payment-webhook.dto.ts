import { Type } from 'class-transformer';

import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class PaymentWebhookDataDto {
  @IsString()
  id!: string;
}

export class PaymentWebhookDto {
  @IsOptional()
  @IsString()
  action?: string;

  @IsOptional()
  @IsString()
  api_version?: string;

  @ValidateNested()
  @Type(() => PaymentWebhookDataDto)
  data!: PaymentWebhookDataDto;

  @IsOptional()
  @IsString()
  date_created?: string;

  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsBoolean()
  live_mode?: boolean;

  @IsString()
  type!: string;

  @IsOptional()
  @IsNumber()
  user_id?: number;
}
