import { check } from 'k6';
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

export const options: Options = {
  stages: [
    { duration: '2m', target: 100 },
    { duration: '5m', target: 100 },
    { duration: '2m', target: 200 },
    { duration: '5m', target: 200 },
    { duration: '2m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(99)<1000'],
    http_req_failed: ['rate<0.005'],
  },
};

const BASE_URL = 'http://localhost:3000';

export function setup(): { campaignId: string } {
  const payload = {
    name: 'K6 Stress Test Campaign',
    total: 5000,
  };

  const response = http.post(`${BASE_URL}/campaigns`, JSON.stringify(payload), { headers: { 'Content-Type': 'application/json' } });

  const campaignData = JSON.parse(response.body as string) as CreateCampaignResponse;

  return { campaignId: campaignData.id };
}

export default function (data: { campaignId: string }): void {
  const userId = generateUUID();
  const idempotencyKey = generateUUID();

  const response = http.post(`${BASE_URL}/campaigns/${data.campaignId}/redeem`, JSON.stringify({ userId, idempotencyKey }), {
    headers: { 'Content-Type': 'application/json' },
  });

  check(response, {
    'redeem successful': (r) => r.status === 200,
    'correct response format': (r) => {
      const body = JSON.parse(r.body as string) as RedeemVoucherResponse;

      return ['REDEEMED', 'SOLD_OUT', 'ALREADY_REDEEMED'].includes(body.status);
    },
  });
}

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c == 'x' ? r : (r & 0x3) | 0x8;

    return v.toString(16);
  });
}
