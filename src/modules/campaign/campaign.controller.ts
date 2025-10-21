import { Controller, Post, Body, Param, Get } from '@nestjs/common';
import { CampaignService } from './campaign.service';
import { RedeemVoucherRequestDto, CreateCampaignRequestDto } from './request-dto';
import { GetCampaignResponseDto, CreateCampaignResponseDto, CreateRedeemVoucherRequestDto } from './response-dto';

@Controller('campaigns')
export class CampaignController {
  constructor(private readonly campaignService: CampaignService) {}

  @Post()
  async createCampaign(@Body() dto: CreateCampaignRequestDto): Promise<CreateCampaignResponseDto> {
    const result = await this.campaignService.createCampaign(dto);

    return new CreateCampaignResponseDto(result);
  }

  @Get(':id')
  async getCampaign(@Param('id') id: string): Promise<GetCampaignResponseDto> {
    const result = await this.campaignService.getCampaign(id);

    return new GetCampaignResponseDto(result);
  }

  @Post(':id/redeem')
  async redeemVoucher(@Param('id') id: string, @Body() dto: RedeemVoucherRequestDto): Promise<CreateRedeemVoucherRequestDto> {
    return this.campaignService.redeemVoucher(id, dto);
  }
}
