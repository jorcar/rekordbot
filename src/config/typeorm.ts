import { registerAs } from '@nestjs/config';
// import { config as dotenvConfig } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';
import configuration, { toConnectionString } from './configuration';

//dotenvConfig({ path: '.env' });

const db_config = configuration().database;

const config = {
  type: 'postgres',
  url: toConnectionString(db_config),
  entities: ['src/**/*.entity{.ts,.js}'],
  migrations: ['src/migrations/*{.ts,.js}'],
  autoLoadEntities: true,
  synchronize: false,
  logging: true,
};

export default registerAs('typeorm', () => config);
export const connectionSource = new DataSource(config as DataSourceOptions);
