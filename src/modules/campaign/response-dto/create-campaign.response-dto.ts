import { CampaignEntity } from '@app-entities';

export class CreateCampaignResponseDto {
  id: string;
  name: string;
  total: number;
  redeemed: number;
  remaining: number;

  constructor(parameters: CampaignEntity) {
    this.id = parameters.id;
    this.name = parameters.name;
    this.total = parameters.total;
    this.redeemed = parameters.redeemed;
    this.remaining = parameters.total - parameters.redeemed;
  }
}
