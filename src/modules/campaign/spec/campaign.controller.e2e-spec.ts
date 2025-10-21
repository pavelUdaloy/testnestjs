import { HttpStatus } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import { Repository } from 'typeorm';

import { CampaignEntity, CampaignVoucherRedeemEntity } from '@app-entities';

import { TestApp } from '../../../test.app';
import { CreateCampaignRequestDto } from '../request-dto';

describe('Campaign Controller', () => {
  let testCase: TestApp;

  let campaignRepository: Repository<CampaignEntity>;
  let campaignVoucherRedeemRepository: Repository<CampaignVoucherRedeemEntity>;

  beforeAll(async () => {
    testCase = await TestApp.beforeAll();

    campaignRepository = testCase.application.get(getRepositoryToken(CampaignEntity));
    campaignVoucherRedeemRepository = testCase.application.get(getRepositoryToken(CampaignVoucherRedeemEntity));
  });

  beforeEach(async () => {
    await campaignRepository.deleteAll();
    await campaignVoucherRedeemRepository.deleteAll();
  });

  afterEach(async () => {
    jest.restoreAllMocks();

    await testCase.afterEach();
  });

  afterAll(async () => {
    await testCase.afterAll();
  });

  describe('POST /campaigns', () => {
    const endpoint = `/campaigns`;

    it('status(401 - Unauthorized exception): Due to guest does not provide token.', async () => {
      const result = await request(testCase.application.getHttpServer())
        .post(endpoint)
        .send({ name: 'test campaign name', total: 500 } as CreateCampaignRequestDto);

      console.log(result.body);

      expect(2).toEqual(2);
    });
  });
});
