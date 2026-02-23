# Phase 2: Onboarding API Implementation Guide

**Status**: ✅ Complete - Ready for Frontend Integration

## Overview

The school onboarding flow has been fully implemented with 6 sequential steps plus completion tracking. The system guides new schools through:
1. School Profile Setup
2. Academic Session & Terms Configuration
3. Classes/Grade Levels Creation
4. Subjects Assignment
5. Grading System Configuration
6. CSV Data Upload Tracking

## API Endpoints

### Base URL: `http://localhost:5000/api/onboarding`

All endpoints require authentication with JWT bearer token from `/api/auth/login`

---

## Endpoint Reference

### 1. Get Onboarding Status
```
GET /status
```

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Response:**
```json
{
  "success": true,
  "data": {
    "schoolId": "51a11e05-913e-473d-acd2-fcc9c53ddb52",
    "onboardingStatus": "IN_PROGRESS",
    "currentStep": 1,
    "completedSteps": [],
    "school": {
      "id": "51a11e05-913e-473d-acd2-fcc9c53ddb52",
      "name": "Demo School",
      "slug": "demo-school"
    }
  }
}
```

---

### 2. Step 1: Update School Profile
```
POST /step/1
```

**Request Body:**
```json
{
  "motto": "Excellence in Education",
  "logoEmoji": "🏫",
  "primaryColor": "#1e40af",
  "secondaryColor": "#0ea5e9",
  "accentColor": "#f59e0b",
  "contactPersonName": "Principal John Doe",
  "contactPhone": "08012345678",
  "altContactEmail": "contact@school.test",
  "altContactPhone": "08198765432"
}
```

**Response:**
```json
{
  "success": true,
  "message": "School profile updated successfully",
  "data": {
    "stepCompleted": true,
    "nextStep": 2
  }
}
```

---

### 3. Step 2: Create Academic Session & Terms
```
POST /step/2
```

**Request Body:**
```json
{
  "name": "2024/2025",
  "sessionYear": 2024,
  "startDate": "2024-09-01",
  "endDate": "2025-07-31",
  "terms": [
    {
      "termNumber": 1,
      "name": "First Term",
      "startDate": "2024-09-01",
      "endDate": "2024-11-30",
      "breakStartDate": "2024-12-01",
      "breakEndDate": "2025-01-10"
    },
    {
      "termNumber": 2,
      "name": "Second Term",
      "startDate": "2025-01-11",
      "endDate": "2025-03-31",
      "breakStartDate": "2025-04-01",
      "breakEndDate": "2025-04-14"
    },
    {
      "termNumber": 3,
      "name": "Third Term",
      "startDate": "2025-04-15",
      "endDate": "2025-07-31",
      "breakStartDate": null,
      "breakEndDate": null
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Academic session and terms created successfully",
  "data": {
    "stepCompleted": true,
    "nextStep": 3,
    "session": {
      "id": "uuid-here",
      "name": "2024/2025",
      "startDate": "2024-09-01",
      "endDate": "2025-07-31"
    },
    "terms": [
      {
        "id": "uuid-here",
        "termNumber": 1,
        "name": "First Term",
        "startDate": "2024-09-01",
        "endDate": "2024-11-30"
      },
      ...
    ]
  }
}
```

---

### 4. Step 3: Create Classes
```
POST /step/3
```

**Request Body:**
```json
{
  "classes": [
    {
      "classCode": "SS1A",
      "className": "Senior Secondary 1A",
      "classLevel": "SS1",
      "expectedStudentCount": 40
    },
    {
      "classCode": "SS1B",
      "className": "Senior Secondary 1B",
      "classLevel": "SS1",
      "expectedStudentCount": 40
    },
    {
      "classCode": "SS2A",
      "className": "Senior Secondary 2A",
      "classLevel": "SS2",
      "expectedStudentCount": 38
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Classes created successfully",
  "data": {
    "stepCompleted": true,
    "nextStep": 4,
    "classes": [
      {
        "id": "uuid-here",
        "classCode": "SS1A",
        "className": "Senior Secondary 1A",
        "classLevel": "SS1"
      },
      ...
    ]
  }
}
```

---

### 5. Step 4: Create Subjects
```
POST /step/4
```

**Request Body:**
```json
{
  "subjects": {
    "class-id-1": [
      {
        "subjectName": "English Language",
        "subjectCode": "ENG001",
        "category": "CORE",
        "creditHours": 3,
        "isCompulsory": true
      },
      {
        "subjectName": "Mathematics",
        "subjectCode": "MAT001",
        "category": "CORE",
        "creditHours": 3,
        "isCompulsory": true
      },
      {
        "subjectName": "Physics",
        "subjectCode": "PHY001",
        "category": "SCIENCE",
        "creditHours": 4,
        "isCompulsory": true
      },
      ...
    ],
    "class-id-2": [
      ...
    ]
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Subjects created successfully",
  "data": {
    "stepCompleted": true,
    "nextStep": 5,
    "subjectsByClass": {
      "class-id-1": [
        {
          "id": "uuid",
          "subjectName": "English Language",
          "subjectCode": "ENG001"
        },
        ...
      ],
      "class-id-2": [...]
    }
  }
}
```

---

### 6. Step 5: Configure Grading System
```
POST /step/5
```

**Request Body:**
```json
{
  "templateType": "NIGERIAN_WASSCE",
  "name": "WASSCE Grading System",
  "description": "West African Senior School Certificate Examination grading",
  "scoringComponents": {
    "continuous_assessment": 20,
    "mid_term": 20,
    "final_exam": 60
  },
  "grades": [
    {
      "gradeLetter": "A1",
      "minScore": 80,
      "maxScore": 100,
      "remark": "Excellent",
      "gradeColor": "#10b981"
    },
    {
      "gradeLetter": "B2",
      "minScore": 70,
      "maxScore": 79,
      "remark": "Good",
      "gradeColor": "#3b82f6"
    },
    {
      "gradeLetter": "B3",
      "minScore": 60,
      "maxScore": 69,
      "remark": "Good",
      "gradeColor": "#06b6d4"
    },
    {
      "gradeLetter": "C4",
      "minScore": 50,
      "maxScore": 59,
      "remark": "Credit",
      "gradeColor": "#f59e0b"
    },
    {
      "gradeLetter": "C5",
      "minScore": 40,
      "maxScore": 49,
      "remark": "Credit",
      "gradeColor": "#f97316"
    },
    {
      "gradeLetter": "D7",
      "minScore": 30,
      "maxScore": 39,
      "remark": "Pass",
      "gradeColor": "#ef4444"
    },
    {
      "gradeLetter": "E8",
      "minScore": 20,
      "maxScore": 29,
      "remark": "Pass",
      "gradeColor": "#dc2626"
    },
    {
      "gradeLetter": "F9",
      "minScore": 0,
      "maxScore": 19,
      "remark": "Fail",
      "gradeColor": "#7f1d1d"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Grading system configured successfully",
  "data": {
    "stepCompleted": true,
    "nextStep": 6,
    "gradingSystem": {
      "id": "uuid-here",
      "templateType": "NIGERIAN_WASSCE",
      "name": "WASSCE Grading System"
    },
    "grades": [
      {
        "gradeLetter": "A1",
        "minScore": 80,
        "maxScore": 100,
        "remark": "Excellent",
        "color": "#10b981"
      },
      ...
    ]
  }
}
```

---

### 7. Step 6: Record CSV Upload
```
POST /step/6
```

**Request Body:**
```json
{
  "recordCount": 250,
  "dataType": "students",
  "fileName": "students_list_2024.csv"
}
```

**Response:**
```json
{
  "success": true,
  "message": "CSV data recorded successfully",
  "data": {
    "stepCompleted": true,
    "nextStep": 7
  }
}
```

---

### 8. Complete Onboarding
```
POST /complete
```

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:** (empty)
```json
{}
```

**Response:**
```json
{
  "success": true,
  "message": "Onboarding completed successfully!",
  "data": {
    "schoolId": "51a11e05-913e-473d-acd2-fcc9c53ddb52",
    "onboardingStatus": "COMPLETE",
    "completedAt": "2026-02-17T16:30:00.000Z",
    "redirectTo": "/school-admin/overview"
  }
}
```

---

## Error Handling

All endpoints return error responses in this format:

```json
{
  "success": false,
  "error": "Error message describing what went wrong",
  "code": "ERROR_CODE"
}
```

### Common Error Codes:
- `UNAUTHORIZED` - Missing or invalid JWT token (401)
- `NOT_FOUND` - School or resource not found (404)
- `VALIDATION_ERROR` - Invalid request data (400)
- `CONFLICT` - Resource already exists (409)
- `ERROR` - Generic server error (500)

---

## Data Models

### OnboardingState
Tracks progress through the 6 onboarding steps:
```typescript
{
  id: string;
  schoolId: string;
  currentStep: number;      // 1-6
  completedSteps: number[]; // Array of completed step numbers
  step1Data: object;        // School profile data
  step2Data: object;        // Academic session data
  step3Data: object;        // Classes data
  step4Data: object;        // Subjects data
  step5Data: object;        // Grading system data
  step6Data: object;        // CSV upload data
  isComplete: boolean;
  completedAt?: Date;
}
```

### Supported Grading Templates
The system includes built-in templates:
- `NIGERIAN_WASSCE` - West African SSCE
- `NIGERIAN_NABTEB` - NABTEB
- `NIGERIAN_NECO` - NECO
- `CUSTOM` - School-defined system

---

## Implementation Status

| Feature | Status | Notes |
|---------|--------|-------|
| Service Layer | ✅ Complete | Full business logic implemented |
| Repository Layer | ✅ Complete | Database operations for all 6 steps |
| Controller Layer | ✅ Complete | All endpoints exposed and tested |
| Route Handlers | ✅ Complete | Properly wired in Express |
| Error Handling | ✅ Complete | Comprehensive error codes |
| Database Models | ✅ Complete | All associations properly set up |
| Associations | ✅ Complete | School → Sessions → Terms → Classes → Subjects |

---

## Testing the Onboarding Flow

### 1. Authenticate
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email": "admin@demoschool.test", "password": "demo_password_123"}'
```

### 2. Check Status
```bash
curl -X GET http://localhost:5000/api/onboarding/status \
  -H "Authorization: Bearer <TOKEN>"
```

### 3. Execute Each Step
Run steps 1-6 in sequence using the endpoints above.

### 4. Mark Complete
```bash
curl -X POST http://localhost:5000/api/onboarding/complete \
  -H "Authorization: Bearer <TOKEN>"
```

---

## Frontend Integration Notes

✅ **Ready for Frontend Implementation**

The backend is fully prepared for Vite/React frontend integration:
- CORS enabled for frontend origin
- JWT authentication ready
- All business logic implemented
- Database synchronized
- Error handling standardized
- Response format consistent

### Next Steps for Frontend:
1. Create Onboarding Wizard Component
2. Implement step-by-step form navigation
3. Add form validation matching backend DTOs
4. Display progress indicator
5. Handle error messages gracefully
6. Redirect to admin dashboard on completion

---

## Database Relationships

```
School (1) ──→ (N) AcademicSession
  ├→ (N) SchoolAdminUser
  ├→ (N) Class
  ├→ (N) Subject
  ├→ (N) GradingSystem
  └→ (N) OnboardingState

AcademicSession (1) ──→ (N) Term
Class (1) ──→ (N) Subject
GradingSystem (1) ──→ (N) Grade
```

---

**Version**: 1.0.0
**Last Updated**: February 17, 2026
**Backend Status**: Production Ready ✅
