import 'dotenv/config';

import { DataSource } from 'typeorm';

import { PaymentOrmEntity } from './entities/payment.orm-entity';
import { CreatePayments1800000000000 } from './migrations/1800000000000-CreatePayments';

export default new DataSource({
  type: 'postgres',

  host: process.env.DB_HOST ?? 'localhost',

  port: Number(process.env.DB_PORT ?? 5432),

  username: process.env.DB_USERNAME ?? 'payments_user',

  password: process.env.DB_PASSWORD ?? 'payments_password',

  database: process.env.DB_DATABASE ?? 'payments',

  synchronize: false,

  entities: [PaymentOrmEntity],

  migrations: [CreatePayments1800000000000],
});
