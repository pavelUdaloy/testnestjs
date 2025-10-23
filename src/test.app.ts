import { BadRequestException, INestApplication, ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { AppModule } from './app.module';

export class TestApp {
  constructor(private readonly _application: INestApplication) {}

  get application() {
    return this._application;
  }

  public async databaseTeardown(dataSource: DataSource) {
    const manager = dataSource.manager;

    await manager.query(`SELECT truncate_schema('public');`);
  }

  public static async beforeAll(): Promise<TestApp> {
    const appTestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRootAsync({
          useFactory: () => {
            return {
              autoLoadEntities: true,
              database: process.env.POSTGRES_DATABASE,
              dropSchema: false,
              host: process.env.POSTGRES_HOST,
              logging: false,
              password: process.env.POSTGRES_PASSWORD,
              port: Number(process.env.POSTGRES_PORT ?? 5432),
              ssl: false,
              synchronize: true,
              type: 'postgres',
              username: process.env.POSTGRES_USERNAME,
            };
          },
        }),
        AppModule,
      ],
    }).compile();

    const app = appTestingModule.createNestApplication<NestExpressApplication>();

    app.useGlobalPipes(
      new ValidationPipe({
        exceptionFactory: (errors: any) => new BadRequestException(errors),
        forbidUnknownValues: false,
        transform: true,
        whitelist: true,
      }),
    );

    await app.init();

    return new TestApp(app);
  }

  public async afterAll() {
    await this.application.close();
  }

  public async afterEach() {
    jest.restoreAllMocks();
  }
}
