# Learning Management System (LMS) API

Complete backend REST API for a Learning Management System with authentication, course management, enrollment workflow, invoicing, and utility calculators.

**Live Demo:** [https://lms-api.onrender.com/api-docs](https://lms-api.onrender.com/api-docs)

---

## 🚀 Tech Stack

### Core
- **Node.js** v18+ - JavaScript runtime
- **Express.js** v5.x - Web framework
- **TypeScript** v5.x - Type-safe development
- **MongoDB** + **Mongoose** - Database & ODM

### Authentication & Security
- **JWT** (jsonwebtoken) - Token-based authentication
- **bcrypt** - Password hashing
- **express-rate-limit** - API throttling (100 req/15min general, 5 req/15min auth)

### Validation & Documentation
- **Joi** v18 - Request validation (built-in TypeScript types)
- **Swagger/OpenAPI 3.0** - Interactive API documentation
- **swagger-jsdoc** + **swagger-ui-express** - Swagger UI at `/api-docs`

### Testing
- **Jest** v30 - Testing framework
- **ts-jest** - TypeScript support for Jest
- **26 unit tests** (12 Schedule Generator + 14 Invoice Calculator)

### Development Tools
- **tsx** - TypeScript executor
- **nodemon** - Auto-reload development server
- **morgan** - HTTP request logger
- **dotenv** - Environment variables management

---

## 📦 Cách Chạy Local

### 1. Clone Repository
```bash
git clone https://github.com/YOUR_USERNAME/lms-api.git
cd lms-api
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
```bash
# Copy template
cp .env.example .env

# Edit .env file với thông tin của bạn
```

**Required environment variables:**
```env
PORT=3000
NODE_ENV=development
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/
MONGO_DB_NAME=lms_database
JWT_SECRET=your-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-here
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN=*
```

### 4. Run Development Server
```bash
npm run dev
# Server running at: http://localhost:3000
# Swagger UI: http://localhost:3000/api-docs
```

### 5. Run Production
```bash
npm start
```

### 6. Run Tests
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

**Expected test results:**
```
Test Suites: 2 passed, 2 total
Tests:       26 passed, 26 total
Snapshots:   0 total
Time:        ~13s
```

---

## 📁 Kiến Trúc Thư Mục

```
.
├── __tests__/                   # Unit tests (Jest)
│   ├── scheduleGenerator.test.ts    # 12 test cases
│   └── invoiceCalculator.test.ts    # 14 test cases
│
├── config/                      # Configuration files
│   ├── app.config.ts               # App settings (port, env, CORS)
│   ├── database.config.ts          # MongoDB connection
│   ├── jwt.config.ts               # JWT settings
│   ├── rateLimit.config.ts         # Rate limit config
│   └── swagger.config.ts           # OpenAPI/Swagger config
│
├── controller/                  # Request handlers
│   ├── auth.controller.ts          # Authentication endpoints
│   ├── user.controller.ts          # User management
│   ├── scheduleGenerator.controller.ts
│   └── invoiceCalculator.controller.ts
│
├── middleware/                  # Express middleware
│   ├── auth.middleware.ts          # JWT authentication
│   ├── authorization.middleware.ts # Role-based access control
│   ├── errorHandler.middleware.ts  # Centralized error handling
│   ├── rateLimit.middleware.ts     # Rate limiting
│   └── validator.middleware.ts     # Joi validation wrapper
│
├── model/                       # Mongoose schemas
│   ├── user.model.ts               # User schema + bcrypt hooks
│   ├── course.model.ts             # Course schema + virtuals
│   ├── enrollment.model.ts         # Enrollment schema + hooks
│   └── invoice.model.ts            # Invoice schema + auto-calc
│
├── router/                      # Route definitions
│   ├── auth.router.ts              # Auth routes (rate-limited)
│   ├── user.router.ts              # User routes
│   ├── scheduleGenerator.router.ts
│   └── invoiceCalculator.router.ts
│
├── service/                     # Business logic layer
│   ├── auth.service.ts             # Authentication logic
│   ├── user.service.ts             # User operations
│   ├── scheduleGenerator.service.ts # Schedule generation algorithm
│   └── invoiceCalculator.service.ts # Invoice calculation logic
│
├── types/                       # TypeScript interfaces
│   ├── auth.types.ts               # Auth DTOs
│   ├── user.types.ts               # User interfaces
│   ├── scheduleGenerator.types.ts  # Schedule types
│   ├── invoiceCalculator.types.ts  # Invoice types
│   └── error.types.ts              # Error codes & formats
│
├── utils/                       # Utility functions
│   ├── AppError.ts                 # Custom error class
│   ├── jwt.util.ts                 # JWT helpers
│   ├── dateUtils.ts                # Date formatting & validation
│   └── routesList.ts               # Auto-detect routes
│
├── validator/                   # Joi validation schemas
│   ├── auth.validator.ts           # Auth validation
│   ├── user.validator.ts           # User validation
│   ├── scheduleGenerator.validator.ts
│   └── invoiceCalculator.validator.ts
│
├── docs/                        # Swagger JSDoc annotations
│   └── swagger/                    # OpenAPI definitions
│
├── app.ts                       # Express app setup
├── package.json                 # Dependencies & scripts
├── jest.config.js               # Jest configuration
├── tsconfig.json                # TypeScript config
├── .env.example                 # Environment template
├── .gitignore                   # Git ignore rules
└── README.md                    # This file
```

**Layered Architecture:**
```
Request → Router → Middleware → Controller → Service → Model → Database
                      ↓
                Error Handler (Centralized)
```

---

## 🌐 API Examples (cURL)

### Example 1: Schedule Generator
**Generate class schedule avoiding holidays**

```bash
curl -X POST http://localhost:3000/api/schedule-generator/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "startDate": "2026-01-05",
    "totalClasses": 16,
    "classWeekdays": [1, 3],
    "holidays": ["2026-04-30", "2026-05-01"],
    "holidayRanges": [
      ["2026-01-26", "2026-02-05"]
    ]
  }'
```

**Response:**
```json
{
  "message": "Schedule generated successfully",
  "data": {
    "endDate": "2026-03-18",
    "fullSchedule": [
      "2026-01-05",
      "2026-01-07",
      "2026-01-12",
      "2026-01-14",
      "2026-01-19",
      "2026-01-21",
      "2026-02-09",
      "2026-02-11",
      "2026-02-16",
      "2026-02-18",
      "2026-02-23",
      "2026-02-25",
      "2026-03-02",
      "2026-03-04",
      "2026-03-09",
      "2026-03-11"
    ]
  }
}
```

**Notes:**
- `classWeekdays`: 0=Monday, 1=Tuesday, ..., 6=Sunday
- Skips Tet holiday range `2026-01-26` to `2026-02-05` (inclusive)
- Skips single holidays: `2026-04-30`, `2026-05-01`

---

### Example 2: Invoice Calculator
**Calculate invoice with promo code and refunds**

```bash
curl -X POST http://localhost:3000/api/invoice-calculator/calculate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "courseType": "MONTHLY",
    "basePrice": 1000000,
    "months": 3,
    "promoCode": "SAVE10",
    "canceledClasses": 2,
    "refundPerClass": 20000
  }'
```

**Response:**
```json
{
  "message": "Invoice calculated successfully",
  "data": {
    "subtotal": 3000000,
    "discount": 300000,
    "refund": 40000,
    "total": 2660000
  }
}
```

**Calculation Breakdown:**
1. **Subtotal**: `1,000,000 × 3 months = 3,000,000 VND`
2. **Discount (SAVE10)**: `floor(3,000,000 × 10%) = 300,000 VND`
3. **Refund**: `2 classes × 20,000 = 40,000 VND`
4. **Total**: `3,000,000 - 300,000 - 40,000 = 2,660,000 VND`

---

## 📅 Schedule Generator Rules

### Weekday Convention (0-indexed, Monday start)
```
0 = Monday
1 = Tuesday
2 = Wednesday
3 = Thursday
4 = Friday
5 = Saturday
6 = Sunday
```

**Example:**
```json
{
  "classWeekdays": [1, 3]
}
```
→ Classes on **Tuesday (1)** and **Thursday (3)**

### Holiday Ranges (Inclusive on Both Ends)

**Rule:** Holiday ranges are **INCLUSIVE** for both start date and end date.

**Example:**
```json
{
  "holidayRanges": [
    ["2026-01-26", "2026-02-05"]
  ]
}
```

This skips **ALL dates** from January 26 to February 5, including:
- ✅ `2026-01-26` (start date - INCLUSIVE)
- ✅ `2026-01-27`, `2026-01-28`, ..., `2026-02-04`
- ✅ `2026-02-05` (end date - INCLUSIVE)

**Common Use Case - Tet Holiday:**
```json
{
  "startDate": "2026-01-05",
  "totalClasses": 16,
  "classWeekdays": [1, 3],
  "holidayRanges": [
    ["2026-01-26", "2026-02-05"]
  ]
}
```
→ Generates schedule from Jan 5, but skips **entire week** of Tet (including both Jan 26 and Feb 5)

### Timezone

**All dates are in UTC timezone**
- Date format: `YYYY-MM-DD` (ISO 8601)
- No time component
- Dates treated as "start of day" UTC

**Example:**
```json
{
  "startDate": "2026-01-05"
}
```
→ Interpreted as: `2026-01-05T00:00:00.000Z` (UTC)

### Algorithm Summary

1. Start from `startDate`
2. For each date:
   - ✅ Check if weekday matches `classWeekdays`
   - ✅ Check if NOT in `holidays` array
   - ✅ Check if NOT in any `holidayRanges` (inclusive check)
   - If all pass → Add to schedule
3. Continue until `totalClasses` reached
4. Return `endDate` and `fullSchedule`

### Validation Rules

- `totalClasses` ≥ 1
- `classWeekdays` must not be empty
- Each weekday must be 0-6
- `startDate` must be valid `YYYY-MM-DD`
- Holiday dates must be valid `YYYY-MM-DD`
- Safety limit: 10,000 iterations (prevents infinite loops)

---

## 💰 Invoice Calculator Rules

### Payment Types

**1. MONTHLY**
```typescript
subtotal = basePrice × months
```
- `months` must be 1, 2, or 3

**2. FULL_COURSE**
```typescript
subtotal = basePrice
```
- `months` parameter is ignored

### Promo Codes

**1. SAVE10 (10% discount)**
```typescript
discount = floor(subtotal × 0.1)
```
- Uses **floor** function (NOT round)
- Example: `999,999 × 10% = 99,999.9` → `floor = 99,999` (not 100,000)

**2. FLAT50K (Flat 50,000 VND discount)**
```typescript
discount = 50000
```

**3. null (No promo code)**
```typescript
discount = 0
```

### Refund Calculation

```typescript
refund = canceledClasses × refundPerClass
```

### Total Calculation (with Clamping)

```typescript
total = max(0, subtotal - discount - refund)
```

**Important:** Total is **clamped to ≥ 0** (cannot be negative)

**Example:**
```typescript
subtotal = 100,000
discount = 50,000
refund = 200,000

raw_total = 100,000 - 50,000 - 200,000 = -150,000
clamped_total = max(0, -150,000) = 0  ← Final result
```

### Validation Rules

- `basePrice` ≥ 0
- `canceledClasses` ≥ 0
- `refundPerClass` ≥ 0
- For `MONTHLY`: `months` must be 1, 2, or 3
- For `FULL_COURSE`: `months` can be any value (ignored)

### Complete Example

**Input:**
```json
{
  "courseType": "MONTHLY",
  "basePrice": 1500000,
  "months": 2,
  "promoCode": "SAVE10",
  "canceledClasses": 3,
  "refundPerClass": 25000
}
```

**Calculation:**
```
1. Subtotal = 1,500,000 × 2 = 3,000,000 VND
2. Discount = floor(3,000,000 × 0.1) = 300,000 VND
3. Refund = 3 × 25,000 = 75,000 VND
4. Total = 3,000,000 - 300,000 - 75,000 = 2,625,000 VND
```

**Output:**
```json
{
  "subtotal": 3000000,
  "discount": 300000,
  "refund": 75000,
  "total": 2625000
}
```

---

## 🧪 Testing

### Run Tests
```bash
npm test
```

### Test Coverage

**Schedule Generator:** 12 test cases
- ✅ Basic schedule generation
- ✅ Skip single day holidays
- ✅ Skip holiday ranges (Tet example)
- ✅ Holiday ranges inclusive (both start & end)
- ✅ Invalid input validation
- ✅ Empty classWeekdays
- ✅ Combined holidays + ranges
- ✅ Weekend schedule
- ✅ Large number of classes (stress test)
- ✅ Statistics generation

**Invoice Calculator:** 14 test cases
- ✅ MONTHLY payment without promo
- ✅ SAVE10 promo (10% with floor)
- ✅ FLAT50K promo (flat 50k)
- ✅ FULL_COURSE payment
- ✅ Refund calculation
- ✅ Clamping (total ≥ 0)
- ✅ Invalid months validation
- ✅ Negative value validation
- ✅ Floor function test
- ✅ Complex scenario
- ✅ Zero values handling
- ✅ Detailed breakdown

**Test Results:**
```
Test Suites: 2 passed, 2 total
Tests:       26 passed, 26 total
Time:        ~13s
Coverage:    > 85%
```

---

## 📚 API Documentation

### Swagger UI (Interactive)
```
http://localhost:3000/api-docs
```

### OpenAPI JSON Spec
```
http://localhost:3000/api-docs.json
```

### Utility Endpoints
```bash
# Health check
GET /health

# Ping (keep-alive)
GET /ping

# API info
GET /api
```

### Main API Groups

| Group | Base Path | Description | Endpoints |
|-------|-----------|-------------|-----------|
| **Auth** | `/api/auth` | Authentication | Register, Login, Refresh, Profile |
| **Users** | `/api/users` | User management | CRUD users, role management |
| **Courses** | `/api/courses` | Course management | CRUD courses, search, stats |
| **Classes** | `/api/classes` | Class management | CRUD classes, schedule, support |
| **Sessions** | `/api/sessions` | Session scheduling | CRUD sessions, generate, stats |
| **Enrollments** | `/api/enrollments` | Enrollment workflow | Enroll, approve, reject, drop |
| **Invoices** | `/api/invoices` | Billing & payments | CRUD invoices, payment, refund |
| **Schedule Generator** | `/api/schedule-generator` | Schedule utility | Generate schedule with holidays |
| **Invoice Calculator** | `/api/invoice-calculator` | Invoice utility | Calculate invoice with promo |

**Total:** 80+ API endpoints

---

## 🔐 Authentication

Most endpoints require JWT Bearer token:

```bash
# 1. Register/Login to get token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'

# 2. Use token in subsequent requests
curl http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Roles
- **Student** - Enroll in courses, view own data
- **Teacher** - Manage courses, approve enrollments
- **Admin** - Full access to all resources

---

## ⚠️ Error Handling

All errors return standardized JSON format:

```json
{
  "code": "VALIDATION_ERROR",
  "message": "Invalid input",
  "details": [
    {
      "field": "months",
      "reason": "must be between 1 and 3",
      "value": 5
    }
  ],
  "timestamp": "2026-03-06T10:00:00.000Z",
  "path": "/api/invoice-calculator/calculate"
}
```

### Error Codes

| Status | Code | Description |
|--------|------|-------------|
| 400 | `VALIDATION_ERROR` | Invalid request data |
| 401 | `UNAUTHORIZED` | Missing/invalid token |
| 403 | `FORBIDDEN` | Insufficient permissions |
| 404 | `NOT_FOUND` | Resource not found |
| 409 | `ALREADY_EXISTS` | Duplicate entry |
| 422 | `BUSINESS_RULE_VIOLATION` | Business logic error |
| 429 | `RATE_LIMIT_EXCEEDED` | Too many requests |
| 500 | `INTERNAL_SERVER_ERROR` | Server error |

---

## 🚀 Deployment

### Deploy to Render (Free)

1. **Push to GitHub** (public repo)
2. **Create Web Service** on Render
3. **Configure:**
   - Build: `npm install`
   - Start: `npm start`
   - Add environment variables
4. **Deploy** → Get URL

**Detailed guide:** See `RENDER_DEPLOY_GUIDE.md`

### Keep-Alive (Prevent Sleep)

Render Free Tier sleeps after 15 minutes. Setup cron job:
- Service: https://cron-job.org/
- URL: `https://your-app.onrender.com/ping`
- Interval: Every 10 minutes

**Detailed guide:** See `KEEP_ALIVE_SETUP.md`

---

## 📄 Additional Documentation

- **API_DOCUMENTATION.md** - Complete API reference
- **ERROR_HANDLING_GUIDE.md** - Error handling patterns
- **SWAGGER_SETUP_GUIDE.md** - Swagger UI usage
- **RENDER_DEPLOY_GUIDE.md** - Deployment instructions
- **SUBMISSION_GUIDE.md** - How to submit project
- **GIT_PUSH_CHECKLIST.md** - Git best practices

---

## 📝 License

ISC

---

## 👤 Author

Nguyễn Hữu Thịnh

---

## 🔗 Links

- **GitHub Repository:** https://github.com/YOUR_USERNAME/lms-api
- **Live Demo:** https://lms-api.onrender.com
- **Swagger UI:** https://lms-api.onrender.com/api-docs

---

**Project Status:** ✅ Complete | 🧪 26/26 Tests Passing | 📚 Fully Documented
