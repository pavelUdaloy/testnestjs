import { config } from 'dotenv';
import * as process from 'node:process';
import { DataSource, DataSourceOptions } from 'typeorm';

config();

const options = async (): Promise<DataSourceOptions> => {
  return {
    type: 'postgres',
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT),
    username: process.env.POSTGRES_USERNAME,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DATABASE,
    entities: [__dirname + '/**/*.entity.{ts,js}'],
    migrations: [__dirname + '/migrations/*.{ts,js}'],
    migrationsTableName: 'migrations',
    synchronize: false,
    logging: true,
    ssl: false,
  };
};

export default options().then((options) => new DataSource(options));
