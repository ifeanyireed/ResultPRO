# Backend Implementation Guide - Phase 1

**Date:** February 17, 2026  
**Phase:** Complete Scaffolding Setup ✅

---

## Overview

The backend scaffolding is now complete! This document outlines what has been created and the next steps to implement Phase 1 (Authentication Endpoints).

---

## What Has Been Created

### ✅ Project Structure
```
backend/
├── src/
│   ├── config/
│   │   ├── environment.ts        # Config management
│   │   ├── database.ts            # Sequelize initialization
│   │   ├── mail.ts                # Email configuration
│   │
│   ├── middleware/
│   │   ├── auth.middleware.ts      # JWT authentication
│   │   ├── error.middleware.ts     # Error handling
│   │   ├── cors.middleware.ts      # CORS setup
│   │
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── controllers/        # Route handlers
│   │   │   ├── services/           # Business logic
│   │   │   ├── repositories/       # Data access
│   │   │   ├── dtos/               # Request/Response types
│   │   │   └── routes/auth.routes.ts
│   │   │
│   │   ├── onboarding/
│   │   │   └── routes/onboarding.routes.ts
│   │   │
│   │   └── common/
│   │       ├── services/           # Shared services
│   │       ├── exceptions/         # Custom errors
│   │
│   ├── database/
│   │   ├── models/
│   │   │   ├── School.ts          # ✅ Created
│   │   │   ├── SchoolAdminUser.ts ✅ Created
│   │   │   └── index.ts           # Model exports
│   │   └── migrations/            # Database migrations
│   │
│   ├── app.ts                    # ✅ Express app setup
│   └── server.ts                 # ✅ Server entry point
│
├── package.json                 # ✅ Dependencies
├── tsconfig.json                # ✅ TypeScript config
├── .env                         # ✅ Local config
├── .env.example                 # ✅ Config template
├── .gitignore                   # ✅ Git ignore rules
└── README.md                    # ✅ Documentation
```

### ✅ Core Files Created

**Configuration & Setup:**
- `src/config/environment.ts` - Environment configuration with defaults
- `src/config/database.ts` - Sequelize connection and initialization
- `src/config/mail.ts` - Nodemailer email service
- `package.json` - All dependencies (Express, TypeORM, JWT, etc.)
- `tsconfig.json` - TypeScript configuration with path aliases
- `.env` - Local development configuration
- `.env.example` - Config template for new developers

**Middleware:**
- `src/middleware/auth.middleware.ts` - JWT token validation
- `src/middleware/error.middleware.ts` - Global error handler
- `src/middleware/cors.middleware.ts` - CORS setup

**Database Models:**
- `src/database/models/School.ts` - School entity (fully typed)
- `src/database/models/SchoolAdminUser.ts` - School admin user entity
- Models include all fields from specification with proper relationships

**Exception Handling:**
- `src/modules/common/exceptions/app.exception.ts` - Base exception class
- `src/modules/common/exceptions/unauthorized.exception.ts` - 401 errors
- `src/modules/common/exceptions/conflict.exception.ts` - 409 errors
- `src/modules/common/exceptions/not-found.exception.ts` - 404 errors

**Main Application:**
- `src/app.ts` - Express app factory with middleware setup
- `src/server.ts` - Server startup logic

**Route Stubs:**
- `src/modules/auth/routes/auth.routes.ts` - Auth routes (ready for implementation)
- `src/modules/onboarding/routes/onboarding.routes.ts` - Onboarding routes

---

## Database Models Included

### 1. School Model
**Fields:**
- Basic: id, name, slug, motto
- Branding: logoUrl, logoEmoji, primaryColor, secondaryColor, accentColor
- Contact: contactEmail, contactPhone, contactPersonName, altContactEmail, altContactPhone
- Address: fullAddress, state, lga
- Status: status (PENDING_VERIFICATION, APPROVED, ACTIVE, etc.)
- Verification: verificationStatus, verifiedAt, verifiedBy
- Onboarding: onboardingStatus, onboardingCompletedAt, currentOnboardingStep
- Subscription: subscriptionTier, subscriptionStartDate, subscriptionEndDate, maxStudents, maxTeachers
- Timestamps: createdAt, updatedAt, deletedAt

### 2. SchoolAdminUser Model
**Fields:**
- Association: schoolId (foreign key to School)
- Auth: email, passwordHash
- Profile: fullName, phone
- Email Verification: emailVerifiedAt, emailVerificationToken, emailVerificationExpiresAt
- 2FA: twoFaEnabled, twoFaMethod, twoFaSecret
- Password Reset: passwordResetToken, passwordResetExpiresAt
- Session: lastLoginAt, lastLoginIp, currentSessionToken, sessionExpiresAt
- Onboarding: onboardingStatus, onboardingCompletedAt, firstLogin
- Access: role (ADMIN, TEACHER, STAFF), status (ACTIVE, INACTIVE, etc.)
- Timestamps: createdAt, updatedAt, deletedAt

**Relationship:**
- School.hasMany(SchoolAdminUser) - One school can have multiple admins
- SchoolAdminUser.belongsTo(School) - Each admin belongs to one school

---

## Technology Stack

✅ **Runtime:** Node.js (v18+)  
✅ **Framework:** Express.js  
✅ **Language:** TypeScript  
✅ **Database:** MySQL with Sequelize ORM  
✅ **Authentication:** JWT (jsonwebtoken)  
✅ **Password:** bcrypt  
✅ **Validation:** Joi  
✅ **Email:** Nodemailer  
✅ **File Upload:** Multer  
✅ **Background Jobs:** Bull (Redis)  
✅ **Logging:** Winston  
✅ **Testing:** Jest + Supertest  

---

## Next Steps - Phase 1: Authentication

### Step 1: Install Dependencies
```bash
cd backend
npm install
```

### Step 2: Setup Local MySQL Database

**Option A: Using Command Line**
```bash
mysql -u root -p
CREATE DATABASE resultspro_db;
USE resultspro_db;
```

**Option B: Using MySQL GUI (MySQL Workbench)**
1. Create new connection
2. Create database: `resultspro_db`

**Option C: Using Docker** (recommended)
```bash
docker run --name resultspro-mysql -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=resultspro_db -p 3306:3306 -d mysql:8.0
```

### Step 3: Verify Database Connection
```bash
npm run dev
```

You should see:
```
✓ Database connection established successfully
✓ Server running at http://localhost:5000
```

### Step 4: Implement Auth Services (Next Task)

Create the following files:

**1. DTOs (Data Transfer Objects)**
```
src/modules/auth/dtos/
├── register.dto.ts
├── login.dto.ts
├── verify-email.dto.ts
└── resend-otp.dto.ts
```

**2. Services**
```
src/modules/auth/services/
├── auth.service.ts      # Main auth logic
├── password.service.ts  # Hash & verify passwords
└── otp.service.ts       # OTP generation & validation
```

**3. Repositories**
```
src/modules/auth/repositories/
└── auth.repository.ts   # Database queries
```

**4. Controllers**
```
src/modules/auth/controllers/
└── auth.controller.ts   # Route handlers
```

**5. Utilities**
```
src/utils/
├── validators/
│   ├── email.validator.ts
│   ├── password.validator.ts
│   └── phone.validator.ts
├── helpers/
│   ├── jwt.helper.ts
│   ├── slug.helper.ts
│   └── otp.helper.ts
```

---

## Current API Endpoints

**Health Check:**
```
GET /api/health
Response: { success: true, message: "Server is running", timestamp: "..." }
```

**Version:**
```
GET /api/version
Response: { success: true, version: "1.0.0", environment: "development" }
```

**Auth Endpoints (To be implemented):**
```
POST /api/auth/register
POST /api/auth/verify-email
POST /api/auth/resend-verification
POST /api/auth/login
POST /api/auth/refresh-token
POST /api/auth/logout
```

---

## Project Run Commands

```bash
# Development (with hot reload)
npm run dev

# Production build
npm run build
npm start

# Code quality
npm run lint
npm run format

# Testing
npm run test
npm run test:watch

# Database
npm run db:migrate
npm run db:seed
```

---

## Frontend & Backend Parallel Development

**Frontend (Port 8080):**
- Currently running: http://localhost:8080
- Uses mocked API responses

**Backend (Port 5000):**
- Starting: http://localhost:5000
- Currently returns "not implemented" stubs

**Integration Strategy:**
1. Backend implements endpoints
2. Frontend points to `http://localhost:5000/api/...`
3. Both can develop independently using proper types/interfaces

---

## Implementation Checklist - Phase 1

**Week 1-2 Tasks:**
- [ ] Verify database connection works
- [ ] Create Auth DTOs (request/response types)
- [ ] Create Password Service (hash & verify)
- [ ] Create OTP Service (generate, validate, send)
- [ ] Create Auth Repository (database queries)
- [ ] Create Auth Service (business logic)
- [ ] Implement POST /api/auth/register endpoint
- [ ] Implement POST /api/auth/verify-email endpoint
- [ ] Implement POST /api/auth/resend-verification endpoint
- [ ] Implement POST /api/auth/login endpoint
- [ ] Write integration tests for auth flow
- [ ] Test with Postman/Insomnia

---

## Database Design Notes

**Sequelize ORM Features Being Used:**
- Paranoid mode (soft deletes)
- Timestamps (createdAt, updatedAt)
- Custom model associations
- Enum type definitions
- UUID primary keys
- Foreign key constraints

**Database Conventions:**
- Table names: lowercase with underscores (schools, school_admin_users)
- Column names: snake_case (email_verified_at, password_hash)
- Timestamps: UTC
- Soft deletes: deletedAt field (paranoid: true)
- IDs: UUID (auto-generated)

---

## Error Handling

All errors follow this format:
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

**Common HTTP Status Codes:**
- 200 - Success
- 201 - Created
- 400 - Bad Request (validation error)
- 401 - Unauthorized (auth error)
- 409 - Conflict (duplicate email, etc.)
- 404 - Not Found
- 500 - Server Error

---

## Security Considerations

✅ **Implemented:**
- JWT token authentication
- CORS configured
- Helmet security headers
- Environment-based configuration
- Soft deletes for data retention

⏳ **To Implement:**
- Password hashing (bcrypt in service)
- Rate limiting (express-rate-limit)
- Input validation (Joi schemas)
- Request logging (Winston)
- HTTPS in production

---

## Environment Variables

All configuration is in `.env` file (not committed):
- Database credentials
- JWT secrets
- Email configuration  
- Third-party API keys
- Logging settings

**Never commit `.env` to git!**

---

## File System Summary

```
backend/
├── src/                        # Source code
│   ├── config/                 # 3 files ✅
│   ├── middleware/             # 3 files ✅
│   ├── modules/                # Structure ready
│   ├── database/               # 2 models ✅
│   ├── utils/                  # Structure ready
│   ├── app.ts                  # ✅
│   └── server.ts               # ✅
├── package.json                # ✅ 38 dependencies
├── tsconfig.json               # ✅
├── .env                        # ✅
├── .gitignore                  # ✅
└── README.md                   # ✅
```

**Total Files Created:** 20+

---

## Next Immediate Action

Ready to implement Phase 1? Here's the sequence:

1. **Verify setup works:**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. **See it running:**
   - Open: http://localhost:5000/api/health
   - Should return: `{ success: true, message: "Server is running", ... }`

3. **Start implementing Auth service:** (covered in next phase)

---

## Quick Reference

| What | Where | Status |
|------|-------|--------|
| Database Config | src/config/database.ts | ✅ Ready |
| Auth Middleware | src/middleware/auth.middleware.ts | ✅ Ready |
| School Model | src/database/models/School.ts | ✅ Ready |
| Admin User Model | src/database/models/SchoolAdminUser.ts | ✅ Ready |
| Auth Routes | src/modules/auth/routes/auth.routes.ts | 🔲 Stub |
| Auth Controller | src/modules/auth/controllers/ | 🔲 Ready to create |
| Auth Service | src/modules/auth/services/ | 🔲 Ready to create |
| DTOs & Validators | src/modules/auth/dtos/ | 🔲 Ready to create |

---

## Support & Troubleshooting

**Port already in use?**
```bash
lsof -i :5000  # Find process
kill -9 <PID>  # Kill it
```

**Database connection failed?**
- Check MySQL is running
- Verify .env has correct credentials
- Check DB_NAME exists in MySQL

**TypeScript errors?**
```bash
npm run build  # Check compilation
```

---

## Summary

✅ **Complete backend scaffolding created**  
✅ **Database models ready**  
✅ **Middleware configured**  
✅ **Project structure organized**  
✅ **TypeScript setup optimized**  

**Next Phase:** Implement Authentication endpoints (Phase 1)
