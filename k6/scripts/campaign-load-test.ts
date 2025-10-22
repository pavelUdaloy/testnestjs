import { check, sleep } from 'k6';
import http from 'k6/http';
import { Options } from 'k6/options';

interface CreateCampaignResponse {
  id: string;
  name: string;
  total: number;
  redeemed: number;
  remaining: number;
}

interface RedeemVoucherResponse {
  status: 'REDEEMED' | 'SOLD_OUT' | 'ALREADY_REDEEMED';
}

interface CampaignSummaryResponse {
  id: string;
  name: string;
  total: number;
  redeemed: number;
  remaining: number;
}

interface RedeemVoucherRequest {
  userId: string;
  idempotencyKey: string;
}

interface CreateCampaignRequest {
  name: string;
  total: number;
}

export const options: Options = {
  stages: [
    { duration: '30s', target: 50 },
    { duration: '1m', target: 50 },
    { duration: '30s', target: 100 },
    { duration: '1m', target: 100 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
};

const BASE_URL = 'http://localhost:3000';

export function setup(): { campaignId: string } {
  const payload: CreateCampaignRequest = {
    name: 'K6 Load Test Campaign',
    total: 1000,
  };

  const params = {
    headers: { 'Content-Type': 'application/json' },
  };

  const response = http.post(`${BASE_URL}/campaigns`, JSON.stringify(payload), params);

  if (response.status !== 200) {
    throw new Error(`Failed to create campaign: ${response.body}`);
  }

  const campaignData = JSON.parse(response.body as string) as CreateCampaignResponse;

  return { campaignId: campaignData.id };
}

export default function (data: { campaignId: string }): void {
  const userId = generateUUID();
  const idempotencyKey = generateUUID();

  const redeemPayload: RedeemVoucherRequest = {
    userId,
    idempotencyKey,
  };

  const params = {
    headers: { 'Content-Type': 'application/json' },
  };

  const redeemResponse = http.post(`${BASE_URL}/campaigns/${data.campaignId}/redeem`, JSON.stringify(redeemPayload), params);

  check(redeemResponse, {
    'redeem status is 200': (r) => r.status === 200,
    'response has valid status': (r) => {
      const body = JSON.parse(r.body as string) as RedeemVoucherResponse;

      return ['REDEEMED', 'SOLD_OUT', 'ALREADY_REDEEMED'].includes(body.status);
    },
  });

  const campaignResponse = http.get(`${BASE_URL}/campaigns/${data.campaignId}`);

  check(campaignResponse, {
    'campaign status is 200': (r) => r.status === 200,
    'remaining vouchers non-negative': (r) => {
      const body = JSON.parse(r.body as string) as CampaignSummaryResponse;

      return body.remaining >= 0;
    },
  });

  sleep(1);
}

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c == 'x' ? r : (r & 0x3) | 0x8;

    return v.toString(16);
  });
}
