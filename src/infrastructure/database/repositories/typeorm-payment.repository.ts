import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Payment } from '../../../domain/payment/entities/payment';
import {
  PaymentFilters,
  PaymentRepository,
} from '../../../domain/payment/repositories/payment.repository';
import { PaymentOrmEntity } from '../entities/payment.orm-entity';
import { PaymentMethod } from '../../../domain/payment/enums/payment-method.enum';

@Injectable()
export class TypeOrmPaymentRepository implements PaymentRepository {
  constructor(
    @InjectRepository(PaymentOrmEntity)
    private readonly repository: Repository<PaymentOrmEntity>,
  ) {}

  async create(payment: Payment) {
    await this.repository.save(this.toOrm(payment));

    return payment;
  }

  async update(payment: Payment) {
    await this.repository.save(this.toOrm(payment));

    return payment;
  }

  async findById(id: string) {
    const entity = await this.repository.findOneBy({
      id,
    });

    return entity ? this.toDomain(entity) : null;
  }

  async findByExternalId(externalId: string) {
    const entity = await this.repository.findOneBy({
      externalId,
    });

    return entity ? this.toDomain(entity) : null;
  }

  async findAll(filters?: PaymentFilters) {
    const where: {
      cpf?: string;
      paymentMethod?: PaymentMethod;
    } = {};

    if (filters?.cpf) {
      where.cpf = filters.cpf;
    }

    if (filters?.paymentMethod) {
      where.paymentMethod = filters.paymentMethod;
    }

    const entities = await this.repository.find({
      where,
      order: {
        createdAt: 'DESC',
      },
    });

    return entities.map((entity) => this.toDomain(entity));
  }

  private toOrm(payment: Payment): PaymentOrmEntity {
    const entity = new PaymentOrmEntity();

    entity.id = payment.id;
    entity.cpf = payment.cpf;
    entity.description = payment.description;
    entity.amount = payment.amount.toFixed(2);
    entity.paymentMethod = payment.paymentMethod;
    entity.status = payment.status;
    entity.externalId = payment.externalId ?? null;
    entity.checkoutUrl = payment.checkoutUrl ?? null;

    return entity;
  }

  private toDomain(entity: PaymentOrmEntity): Payment {
    return new Payment(
      entity.id,
      entity.cpf,
      entity.description,
      Number(entity.amount),
      entity.paymentMethod,
      entity.status,
      entity.externalId,
      entity.checkoutUrl,
      entity.createdAt,
      entity.updatedAt,
    );
  }
}
