# 🎫 Atomic Voucher Redemption API

NestJS service for managing voucher campaigns with guaranteed concurrency safety and idempotent operations.

---
# Installation & Running
```
npm ci
docker-compose up -d postgres
npm run migration:up 
npm run start:dev
```
# 🧪 Run E2E tests
```docker-compose -f docker-compose.yml run --rm node-runner npm run test:e2e --runInBand```

# 🧪 Run K6 Tests

```
npm run start:dev
npm run load:500
```
# 📈 K6 Metric Results
```
Requests	74261
Error Rate	0%
99th Percentile	493ms
Throughput	352 req/s
Max Users	500 VUs
```
# 📡 API Endpoints
```Create Campaign
Create Campaign
Endpoint: POST /campaigns
Body:
{
  "name": "Black Friday 2025",
  "total": 100
}

Response:
{
  "id": "uuid",
  "name": "Black Friday 2025",
  "total": 100,
  "redeemed": 0,
  "remaining": 100
}
```
```
Redeem Voucher
Endpoint: POST /campaigns/:id/redeem
Body:
{
  "userId": "user-123",
  "idempotencyKey": "abc-xyz-123"
}

Possible Responses:
{ "status": "REDEEMED" }
{ "status": "SOLD_OUT" }
{ "status": "ALREADY_REDEEMED" }
```
```
Get Campaign Summary
Endpoint: GET /campaigns/:id
Response:
{
  "id": "uuid",
  "name": "Black Friday 2025",
  "total": 100,
  "redeemed": 83,
  "remaining": 17
}
```
# 🔒 Concurrency Protection
Pessimistic locking on campaign records

Database transactions for atomic operations

Prevents over-redemption under concurrent load

# 🔄 Idempotency
Same (userId, campaignId, idempotencyKey) = identical response

Safe for retries without double-spending

# 📋 Business Rules
✅ One voucher per user per campaign

✅ Cannot exceed campaign total

✅ Remaining vouchers never go negative

# 🛠️ Tech Stack
```
Framework: NestJS 11
Database: PostgreSQL + TypeORM
Testing: Jest + K6
Container: Docker
Language: TypeScript
```
# ✅ Requirements Met
✅ Concurrency safety - No over-redemption

✅ Idempotent operations - Safe retries

✅ Data integrity - Database constraints

✅ Clean architecture - NestJS modular structure

✅ Load testing - K6 with proven results