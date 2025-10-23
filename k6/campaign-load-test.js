import { check, sleep } from 'k6';
import http from 'k6/http';

export const options = {
  stages: [
    { duration: '30s', target: 200 },
    { duration: '1m', target: 200 },
    { duration: '30s', target: 500 },
    { duration: '1m', target: 500 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
};

const BASE_URL = 'http://host.docker.internal:3000';

export function setup() {
  const payload = {
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

  const campaignData = JSON.parse(response.body);

  return { campaignId: campaignData.id };
}

export default function (data) {
  const userId = crypto.randomUUID();
  const idempotencyKey = crypto.randomUUID();

  const redeemPayload = {
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
      const body = JSON.parse(r.body);

      return ['REDEEMED', 'SOLD_OUT', 'ALREADY_REDEEMED'].includes(body.status);
    },
  });

  const campaignResponse = http.get(`${BASE_URL}/campaigns/${data.campaignId}`);

  check(campaignResponse, {
    'campaign status is 200': (r) => r.status === 200,
    'remaining vouchers non-negative': (r) => {
      const body = JSON.parse(r.body);

      return body.remaining >= 0;
    },
  });

  sleep(1);
}
