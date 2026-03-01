# 🚀 Frontend Developer Quick Start Guide

## Pre-requisites
- ✅ Backend running on `http://localhost:5000`
- ✅ Frontend dev server ready (Vite)
- ✅ Node.js and npm installed
- ✅ API documentation reviewed

## Quick Reference

### Backend Status Check
```bash
curl http://localhost:5000/api/health
```

### Start Backend (if not running)
```bash
cd /Users/user/Desktop/ResultsPro/backend
npx tsx watch src/server.ts
```

### Start Frontend
```bash
cd /Users/user/Desktop/ResultsPro
npm run dev
```

---

## 🔐 Authentication Flow

### Step 1: Login
```javascript
// POST http://localhost:5000/api/auth/login
const response = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@demoschool.test',
    password: 'demo_password_123'
  })
});

const data = await response.json();
// data.data.token = JWT Token
// data.data.user = { id, schoolId, email, role }
// data.data.school = { id, name, slug }
```

### Step 2: Store Token
```javascript
// Store in localStorage or sessionStorage
localStorage.setItem('authToken', data.data.token);
localStorage.setItem('refreshToken', data.data.refreshToken);
localStorage.setItem('school', JSON.stringify(data.data.school));
localStorage.setItem('user', JSON.stringify(data.data.user));
```

### Step 3: Use Token in Requests
```javascript
const headers = {
  'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
  'Content-Type': 'application/json'
};

// Example: Get onboarding status
const status = await fetch('http://localhost:5000/api/onboarding/status', {
  headers
});
```

---

## 🎯 Onboarding Wizard Implementation

### Component Structure
```
OnboardingWizard
├── StepIndicator (shows 1-6 with progress)
├── FormWrapper
│   ├── Step1SchoolProfile
│   ├── Step2AcademicSession
│   ├── Step3Classes
│   ├── Step4Subjects
│   ├── Step5GradingSystem
│   └── Step6CsvUpload
├── ActionButtons (Next, Previous, Submit)
└── SuccessModal
```

### Recommended Libraries
```json
{
  "react-hook-form": "latest",    // Form validation
  "zod": "latest",                // Schema validation
  "axios": "latest",              // HTTP client
  "zustand": "latest"             // State management
}
```

### Basic Step Implementation Pattern
```typescript
const Step1SchoolProfile = ({ onSubmit }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValue: schoolData
  });

  const onNext = async (data) => {
    const response = await axios.post(
      'http://localhost:5000/api/onboarding/step/1',
      data,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    if (response.data.success) {
      onSubmit(response.data.data);
    }
  };

  return (
    <form onSubmit={handleSubmit(onNext)}>
      {/* Form fields */}
      <input {...register('motto', { required: true })} />
      <input {...register('primaryColor')} />
      {/* ... more fields ... */}
      <button type="submit">Next</button>
    </form>
  );
};
```

---

## 📋 Step-by-Step Implementation Checklist

### Phase 1: Setup & Layout
- [ ] Create Onboarding route/page
- [ ] Create step components folder structure
- [ ] Set up state management for onboarding data
- [ ] Create step indicator component
- [ ] Create form wrapper component

### Phase 2: Authentication UI
- [ ] Create Login page
- [ ] Create Registration page (optional - backend ready)
- [ ] Implement token storage
- [ ] Create auth context/store
- [ ] Implement logout functionality

### Phase 3: Onboarding Steps
- [ ] Implement Step 1 (School Profile)
- [ ] Implement Step 2 (Academic Session)
- [ ] Implement Step 3 (Classes)
- [ ] Implement Step 4 (Subjects)
- [ ] Implement Step 5 (Grading System)
- [ ] Implement Step 6 (CSV Upload)

### Phase 4: Polish
- [ ] Add loading states
- [ ] Add error messages with error codes
- [ ] Add success confirmations
- [ ] Add form validation feedback
- [ ] Add accessibility (ARIA labels, keyboard nav)

### Phase 5: Integration
- [ ] Test with real backend
- [ ] Handle all error scenarios
- [ ] Implement recovery flows
- [ ] Test mobile responsiveness
- [ ] Performance optimization

---

## 🎨 Design System Integration

### Color Palette (from school settings)
```typescript
// These come from Step 1 - School Profile
interface SchoolColors {
  primaryColor: string;      // e.g., "#1e40af" (blue)
  secondaryColor: string;    // e.g., "#0ea5e9" (cyan)
  accentColor: string;       // e.g., "#f59e0b" (amber)
}

// Use in components
<button style={{ backgroundColor: schoolColors.primaryColor }}>
  Next Step
</button>
```

### Logo & Branding
```typescript
// From Step 1 - can be emoji or URL
interface SchoolBranding {
  logoEmoji?: string;        // e.g., "🏫"
  logoUrl?: string;          // e.g., "https://..."
  contactPersonName?: string;
  contactPhone?: string;
  motto?: string;
}
```

---

## 🔄 State Management Pattern

### Using Zustand (Recommended)
```typescript
import { create } from 'zustand';

const useOnboardingStore = create((set) => ({
  // Step data
  step1Data: null,
  step2Data: null,
  step3Data: null,
  step4Data: null,
  step5Data: null,
  step6Data: null,
  
  // Current step
  currentStep: 1,
  
  // Progress
  completedSteps: [],
  
  // Actions
  setStep1Data: (data) => set({ step1Data: data, currentStep: 2 }),
  setStep2Data: (data) => set({ step2Data: data, currentStep: 3 }),
  // ... etc
  
  goToStep: (step) => set({ currentStep: step }),
  reset: () => set({
    step1Data: null,
    step2Data: null,
    // ... reset all
    currentStep: 1,
    completedSteps: []
  })
}));
```

---

## 🚨 Error Handling

### Standardized Error Response
```typescript
interface ApiError {
  success: false;
  error: string;          // User-friendly message
  code: string;           // Machine-readable: VALIDATION_ERROR, NOT_FOUND, etc.
}
```

### Error Code Reference
| Code | Status | Handling |
|------|--------|----------|
| `UNAUTHORIZED` | 401 | Redirect to login |
| `VALIDATION_ERROR` | 400 | Show field errors |
| `NOT_FOUND` | 404 | Show "Not found" message |
| `CONFLICT` | 409 | Show "Already exists" message |
| `ERROR` | 500 | Show generic error + retry |

### Error Handler Implementation
```typescript
const handleApiError = (error) => {
  if (error.response?.status === 401) {
    // Clear auth data and redirect to login
    localStorage.clear();
    window.location.href = '/login';
  } else if (error.response?.data?.code === 'VALIDATION_ERROR') {
    // Show field-level errors
    showFormErrors(error.response.data.details);
  } else {
    // Show generic error
    showErrorToast(error.response?.data?.error || 'Something went wrong');
  }
};
```

---

## 📱 Form Validation Examples

### Step 1: School Profile
```typescript
const step1Schema = z.object({
  motto: z.string().optional(),
  logoEmoji: z.string().optional(),
  primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color'),
  secondaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color'),
  accentColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color'),
  contactPersonName: z.string().optional(),
  contactPhone: z.string().optional(),
  altContactEmail: z.string().email().optional(),
});
```

### Step 2: Academic Session
```typescript
const step2Schema = z.object({
  name: z.string().min(1, 'Session name required'),
  sessionYear: z.number().min(2000).max(2100),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  terms: z.array(z.object({
    termNumber: z.number().min(1).max(3),
    name: z.string(),
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
  })).min(1, 'At least one term required').max(3, 'Maximum 3 terms'),
});
```

---

## 🧪 Testing API Endpoints

### Using Postman or REST Client

**Collection**: `Results Pro Onboarding`

**Environment Variables**:
```
{
  "baseUrl": "http://localhost:5000",
  "token": "your_jwt_token_here",
  "schoolId": "51a11e05-913e-473d-acd2-fcc9c53ddb52"
}
```

**Sample Requests**:
1. POST `/api/auth/login` - Get token
2. GET `/api/onboarding/status` - Check progress
3. POST `/api/onboarding/step/1` - Submit school profile
4. ... continue with steps 2-6

---

## 🔗 API Endpoint Reference

| Step | Endpoint | Method | Response |
|------|----------|--------|----------|
| Auth | `/api/auth/login` | POST | `{ token, refreshToken, user, school }` |
| Status | `/api/onboarding/status` | GET | `{ currentStep, completedSteps, school }` |
| 1 | `/api/onboarding/step/1` | POST | `{ stepCompleted: true, nextStep: 2 }` |
| 2 | `/api/onboarding/step/2` | POST | `{ session, terms }` |
| 3 | `/api/onboarding/step/3` | POST | `{ classes }` |
| 4 | `/api/onboarding/step/4` | POST | `{ subjectsByClass }` |
| 5 | `/api/onboarding/step/5` | POST | `{ gradingSystem, grades }` |
| 6 | `/api/onboarding/step/6` | POST | `{ stepCompleted: true, nextStep: 7 }` |
| Complete | `/api/onboarding/complete` | POST | `{ onboardingStatus: 'COMPLETE' }` |

---

## 💾 Local Storage Structure

```typescript
// After successful login, store:
{
  // Auth data
  authToken: "eyJhbGciOi....",
  refreshToken: "eyJhbGciOi....",
  expiresIn: 86400,  // seconds
  
  // User info
  user: {
    id: "uuid",
    email: "admin@school.test",
    schoolId: "uuid",
    role: "SCHOOL_ADMIN"
  },
  
  // School info
  school: {
    id: "uuid",
    name: "School Name",
    slug: "school-name"
  }
}
```

---

## 🎓 Best Practices

### 1. Token Management
```typescript
// Automatically refresh token before expiry
setInterval(() => {
  const expiresIn = localStorage.getItem('expiresIn');
  if (Date.now() > expiresIn - 300000) { // 5 min before expiry
    refreshToken();
  }
}, 60000); // Check every minute
```

### 2. Network Error Handling
```typescript
// Implement retry logic for failures
const apiCall = async (url, config, retries = 3) => {
  try {
    return await axios(url, config);
  } catch (error) {
    if (retries > 0 && error.response?.status >= 500) {
      await sleep(1000);
      return apiCall(url, config, retries - 1);
    }
    throw error;
  }
};
```

### 3. Session Timeout
```typescript
// Track user activity and logout after inactivity
let inactivityTimer;

const resetInactivityTimer = () => {
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(() => {
    logout(); // Inactivity timeout
  }, 30 * 60 * 1000); // 30 minutes
};

// Call on user action
document.addEventListener('click', resetInactivityTimer);
document.addEventListener('keypress', resetInactivityTimer);
```

### 4. Progressive Enhancement
```typescript
// Show step summary before advancing
const ConfirmStep = () => (
  <div>
    <h3>Review Your Information</h3>
    <DataDisplay data={formData} />
    <button onClick={onPrevious}>Back</button>
    <button onClick={onNext}>Confirm & Continue</button>
  </div>
);
```

---

## 📚 Additional Resources

- **Backend API Guide**: `ONBOARDING_API_GUIDE.md`
- **Database Schema**: `DESIGN_SPECIFICATION.md`
- **Implementation Status**: `PHASE_2_COMPLETION_SUMMARY.md`
- **Project Root**: `/Users/user/Desktop/ResultsPro`
- **Backend Path**: `/Users/user/Desktop/ResultsPro/backend`
- **Frontend Path**: `/Users/user/Desktop/ResultsPro`

---

## 🆘 Troubleshooting

### Q: Backend not responding
**A**: 
```bash
# Check if server is running
curl http://localhost:5000/api/health

# If not, restart it
cd /Users/user/Desktop/ResultsPro/backend
npx tsx watch src/server.ts
```

### Q: Authentication fails with valid credentials
**A**: 
```bash
# Check database hasn't been reset
# Re-seed if needed
cd /Users/user/Desktop/ResultsPro/backend
npm run db:seed
```

### Q: CORS errors when requesting backend
**A**: Frontend URL needs to be whitelisted in backend `.env`
```bash
# Current setting
FRONTEND_URL=http://localhost:8081

# Update if different
```

### Q: Token expired
**A**: Call refresh endpoint
```javascript
const refreshToken = async () => {
  const response = await axios.post(
    'http://localhost:5000/api/auth/refresh',
    { refreshToken: localStorage.getItem('refreshToken') }
  );
  localStorage.setItem('authToken', response.data.data.token);
};
```

---

## ✅ Ready to Start!

You now have:
- ✅ Full API documentation
- ✅ Backend running and tested
- ✅ Test credentials available
- ✅ Sample implementation patterns
- ✅ Error handling guidelines
- ✅ Best practices documented

**Start by creating the Login page component and integrate with `/api/auth/login` endpoint.**

Good luck! 🚀
