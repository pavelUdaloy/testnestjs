import { Column, Entity, ManyToOne, PrimaryColumn, JoinColumn, CreateDateColumn } from 'typeorm';

import { CampaignEntity } from './campaign.entity';

@Entity('campaign_voucher_redeems')
export class CampaignVoucherRedeemEntity {
  @PrimaryColumn('uuid')
  userId!: string;

  @PrimaryColumn('uuid')
  campaignId!: string;

  @ManyToOne(() => CampaignEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'campaignId', referencedColumnName: 'id' })
  campaign!: CampaignEntity;

  @Column('text', { nullable: false })
  idempotencyKey!: string;

  @CreateDateColumn()
  createdAt: Date;
}
