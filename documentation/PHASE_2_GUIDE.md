# Results Pro - Flow Continuation Guide

**Document Date:** February 17, 2026  
**Phase:** Phase 1 → Phase 2 Transition  
**Current Status:** Phase 1 (Authentication) ✅ COMPLETE

---

## What You've Built (Phase 1 - Complete)

Your design specification laid out a complete 10-week implementation roadmap. Phase 1 (Weeks 1-2) has been **successfully implemented and verified**:

### ✅ Core Authentication System
- **Registration Service**: Schools can register with email, phone, address
- **Email Verification**: OTP-based email confirmation (6-digit codes)
- **Admin Approval System**: Super admin interface ready (backend)
- **JWT Authentication**: Secure token generation and refresh
- **Password Management**: Bcrypt hashing and comparison

### ✅ Database Foundation
- **9 Core Models** fully implemented with proper relationships:
  - School (with status tracking)
  - SchoolAdminUser (with 2FA support)
  - AcademicSession, Term, Class, Subject (Academic structure)
  - GradingSystem, Grade (Assessment structure)
  - OnboardingState (Progress tracking)

### ✅ Backend Infrastructure
- **Express Server** with security middleware (helmet, CORS, compression)
- **Sequelize ORM** with MySQL database
- **Error Handling** with custom exception classes
- **Validation Framework** for email, phone, CSV
- **Email Service** with HTML templates
- **OTP Service** with expiration logic
- **JWT Helpers** for token management

---

## Phase 1 API Endpoints (Ready to Use)

### Public Endpoints (No Authentication)
```
POST   /api/auth/register                - [READY] Register school
POST   /api/auth/verify-email            - [READY] Verify with OTP
POST   /api/auth/resend-verification     - [READY] Resend OTP
POST   /api/auth/login                   - [READY] Login with credentials
POST   /api/auth/refresh-token           - [READY] Get new JWT token
POST   /api/auth/logout                  - [READY] Logout endpoint
GET    /api/health                       - [READY] Server health check
GET    /api/version                      - [READY] API version info
```

### Response Format (Standardized)
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // endpoint-specific response data
  }
}
```

---

## Where to Go Next - Phase 2: Onboarding Wizard (Weeks 3-4)

Your design specifies 6-step onboarding wizard. Here's the implementation sequence:

### 📋 Step 1: Complete School Profile
**Purpose**: Collect branding and contact information

**Endpoint to Create**: 
```
POST /api/onboarding/step-1/school-profile
```

**Request Body**:
```json
{
  "schoolId": "uuid",
  "schoolProfile": {
    "logoUrl": "https://...",
    "logoEmoji": "🏫",
    "motto": "Nurturing Excellence",
    "primaryColor": "#3b82f6",
    "secondaryColor": "#1e40af",
    "accentColor": "#FCD34D",
    "contactPerson": "Dr. Samuel Okoroafor",
    "contactEmail": "principal@school.ng",
    "contactPhone": "+234806...",
    "contactEmail2": "vice.principal@school.ng",
    "contactPhone2": "+234807..."
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "stepId": 1,
    "completed": true,
    "savedAt": "2024-02-17T10:30:00Z"
  }
}
```

**Backend Implementation Tasks**:
1. Create `SchoolsService.updateSchoolProfile()` method
2. Implement file upload handler for logo (local or S3)
3. Validate color hex codes
4. Update `schools` table
5. Create `OnboardingStateRepository.saveStep1()` method
6. Add step progress tracking

---

### 📋 Step 2: Create Academic Session & Terms
**Purpose**: Setup academic calendar structure

**Endpoints to Create**:
```
POST /api/onboarding/step-2/academic-session
POST /api/onboarding/step-2/terms
```

**Request Body - Session**:
```json
{
  "schoolId": "uuid",
  "academicSession": {
    "name": "2024/2025",
    "startDate": "2024-09-01",
    "endDate": "2025-07-31"
  }
}
```

**Request Body - Terms**:
```json
{
  "schoolId": "uuid",
  "sessionId": "uuid",
  "terms": [
    {
      "termNumber": 1,
      "name": "First Term",
      "startDate": "2024-09-01",
      "endDate": "2024-11-30",
      "breakStartDate": "2024-12-01",
      "breakEndDate": "2025-01-10"
    },
    // ... more terms
  ]
}
```

**Backend Implementation Tasks**:
1. Create `SessionsService` class
2. Implement date overlap validation
3. Implement `AcademicSessionRepository`
4. Create `TermsRepository`
5. Add auto-calculation for term dates
6. Emit event: `AcademicSessionCreated`

---

### 📋 Step 3: Create Classes
**Purpose**: Define all classes in the school

**Endpoint to Create**:
```
POST /api/onboarding/step-3/classes
```

**Request Body**:
```json
{
  "schoolId": "uuid",
  "classes": [
    {
      "classCode": "SS1A",
      "className": "Senior Secondary 1A",
      "classLevel": "SS_1",
      "expectedStudentCount": 40,
      "formTeacher": null,
      "order": 1
    },
    // ... more classes
  ]
}
```

**Backend Implementation Tasks**:
1. Create `ClassesService` class
2. Implement `ClassRepository`
3. Validate class level enums
4. Check class code uniqueness per school
5. Support bulk create
6. Add reordering logic

---

### 📋 Step 4: Create Subjects
**Purpose**: Define subjects for each class

**Endpoint to Create**:
```
POST /api/onboarding/step-4/subjects
```

**Request Body**:
```json
{
  "schoolId": "uuid",
  "classId": "uuid",
  "subjects": [
    {
      "subjectName": "Mathematics",
      "subjectCode": "MATH",
      "category": "CORE",
      "creditHours": 3,
      "isCompulsory": true,
      "order": 1
    },
    // ... more subjects
  ]
}
```

**Backend Implementation Tasks**:
1. Create `SubjectsService` class
2. Implement `SubjectsRepository`
3. Validate subject uniqueness per class
4. Support subject copying from other classes
5. Generate subject codes automatically
6. Handle subject categories

---

### 📋 Step 5: Configure Grading System
**Purpose**: Define grade scales and scoring components

**Endpoint to Create**:
```
POST /api/onboarding/step-5/grading-system
```

**Request Body**:
```json
{
  "schoolId": "uuid",
  "gradingSystem": {
    "templateType": "STANDARD_5",
    "name": "Standard 5-Point Grading",
    "grades": [
      {
        "gradeLetter": "A",
        "minScore": 80,
        "maxScore": 100,
        "remark": "Excellent",
        "color": "#10b981"
      },
      // ... more grades
    ],
    "scoringComponents": {
      "ca": 30,
      "exam": 70
    }
  }
}
```

**Backend Implementation Tasks**:
1. Create `GradingService` class
2. Implement preset template system
3. Validate grade ranges (no overlaps)
4. Create `GradesRepository`
5. Implement score component validation
6. Add grading preview logic

---

### 📋 Step 6: CSV Data Upload
**Purpose**: Upload sample student data and results

**Endpoint to Create**:
```
POST /api/csv/upload
GET  /api/csv/template
GET  /api/csv/status/:jobId
```

**Request Body**:
```
Multipart form data with CSV file
- file: <binary CSV data>
- academicSessionId: uuid
- termId: uuid
```

**Backend Implementation Tasks**:
1. Create `CSVService` class
2. Implement CSV parsing (csv-parser library)
3. Create detailed validation logic
4. Setup Bull queue for background processing
5. Create error reporting system
6. Implement CSV template generation
7. Add job status tracking
8. Emit events: `CSVImportStarted`, `CSVImportCompleted`

---

## Implementation Roadmap

### Week 1-2 (Current) ✅
- [x] Phase 1: Authentication complete
- [x] Database schema complete
- [x] Core models implemented
- [x] Build verified (no TypeScript errors)

### Week 3-4 (Next Sprint) 🚀
- [ ] Implement onboarding endpoints (Steps 1-5)
- [ ] Create onboarding service layer
- [ ] Add state management for multi-step form
- [ ] Implement auto-save logic
- [ ] Create onboarding progress tracking

### Week 5-6 (CSV Processing)
- [ ] CSV validation service
- [ ] Background job queue (Bull + Redis)
- [ ] CSV error reporting system
- [ ] Import job tracking
- [ ] Template generation

### Week 7-8 (Super Admin)
- [ ] Schools verification dashboard
- [ ] Approval/rejection workflows
- [ ] Admin notification system
- [ ] School status management

### Week 9-10 (Frontend)
- [ ] Build all onboarding wizard screens
- [ ] Implement wizard navigation
- [ ] Add form validation
- [ ] Create dashboard tour guide
- [ ] Responsive design

---

## File Structure for Phase 2

```
backend/src/modules/
├── onboarding/                           # ← New
│   ├── controllers/
│   │   ├── schools.controller.ts         # Step 1
│   │   ├── sessions.controller.ts        # Step 2
│   │   ├── classes.controller.ts         # Step 3
│   │   ├── subjects.controller.ts        # Step 4
│   │   ├── grading.controller.ts         # Step 5
│   │   └── onboarding.controller.ts      # Progress tracking
│   ├── services/
│   │   ├── schools.service.ts
│   │   ├── sessions.service.ts
│   │   ├── classes.service.ts
│   │   ├── subjects.service.ts
│   │   ├── grading.service.ts
│   │   └── onboarding.service.ts
│   ├── repositories/
│   │   ├── schools.repository.ts
│   │   ├── sessions.repository.ts
│   │   ├── classes.repository.ts
│   │   ├── subjects.repository.ts
│   │   ├── grading.repository.ts
│   │   └── onboarding-state.repository.ts
│   ├── dtos/
│   │   ├── create-school.dto.ts
│   │   ├── create-session.dto.ts
│   │   ├── create-class.dto.ts
│   │   ├── create-subject.dto.ts
│   │   └── create-grading.dto.ts
│   ├── validators/
│   │   ├── session.validator.ts
│   │   ├── class.validator.ts
│   │   ├── subject.validator.ts
│   │   └── grading.validator.ts
│   ├── routes/
│   │   └── onboarding.routes.ts
│   └── events/
│       └── onboarding.events.ts
│
└── csv/                                  # ← New
    ├── controllers/
    │   └── csv.controller.ts
    ├── services/
    │   ├── csv.service.ts
    │   ├── csv-validator.service.ts
    │   ├── csv-parser.service.ts
    │   └── csv-queue.service.ts
    ├── routes/
    │   └── csv.routes.ts
    ├── workers/
    │   └── csv-import.worker.ts
    └── templates/
        └── csv-template.ts
```

---

## Quick Start - Next Steps

### 1. Verify Phase 1 Works
```bash
cd backend
npm run dev

# In another terminal
bash test-api.sh

# Test registration → verification → login flow
```

### 2. Create Phase 2 Services
```bash
# Create directory structure
mkdir -p src/modules/onboarding/{controllers,services,repositories,dtos,validators,routes,events}
mkdir -p src/modules/csv/{controllers,services,routes,workers,templates}

# Create base service classes
touch src/modules/onboarding/services/onboarding.service.ts
touch src/modules/onboarding/services/schools.service.ts
# ... etc
```

### 3. Start with Step 1: School Profile
- Create `SchoolsController.updateProfile()`
- Create `SchoolsService.updateSchoolProfile()`
- Create `SchoolsRepository.updateSchool()`
- Add routes to `onboarding.routes.ts`
- Test endpoint

### 4. Build Frontend in Parallel
- Create `SchoolProfileStep` component
- Connect to `/api/onboarding/step-1/school-profile`
- Add form validation
- Implement auto-save

---

## Key Design Principles to Follow

### 1. State Management
- Use `OnboardingState` table to persist wizard progress
- Auto-save after each step (not on submit)
- Allow users to return to previous steps
- Track completed steps for progress bar

### 2. Validation
- Server-side validation always (security)
- Clear error messages for user feedback
- Validation errors include field name and reason
- Consistent validation across all endpoints

### 3. Event-Driven
- Emit event after each step completion
- Emit event when onboarding completes
- Listeners can update school status, send emails, etc.
- Example: `onboarding.completed` → mark `first_login = false`

### 4. API Response Format
```json
{
  "success": true|false,
  "message": "Human readable message",
  "data": {
    // step-specific data
  },
  "errors": [
    // validation errors if applicable
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### 5. Error Handling
- Use custom exception classes
- Map exceptions to HTTP status codes
- Return consistent error responses
- Log errors for debugging

---

## Database Considerations

### Onboarding State Storage
```sql
-- Save JSON data for flexibility
UPDATE onboarding_state
SET step_1_data = JSON_OBJECT(
  'logoUrl', 'https://...',
  'motto', 'Excellence',
  'colors', JSON_OBJECT(
    'primary', '#3b82f6',
    'secondary', '#1e40af'
  )
)
WHERE school_id = 'uuid';
```

### Step Tracking
```sql
-- Track completed steps
UPDATE onboarding_state
SET completed_steps = JSON_ARRAY(1, 2, 3)
WHERE school_id = 'uuid';
```

---

## Testing Strategy for Phase 2

### Unit Tests
- Test each service method independently
- Mock database calls
- Test validation logic
- Test error scenarios

### Integration Tests
- Test full endpoint flow
- Test database interactions
- Test event emission
- Test error handling

### E2E Tests
- Test complete wizard flow
- Test data persistence
- Test navigation between steps
- Test form validation

---

## Frontend Components Needed for Phase 2

### Screens
```
OnboardingWizard/
├── Step1SchoolProfile.tsx
├── Step2AcademicSession.tsx
├── Step3Classes.tsx
├── Step4Subjects.tsx
├── Step5GradingSystem.tsx
├── Step6CSVUpload.tsx
├── OnboardingComplete.tsx
└── OnboardingLayout.tsx (wrapper)

Components/
├── ProgressBar.tsx
├── StepNavigation.tsx
├── FormField.tsx
├── ColorPicker.tsx
├── DateRangePicker.tsx
├── DragDropList.tsx
├── CSVDropZone.tsx
├── CSVPreviewTable.tsx
└── ErrorAlert.tsx
```

---

## Timeline Estimate

- **Phase 2 Backend:** 2 weeks (5-6 endpoints + validation)
- **Phase 2 Frontend:** 2 weeks (6 wizard screens + state management)
- **Phase 3 CSV:** 2 weeks (parsing, validation, queuing)
- **Phase 4 Super Admin:** 1 week (approval dashboard)
- **Phase 5 Testing & Polish:** 2 weeks

**Total: 10 weeks** ✅ (matches your original specification)

---

## Quick Links

- **Design Specification:** [DESIGN_SPECIFICATION.md](./DESIGN_SPECIFICATION.md)
- **Implementation Status:** [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md)
- **API Test Script:** [test-api.sh](./test-api.sh)
- **Backend Start:** `cd backend && npm run dev`

---

## Summary

✅ **Phase 1: Authentication & Verification is COMPLETE and TESTED**

You now have:
- Working JWT authentication system
- Email verification with OTP
- Admin approval workflow (backend ready)
- Complete database schema
- Build system with no errors
- Ready-to-use API endpoints

🚀 **Ready to begin Phase 2: Onboarding Wizard Backend**

Next immediate action:
1. Create onboarding service classes
2. Implement Step 1: School Profile
3. Add routes and test
4. Build corresponding frontend
5. Move to Step 2

**Estimated time to Phase 2 completion:** 2 weeks

Good luck! 🎉
