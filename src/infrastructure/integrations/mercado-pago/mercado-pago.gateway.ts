import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  MercadoPagoConfig,
  Payment as MercadoPagoPayment,
  Preference,
} from 'mercadopago';

import { Payment } from '../../../domain/payment/entities/payment';

import type {
  CheckoutResult,
  PaymentGateway,
  PaymentStatusResult,
} from '../../../application/payment/ports/payment-gateway';

@Injectable()
export class MercadoPagoGateway implements PaymentGateway {
  private readonly preference: Preference;

  private readonly paymentClient: MercadoPagoPayment;

  constructor(private readonly configService: ConfigService) {
    const client = new MercadoPagoConfig({
      accessToken: this.configService.getOrThrow<string>(
        'MERCADO_PAGO_ACCESS_TOKEN',
      ),
    });

    this.preference = new Preference(client);

    this.paymentClient = new MercadoPagoPayment(client);
  }

  async createCheckout(payment: Payment): Promise<CheckoutResult> {
    const webhookUrl = this.configService.get<string>(
      'MERCADO_PAGO_WEBHOOK_URL',
    );

    const body = {
      items: [
        {
          id: payment.id,
          title: payment.description,
          quantity: 1,
          unit_price: payment.amount,
          currency_id: 'BRL',
        },
      ],

      external_reference: payment.id,

      ...(webhookUrl
        ? {
            notification_url: webhookUrl,
          }
        : {}),
    };

    const result = await this.preference.create({
      body,
    });

    if (!result.id) {
      throw new Error('Mercado Pago não retornou o id da preferência');
    }

    const checkoutUrl = result.sandbox_init_point ?? result.init_point;

    if (!checkoutUrl) {
      throw new Error('Mercado Pago não retornou a URL de checkout');
    }

    return {
      externalId: result.id,
      checkoutUrl,
    };
  }

  async getPaymentStatus(paymentId: string): Promise<PaymentStatusResult> {
    const payment = await this.paymentClient.get({
      id: paymentId,
    });

    return {
      externalReference: payment.external_reference ?? null,

      status: payment.status ?? 'pending',
    };
  }
}
