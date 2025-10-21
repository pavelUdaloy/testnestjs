import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TypeormEntitiesModule } from './core';
import { CampaignModule } from './modules/campaign/campaign.module';

@Module({
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
          synchronize: false,
          type: 'postgres',
          username: process.env.POSTGRES_USER,
        };
      },
    }),
    TypeormEntitiesModule,
    CampaignModule,
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class AppModule {}
