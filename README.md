# 🎫 Atomic Voucher Redemption API

NestJS service for managing voucher campaigns with guaranteed concurrency safety and idempotent operations.

---

# Installation & Running
## Start the application
```docker-compose up app postgres```

## Run database migrations
```docker-compose run --rm node-runner npm run migration:up```

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

# 🧪 Run E2E tests
```docker-compose -f docker-compose.yml run --rm node-runner```

# 🧪 Run K6 Tests

```
cd k6
npm install && npm run build
npm run load    # Load test (50-100 users)
npm run stress  # Stress test (100-200 users)
```
# 📈 K6 Metric Results
```
Requests	272,084
Error Rate	0%
99th Percentile	893ms
Throughput	283 req/s
Max Users	200 VUs
```
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