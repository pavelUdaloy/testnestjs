import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('campaigns')
export class CampaignEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('text', { nullable: false, unique: true })
  name!: string;

  @Column('int', { nullable: false })
  total!: number;

  @Column('int', { nullable: false, default: 0 })
  redeemed!: number;

  @CreateDateColumn()
  createdAt: Date;
}
