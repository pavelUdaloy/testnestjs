export * from './campaign';

import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CampaignEntity, CampaignVoucherRedeemEntity } from './campaign';

const entities = [CampaignEntity, CampaignVoucherRedeemEntity];

@Global()
@Module({
  controllers: [],
  exports: [TypeOrmModule],
  imports: [TypeOrmModule.forFeature(entities)],
  providers: [],
})
export class TypeormEntitiesModule {}
