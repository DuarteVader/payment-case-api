import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export function databaseConfig(config: ConfigService): TypeOrmModuleOptions {
  return {
    type: 'postgres',

    host: config.getOrThrow('DB_HOST'),

    port: Number(config.getOrThrow('DB_PORT')),

    username: config.getOrThrow('DB_USERNAME'),

    password: config.getOrThrow('DB_PASSWORD'),

    database: config.getOrThrow('DB_DATABASE'),

    autoLoadEntities: true,

    synchronize: false,
  };
}
