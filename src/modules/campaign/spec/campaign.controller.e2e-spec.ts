import { HttpStatus } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import { Repository } from 'typeorm';

import { CampaignEntity, CampaignVoucherRedeemEntity } from '@app-entities';

import { TestApp } from '../../../test.app';
import { CreateCampaignRequestDto } from '../request-dto/create-campaign.request-dto';
import { RedeemVoucherStatus } from '../campaign.service';

describe('CampaignController (e2e)', () => {
  let testApp: TestApp;
  let campaignRepo: Repository<CampaignEntity>;
  let redeemRepo: Repository<CampaignVoucherRedeemEntity>;

  beforeAll(async () => {
    testApp = await TestApp.beforeAll();
    campaignRepo = testApp.application.get(getRepositoryToken(CampaignEntity));
    redeemRepo = testApp.application.get(getRepositoryToken(CampaignVoucherRedeemEntity));
  });

  beforeEach(async () => {
    await redeemRepo.deleteAll();
    await campaignRepo.deleteAll();
  });

  afterAll(async () => {
    await testApp.afterAll();
  });

  const post = (url: string, body?: any) => request(testApp.application.getHttpServer()).post(url).send(body);

  const get = (url: string) => request(testApp.application.getHttpServer()).get(url);

  describe('POST /campaigns', () => {
    it('should create a campaign successfully', async () => {
      const dto: CreateCampaignRequestDto = { name: 'Black Friday 2025', total: 10 };

      const res = await post('/campaigns', dto).expect(HttpStatus.OK);

      expect(res.body).toMatchObject({
        name: 'Black Friday 2025',
        total: 10,
        redeemed: 0,
        remaining: 10,
      });

      const dbCampaign = await campaignRepo.findOneBy({ id: res.body.id });

      expect(dbCampaign).toBeDefined();
    });
  });

  describe('GET /campaigns/:id', () => {
    it('should return campaign summary', async () => {
      const campaign = await campaignRepo.save({
        name: 'Summary Test',
        total: 5,
        redeemed: 2,
      });

      const res = await get(`/campaigns/${campaign.id}`).expect(HttpStatus.OK);

      expect(res.body).toEqual({
        id: campaign.id,
        name: 'Summary Test',
        total: 5,
        redeemed: 2,
        remaining: 3,
      });
    });
  });

  describe('POST /campaigns/:id/redeem', () => {
    it('should redeem successfully', async () => {
      const campaign = await campaignRepo.save({ name: 'Redeem Test', total: 3, redeemed: 0 });
      const body = { userId: crypto.randomUUID(), idempotencyKey: crypto.randomUUID() };

      const res = await post(`/campaigns/${campaign.id}/redeem`, body);

      expect(res.body.status).toBe('REDEEMED');

      const updated = await campaignRepo.findOneBy({ id: campaign.id });

      expect(updated!.redeemed).toBe(1);
    });

    it(`should return ${RedeemVoucherStatus.ALREADY_REDEEMED} if same user tries again with new idempotencyKey`, async () => {
      const campaign = await campaignRepo.save({ name: 'Double Test', total: 2, redeemed: 0 });

      const userUuid = crypto.randomUUID();

      await post(`/campaigns/${campaign.id}/redeem`, { userId: userUuid, idempotencyKey: crypto.randomUUID() }).expect(HttpStatus.OK);

      const res = await post(`/campaigns/${campaign.id}/redeem`, { userId: userUuid, idempotencyKey: crypto.randomUUID() }).expect(HttpStatus.OK);

      expect(res.body.status).toBe('ALREADY_REDEEMED');
    });

    it(`should return ${RedeemVoucherStatus.REDEEMED} for idempotent retry with same key`, async () => {
      const campaign = await campaignRepo.save({ name: 'Retry Campaign', total: 5, redeemed: 0 });
      const idempotencyKey = crypto.randomUUID();

      const body = { userId: crypto.randomUUID(), idempotencyKey };
      const first = await post(`/campaigns/${campaign.id}/redeem`, body).expect(HttpStatus.OK);
      const second = await post(`/campaigns/${campaign.id}/redeem`, body).expect(HttpStatus.OK);

      expect(first.body.status).toBe('REDEEMED');
      expect(second.body.status).toBe('REDEEMED');
    });

    it(`should return ${RedeemVoucherStatus.SOLD_OUT} when vouchers exhausted`, async () => {
      const campaign = await campaignRepo.save({ name: 'SoldOut', total: 1, redeemed: 1 });
      const res = await post(`/campaigns/${campaign.id}/redeem`, { userId: crypto.randomUUID(), idempotencyKey: crypto.randomUUID() }).expect(
        HttpStatus.OK,
      );

      expect(res.body.status).toBe('SOLD_OUT');
    });

    it('should handle concurrent redemption correctly', async () => {
      const campaign = await campaignRepo.save({ name: 'Concurrent', total: 5, redeemed: 0 });

      const results = await Promise.all(
        Array.from({ length: 10 }).map(() =>
          post(`/campaigns/${campaign.id}/redeem`, {
            userId: crypto.randomUUID(),
            idempotencyKey: crypto.randomUUID(),
          }),
        ),
      );

      const statuses = results.map((r) => r.body.status);
      const redeemed = statuses.filter((s) => s === 'REDEEMED').length;
      const soldOut = statuses.filter((s) => s === 'SOLD_OUT').length;

      expect(redeemed).toBe(5);
      expect(soldOut).toBe(5);
    });
  });
});
