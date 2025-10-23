import { CampaignEntity, CampaignVoucherRedeemEntity } from '@app-entities';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';

import { CreateCampaignRequestDto, RedeemVoucherRequestDto } from './request-dto';

export enum RedeemVoucherStatus {
  REDEEMED = 'REDEEMED',
  ALREADY_REDEEMED = 'ALREADY_REDEEMED',
  SOLD_OUT = 'SOLD_OUT',
}

@Injectable()
export class CampaignService {
  constructor(
    @InjectRepository(CampaignEntity) private readonly campaignRepository: Repository<CampaignEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async createCampaign(dto: CreateCampaignRequestDto): Promise<CampaignEntity> {
    return this.campaignRepository.save({
      name: dto.name,
      total: dto.total,
      redeemed: 0,
      createdAt: new Date(),
    });
  }

  async getCampaign(id: string): Promise<CampaignEntity> {
    const campaign = await this.campaignRepository.findOne({ where: { id } });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    return campaign;
  }

  async redeemVoucher(campaignId: string, dto: RedeemVoucherRequestDto) {
    return this.dataSource.transaction(async (manager) => {
      const campaignRedeemVoucherRepository = manager.getRepository(CampaignVoucherRedeemEntity);
      const campaignRepository = manager.getRepository(CampaignEntity);

      const campaign = await campaignRepository.findOne({
        where: { id: campaignId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!campaign) {
        throw new NotFoundException('Campaign not found');
      }

      const userRedeem = await campaignRedeemVoucherRepository.findOne({
        where: { campaignId, userId: dto.userId },
      });

      if (userRedeem) {
        if (userRedeem.idempotencyKey === dto.idempotencyKey) {
          return { status: RedeemVoucherStatus.REDEEMED };
        } else {
          return { status: RedeemVoucherStatus.ALREADY_REDEEMED };
        }
      }

      if (campaign.total - campaign.redeemed <= 0) {
        return { status: RedeemVoucherStatus.SOLD_OUT };
      }

      await campaignRedeemVoucherRepository.save({
        campaignId,
        userId: dto.userId,
        idempotencyKey: dto.idempotencyKey,
      });

      await campaignRepository.update({ id: campaignId }, { redeemed: campaign.redeemed + 1 });

      return { status: RedeemVoucherStatus.REDEEMED };
    });
  }
}
