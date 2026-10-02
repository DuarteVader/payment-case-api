import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePayments1800000000000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE payment_method_enum
      AS ENUM ('PIX', 'CREDIT_CARD')
    `);

    await queryRunner.query(`
      CREATE TYPE payment_status_enum
      AS ENUM ('PENDING', 'PAID', 'FAIL')
    `);

    await queryRunner.query(`
      CREATE TABLE payments (
        id UUID PRIMARY KEY,

        cpf VARCHAR(11) NOT NULL,

        description VARCHAR(255) NOT NULL,

        amount NUMERIC(12, 2) NOT NULL,

        payment_method payment_method_enum NOT NULL,

        status payment_status_enum NOT NULL,

        external_id VARCHAR(255),

        checkout_url TEXT,

        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`
      CREATE INDEX idx_payments_cpf
      ON payments(cpf)
    `);

    await queryRunner.query(`
      CREATE INDEX idx_payments_payment_method
      ON payments(payment_method)
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS payments
    `);

    await queryRunner.query(`
      DROP TYPE IF EXISTS payment_status_enum
    `);

    await queryRunner.query(`
      DROP TYPE IF EXISTS payment_method_enum
    `);
  }
}
