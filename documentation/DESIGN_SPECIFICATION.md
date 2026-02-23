# Results Pro - School Registration & Onboarding Design Specification

**Version:** 1.0  
**Date:** February 17, 2026  
**Status:** Design Phase  

---

## Table of Contents
1. [User Journey Overview](#user-journey-overview)
2. [Complete User Flow](#complete-user-flow)
3. [Frontend Screens & Touchpoints](#frontend-screens--touchpoints)
4. [Database Schema](#database-schema)
5. [API Endpoints](#api-endpoints)
6. [Backend Architecture](#backend-architecture)

---

## User Journey Overview

### High-Level Journey Map
```
Public User → Registration → Email Verification → Admin Approval → 
Login → Onboarding Wizard → Setup Complete → Dashboard Tour → 
Ready to Upload Data
```

### Key Personas & Interactions
- **Primary Actor:** School Principal/Administrator
- **Secondary Actor:** Super Admin (verification/approval)
- **Decision Points:** Email verification, admin approval, onboarding completion
- **Maximum Time to First Value:** 15-20 minutes

---

## Complete User Flow

### Phase 1: Registration (Public Website)

#### Stage 1.1: Initial Landing → Registration Page
**URL:** `https://resultspro.ng/` → Click "Get Started"

**Touchpoint 1.1.1: CTA Button on Landing Page**
```
Navigation Bar or Hero Section
├── "Get Started" Button (Primary CTA)
│   └── scrolls to registration form or 
│       navigates to /auth/register
```

**Screen 1.1.2: Registration Form**
```
Form Inputs:
├── School Name (Text Input)
│   └── Autocomplete from Ministry of Education database (Future)
├── Email Address (Email Input)
│   └── Unique validation
├── Phone Number (Tel Input)
│   └── Format: +234 XXX XXX XXXX
├── Full Address (Text Input)
├── State/LGA (Dropdown)
├── Checkbox: "I agree to Terms & Conditions"
└── Submit Button: "Create Account"

Form Validation Rules:
├── All fields required
├── Email must be unique
├── Phone format validation
├── Password (added after form submission) minimum 8 chars
└── Strong password requirements shown
```

#### Stage 1.2: Email Verification

**Touchpoint 1.2.1: Email Confirmation Page**
```
Display:
├── Message: "Verification email sent to [email]"
├── Countdown timer: "Code expires in  10 minutes"
├── Input: Enter 6-digit OTP code
├── Link: "Resend verification code"
├── Link: "Use a different email"
└── Submit Button: "Verify Email"

User Path:
├── User clicks verification link in email (Auto-fills OTP)
│   └── OR manually enters 6-digit code
├── System validates OTP
├── Success: Proceeds to next stage
└── Failure: Show error, allow retry (3 attempts), then resend
```

---

### Phase 2: Admin Verification & Approval

#### Stage 2.1: Super Admin School Verification Dashboard

**Touchpoint 2.1.1: Pending Schools Queue (Super Admin View)**
```
URL: /super-admin/schools?filter=pending

Display:
├── Card Layout for each pending school:
│   ├── School Name
│   ├── Admin Email & Phone
│   ├── Physical Address
│   ├── Registration Date
│   ├── Verification Status: "Pending Verification"
│   ├── Actions:
│   │   ├── "View Full Details" Button
│   │   ├── "Approve" Button (Green)
│   │   ├── "Request More Info" Button (Yellow)
│   │   └── "Reject" Button (Red)

Verification Checklist (displayed on expand):
├── ☐ School name verified via FIRS/CAC
├── ☐ Contact email verified (test email sent)
├── ☐ Phone number verified (SMS sent)
├── ☐ Physical address valid
├── ☐ No existing school with same registration
└── Notes field for verification comments
```

**Touchpoint 2.1.2: Approval Actions**
```
Action: Approve School
├── System sends approval email to school admin
├── Email includes: Temporary login password or reset link
├── Creates school record in active schools table
├── Onboarding status set to "Pending - Awaiting Login"
└── Super admin sees success message

Action: Request More Info
├── Opens modal for message
├── User enters reason for request
├── Email sent to school admin with request details
├── School record status: "Awaiting Additional Info"
└── School can update and resubmit

Action: Reject School
├── Confirmation dialog with reason field
├── Email sent explaining rejection reason
├── Record marked as "Rejected"
└── School can reapply after 30 days
```

---

### Phase 3: First Login & Onboarding Wizard

#### Stage 3.1: Login Page (First Time)

**Touchpoint 3.1.1: Email Verification Confirmation Page**
```
URL: /auth/verify-email?token={token}

Display:
├── Success message: "Your email has been verified!"
├── Status: "Your school account is under admin review"
├── Progress: "Step 1 of 2 - Email Verified ✓"
├── Next Step indication
└── "Wait for approval notification" message
```

**Touchpoint 3.1.2: Login After Approval**
```
URL: /auth/login

User receives email:
Subject: "Your Results Pro account is ready!"
├── Login URL
├── Email
├── Temporary Password (if applicable)
└── "Complete your setup" CTA

Login Flow:
├── Email + Password
├── 2FA Option (SMS or Email - configure later)
├── "Forgot password?" link
└── Submit button

Post-Login Behavior:
├── Check onboarding_status in user record
├── If first_login = true:
│   └── Redirect to onboarding wizard (not dashboard)
└── Else:
    └── Redirect to dashboard
```

---

#### Stage 3.2: Onboarding Wizard (6 Steps)

**UX Principles for Wizard:**
- Progress bar at top showing: "Step X of 6"
- Call-to-action: "Let's set up your school"
- Can skip most steps (except Step 6)
- Save state automatically after each step
- "Back" button to review previous steps
- "Save & Exit" to continue later
- Celebration screen after completion

---

### **STEP 1: Complete School Profile**

**URL:** `/onboarding/school-profile`

**Screen Components:**
```
Progress: ████░░░░░░ (1/6)

Form Inputs:
├── School Logo
│   ├── File upload (PNG/JPG/SVG)
│   ├── Max 2MB
│   ├── Preview: Circular badge
│   └── Fallback: Logo emoji selector (current system)
│
├── School Motto
│   ├── Text input (max 150 chars)
│   ├── Character counter
│   └── Placeholder: "Nurturing Excellence, Building Futures"
│
├── Primary Color Picker
│   ├── Color palette with presets
│   ├── Hex input field
│   └── Live preview on sample card
│
├── Secondary Color Picker
│   └── Same as primary
│
├── Accent Color Picker
│   └── Same as primary
│
└── Contact Information
    ├── Contact Person Name
    ├── Contact Email (pre-filled, editable)
    ├── Contact Phone (pre-filled, editable)
    ├── Alternative Contact Email (optional)
    └── Alternative Contact Phone (optional)

Actions:
├── "Preview" button (shows result card preview)
├── "Save & Continue" button (Green)
├── "Save & Exit" button (Gray)
└── "Back" button (if not first step)
```

**Data Validation:**
```
├── Logo: File type validation
├── Motto: Required, max 150 chars
├── Colors: Valid hex codes
├── Contact: At least one valid email
└── Email format validation
```

**Local State:**
```typescript
interface SchoolProfile {
  logoUrl?: string;
  logoEmoji?: string;
  motto: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  contactEmail2?: string;
  contactPhone2?: string;
}
```

---

### **STEP 2: Create Academic Session & Terms**

**URL:** `/onboarding/academic-session`

**Screen Components:**
```
Progress: ████████░░ (2/6)

Heading: "Academic Session & Terms Setup"
Description: "Configure your current academic session and terms"

Section 1: Current Academic Session
├── Session Name Input
│   ├── Placeholder: "2024/2025"
│   ├── Validation: Format "YYYY/YYYY"
│   └── Auto-populate current year
│
├── Session Start Date (Date Picker)
│   └── Default: September 1 of session year
│
├── Session End Date (Date Picker)
│   └── Default: July 31 of following year
│
└── "Create Session" button

Section 2: Terms Configuration (appears after session created)
├── Repeatable Term Inputs (3 terms):
│   ├── Term Number (1, 2, 3 - auto-filled)
│   ├── Term Name
│   │   ├── Default: "First Term", "Second Term", "Third Term"
│   │   ├── Editable
│   │   └── Suggestions for alternate names (e.g., "First Semester")
│   │
│   ├── Term Start Date (Date Picker)
│   │   └── Auto-calculated based on session length
│   │
│   ├── Term End Date (Date Picker)
│   │   └── Auto-calculated
│   │
│   ├── Break Start Date (Optional)
│   └── Break End Date (Optional)
│
├── "Add Another Term" button (+ icon)
└── "Remove Term" button (for each term)

Live Preview:
├── Calendar view showing all terms and breaks
├── Color coding for terms vs breaks
└── Visual overlap detection (warning if dates overlap)

Actions:
├── "Preview Academic Calendar" button
├── "Save & Continue" button (Green)
├── "Save & Exit" button
└── "Back" button
```

**Data Validation:**
```
├── Session format: "YYYY/YYYY"
├── Session dates: Start < End
├── At least 2 terms required
├── Term names: Required, unique names
├── Term dates: Must fall within session dates
├── No term overlap
└── Terms sorted chronologically
```

**Local State:**
```typescript
interface AcademicSession {
  name: string; // "2024/2025"
  startDate: Date;
  endDate: Date;
  terms: {
    termNumber: number;
    name: string;
    startDate: Date;
    endDate: Date;
    breakStartDate?: Date;
    breakEndDate?: Date;
  }[];
}
```

---

### **STEP 3: Create Classes**

**URL:** `/onboarding/classes`

**Screen Components:**
```
Progress: ██████████░ (3/6)

Heading: "Create Classes"
Description: "Add all classes your school has"
Tip: "You can add more classes anytime"

Section 1: Class Creation Interface
├── Quick Presets (Buttons):
│   ├── "Primary School (1-6)" → Auto-fills Primary 1-6
│   ├── "Junior Secondary (1-3)" → Auto-fills JSS 1-3
│   ├── "Senior Secondary (1-3)" → Auto-fills SS 1-3
│   └── "Custom" → Manual entry
│
└── Manual Class Entry Repeatable Form:
    ├── Class Code Input (e.g., "PRIMARY_1")
    │   └── Used internally for CSV mapping
    │
    ├── Class Name Input (e.g., "Primary 1")
    │   ├── Human-readable
    │   └── Displayed to students/parents
    │
    ├── Class Level Select (Enum)
    │   ├── Primary 1-6
    │   ├── JSS 1-3
    │   ├── SS 1-3
    │   └── Other
    │
    ├── Expected Student Count (Number)
    │   └── For quota planning
    │
    ├── Form Teacher (optional, searchable dropdown)
    │   └── Populated from teachers list (added later)
    │
    └── Remove Class button (trash icon)

Section 2: Added Classes Summary
├── Table Display:
│   ├── Columns: Class Code, Class Name, Level, Expected Students
│   ├── Edit icon per row
│   ├── Delete icon per row
│   └── Drag-to-reorder handles
│
└── Add Another Class button (+ icon)

Actions:
├── "Save & Continue" button (Green)
├── "Save & Exit" button
└── "Back" button
```

**Data Validation:**
```
├── At least 1 class required
├── Class code: Unique, alphanumeric with underscores
├── Class name: Required, max 50 chars
├── Class level: Required
├── Expected students: Optional, numeric, > 0
└── No duplicate class names
```

**Local State:**
```typescript
interface Class {
  id: string;
  classCode: string;
  className: string;
  classLevel: 'PRIMARY' | 'JSS' | 'SS' | 'OTHER';
  expectedStudents?: number;
  formTeacher?: string;
  order: number;
}
```

---

### **STEP 4: Create Subject Groups (by Class)**

**URL:** `/onboarding/subjects`

**Screen Components:**
```
Progress: ████████████░ (4/6)

Heading: "Add Subjects"
Description: "Configure subjects for each class"
Note: "You'll upload CSV files with all students and their subjects later"

Section 1: Class Selection Tabs
├── Tab for each class created in Step 3
│   ├── e.g., "Primary 1", "Primary 2", "JSS 1"
│   └── Shows which classes have subjects configured
│
└── Visual indicator: "2/5 classes completed" ✓

Section 2: Subject Configuration (per class)
├── Heading: "Subjects for [Class Name]"
├── Subheading: "These subjects will appear on result sheets"
│
└── Repeatable Subject Inputs:
    ├── Subject Name (Text Input)
    │   ├── Autocomplete from national curriculum
    │   ├── Suggestions: Math, English, Science, etc.
    │   ├── Max 50 characters
    │   └── Validation: Required, unique per class
    │
    ├── Subject Code (Auto-populated)
    │   ├── Generated from subject name
    │   ├── e.g., "MATH", "ENG", "SCI"
    │   ├── User can edit
    │   └── Must be unique per class
    │
    ├── Subject Category (Dropdown)
    │   ├── "Core Subject" (required for all students)
    │   ├── "Elective" (students choose)
    │   ├── "Vocational"
    │   └── "Extracurricular"
    │
    ├── Credit Hours (Optional, Numeric)
    │   └── For university-prep tracking
    │
    ├── Is Compulsory (Toggle)
    │   └── Show in mandatory results view
    │
    └── Remove Subject button (trash icon)

Quick Add Features:
├── "Add Core Subjects" button
│   └── Adds: English, Math, Integrated Science
│
├── "Add All Subjects" button
│   └── Fills all subjects for selected class
│
└── "Add Another Subject" button (+ icon)

Bulk Import Option (Advanced):
├── "Import Subjects from Class" dropdown
│   ├── Copy subjects from previously configured class
│   └── Useful for uniform subject across multiple classes
│
└── "Apply" button

Subject Order:
├── Drag-to-reorder subjects
└── Optional: Display order in result sheets

Actions:
├── Navigation tabs to switch between classes
├── "Save & Continue" button (Green)
│   └── Validates all classes have at least 1 subject
├── "Save & Exit" button
└── "Back" button

Progress Indicator:
└── Shows: "Configured [X]/[Total] classes with subjects"
```

**Data Validation:**
```
├── At least 1 subject per class required
├── Subject name: Required, unique per class, max 50 chars
├── Subject code: Required, unique per class, alphanumeric
├── Subject category: Required
└── No blank subjects
```

**Local State:**
```typescript
interface Subject {
  id: string;
  classId: string;
  subjectName: string;
  subjectCode: string;
  category: 'CORE' | 'ELECTIVE' | 'VOCATIONAL' | 'EXTRACURRICULAR';
  creditHours?: number;
  isCompulsory: boolean;
  order: number;
}
```

---

### **STEP 5: Configure Grading System**

**URL:** `/onboarding/grading-system`

**Screen Components:**
```
Progress: ██████████████░ (5/6)

Heading: "Configure Grading System"
Description: "Define how scores map to grades for your school"

Section 1: Grading Template Selection
├── Preset Templates (Radio Buttons):
│   ├── ☐ "Standard 5-Point Grading"
│   │   └── A (80-100), B (70-79), C (60-69), D (50-59), F (0-49)
│   │
│   ├── ☐ "Extended 7-Point Grading"
│   │   └── A+ (95-100), A (90-94), B+ (85-89), B (80-84), C (70-79), D (60-69), F (0-59)
│   │
│   ├── ☐ "Cambridge GCE System"
│   │   └── A (80-100), B (70-79), C (60-69), D (50-59), E (40-49), F (0-39)
│   │
│   ├── ☐ "WAEC/NECO System"
│   │   └── A1 (75-100), A2 (70-74), B2 (65-69), B3 (60-64), C4 (55-59), C5 (50-54), D6 (45-49), E7 (40-44), F8 (0-39), F9 (Absent)
│   │
│   └── ☐ "Custom" → Allow custom configuration
│
└── Selected template shows: Visual grade scale with colors

Section 2: Custom Grading (if selected)
├── Repeatable Grade Inputs:
│   ├── Grade Letter (e.g., "A", "B", "C")
│   │   └── User inputs
│   │
│   ├── Score Range Min (Number)
│   │   └── e.g., 80
│   │
│   ├── Score Range Max (Number)
│   │   └── e.g., 100
│   │
│   ├── Remark/Comment (e.g., "Excellent", "Good")
│   │   └── Displayed on result sheet
│   │
│   ├── Grade Color (Color Picker)
│   │   └── Visual indication (Green, Blue, Yellow, Orange, Red)
│   │
│   └── Remove Grade button
│
├── "Add Another Grade" button
└── Validation: Show error if ranges overlap or have gaps

Section 3: Scoring Components (Optional for now)
├── Toggle: "Enable Multiple Score Components"
│   ├── If enabled:
│   │   ├── Continuous Assessment (CA) weight (%)
│   │   ├── Exam weight (%)
│   │   ├── Project/Assignment weight (%)
│   │   └── Auto-calculates total = 100%
│   │
│   └── Help text: "E.g., CA 30% + Exam 70%"
│
└── Display: How final score is calculated

Section 4: Grade Scale Visualization
├── Bar chart showing grade ranges
├── Color coded
└── Updates in real-time as user configures

Actions:
├── Preview button: Shows sample student result with grading
├── "Save & Continue" button (Green)
├── "Save & Exit" button
└── "Back" button
```

**Data Validation:**
```
├── Grades defined: At least 2
├── Score ranges: 0-100 coverage, no overlaps
├── All ranges should sum to 100 potential points
├── Grade letters: Unique, not blank
├── Component weights: Must sum to 100% (if enabled)
└── Color codes: Valid hex values
```

**Local State:**
```typescript
interface GradingSystem {
  templateType: 'STANDARD_5' | 'EXTENDED_7' | 'CAMBRIDGE' | 'WAEC_NECO' | 'CUSTOM';
  grades: {
    gradeLetterr: string;
    minScore: number;
    maxScore: number;
    remark: string;
    color: string;
  }[];
  scoringComponents?: {
    ca: number; // percentage
    exam: number;
    project?: number;
  };
}
```

---

### **STEP 6: Sample CSV Data Upload & Validation**

**URL:** `/onboarding/csv-upload`

**Screen Components:**
```
Progress: ████████████████░ (6/6) - FINAL STEP

Heading: "Upload Your Data"
Description: "Upload a sample CSV with student data and results"
Note: "This is optional now but required before publishing results"

Section 1: Instructions
├── "Download CSV Template" button
│   ├── Generates template with:
│   │   ├── Columns: Student ID, Name, Class, Subject 1, Subject 2, ...
│   │   ├── Sample rows (3 examples)
│   │   └── Instructions in first row
│   │
│   └── Auto-generates based on classes/subjects configured
│
├── "View Example CSV" link
│   └── Opens modal with properly formatted CSV example
│
└── Step-by-step guide text:
    ├── 1. Download template
    ├── 2. Fill in your student data and scores
    ├── 3. Upload file
    ├── 4. Review and validate
    └── 5. Publish

Section 2: CSV Upload
├── File Drop Zone
│   ├── Accepts: .csv, .xlsx
│   ├── Max file size: 10MB
│   ├── Drag & drop area
│   └── Click to browse button
│
└── or:
    └── "Skip for now" link
        └── Can upload later from dashboard

Section 3: File Upload Validation (after selection)
├── Show progress: "Processing file..."
├── Checks:
│   ├── File format validation
│   ├── Column count matches expected
│   ├── Required columns present
│   ├── Data type validation
│   ├── Duplicate student IDs
│   ├── Invalid scores (> 100)
│   └── Missing required fields
│
└── Results:
    ├── Success: "15 students loaded, 0 errors"
    ├── Warnings: "2 students have missing dates"
    └── Errors: "Student 'John Doe' has invalid score in Math"

If Invalid:
├── Show error report with:
│   ├── Row number
│   ├── Column name
│   ├── Current value
│   ├── Error reason
│   └── Suggested fix
│
├── "Download Error Report" button
└── Allow re-upload

If Valid (or Skip):
└── Preview table showing loaded students

Actions:
├── "Save & Continue" button (Green)
│   └── If validation passed
├── "Skip & Finish Setup" button (Gray)
│   └── If user chooses to skip CSV
└── "Back" button
```

**Data Validation (CSV):**
```
Columns required:
├── student_id (unique)
├── name
├── class
└── subject scores (dynamic based on configured subjects)

Additional validations:
├── No more than 1000 students per file (batch processing for large schools)
├── Scores: numeric, 0-100
├── Class names: must match configured classes
├── Subject names: must match configured subjects
└── Date formats: Standardized (YYYY-MM-DD)
```

---

### **STEP 7: Completion Screen**

**URL:** `/onboarding/complete`

**Screen Components:**
```
Celebration Screen:
├── Confetti animation
├── Success icon/badge
├── Heading: "Setup Complete! 🎉"
├── Message: "Your school is ready to go"
│
├── Summary of what was configured:
│   ├── ✓ School Profile
│   ├── ✓ Academic Session (2024/2025, 3 terms)
│   ├── ✓ 6 Classes configured
│   ├── ✓ 54 Subjects added across classes
│   ├── ✓ Grading System configured
│   └── ✓ Sample data uploaded (if applicable)
│
├── Next Steps Cards:
│   ├── Card 1: "Explore Your Dashboard"
│   │   ├── Icon
│   │   ├── Description: "View overview of your school setup"
│   │   └── Button: "Go to Dashboard"
│   │
│   ├── Card 2: "Upload Student Results"
│   │   ├── Icon
│   │   ├── Description: "Bulk upload results by class"
│   │   └── Button: "Upload Results"
│   │
│   ├── Card 3: "View Demo Tour"
│   │   ├── Icon
│   │   ├── Description: "Learn key features with guided tour"
│   │   └── Button: "Start Tour"
│   │
│   └── Card 4: "School Settings"
│       ├── Icon
│       ├── Description: "Configure additional options"
│       └── Button: "Go to Settings"
│
└── CTA Button: "Go to Dashboard" (Primary)
```

---

### **Phase 4: Dashboard Tour (Post-Onboarding)**

**URL:** `/school-admin/overview`

**Animated Tooltip Tour:**
```
Tour Sequence (Plays automatically if first_login = true):

Step 1: Dashboard Overview
├── Highlight: Main dashboard cards
├── Tooltip: "Welcome to your dashboard. Here you can see a quick overview of your school's activities."
├── Next button

Step 2: Academic Session Info
├── Highlight: "2024/2025 - First Term" card
├── Tooltip: "Your current academic session and term. Click to change."
├── Next button

Step 3: Quick Actions
├── Highlight: Action buttons row
├── Tooltip: "Quick access to common tasks like uploading results, managing students, etc."
├── Next button

Step 4: Analytics Section
├── Highlight: Charts/stats
├── Tooltip: "View analytics and performance reports."
├── Next button

Step 5: Sidebar Navigation
├── Highlight: Left sidebar menu
├── Tooltip: "Access all features from the sidebar."
├── Next button

Step 6: Settings & Support
├── Highlight: Settings and Help icons
├── Tooltip: "Configure your school settings or reach out to support."
├── End Tour button

User Controls:
├── "Skip Tour" button (always visible)
├── "Previous" button (from step 2 onwards)
├── "Next" button
├── Tour progress: "Step 2 of 6"
└── Don't show again checkbox
```

---

## Frontend Screens & Touchpoints

### Screens Checklist

#### Authentication Flow
- [ ] **Register Screen** - Initial school registration
- [ ] **Email Verification Screen** - Verify email with OTP
- [ ] **Verification Success Screen** - Confirm email, await approval
- [ ] **Login Screen** - Email + password
- [ ] **Password Reset Flow** (existing, needs minor updates for onboarding context)

#### Onboarding Wizard
- [ ] **Onboarding Index** - Redirects to current step or to dashboard if complete
- [ ] **Step 1: School Profile** - Logo, motto, colors, contact
- [ ] **Step 2: Academic Session** - Create session and terms
- [ ] **Step 3: Classes** - Create school classes
- [ ] **Step 4: Subjects** - Add subjects by class
- [ ] **Step 5: Grading System** - Configure grade scale
- [ ] **Step 6: CSV Upload** - Sample data import
- [ ] **Completion Screen** - Celebration + next steps

#### Dashboard Context
- [ ] **School Admin Layout** - Update to show onboarding status
- [ ] **Dashboard Tour** - Guided tour with tooltips
- [ ] **Onboarding Progress Widget** - Show where user is in setup flow

### Key UI Components Needed

```
New Components:
├── OnboardingWizard
│   ├── StepperProgress
│   ├── StepNavigation
│   ├── SaveState (auto-save indicator)
│   └── PreviewModal
│
├── FormComponents
│   ├── ColorPicker
│   ├── DateRangePickerEnhanced
│   ├── DragDropList (for reordering)
│   ├── CSVDropZone
│   ├── CSVPreviewTable
│   └── ErrorReport
│
└── Modals
    ├── ConfirmActionModal
    ├── PreviewModal
    └── HelpModal
```

---

## Database Schema

### Core Tables

#### Table: `schools`
```sql
CREATE TABLE schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic Information
  name VARCHAR(255) NOT NULL UNIQUE,
  slug VARCHAR(255) NOT NULL UNIQUE,
  motto VARCHAR(255),
  
  -- Branding
  logo_url VARCHAR(500),
  logo_emoji VARCHAR(10),
  primary_color VARCHAR(7),
  secondary_color VARCHAR(7),
  accent_color VARCHAR(7),
  
  -- Contact Information
  contact_email VARCHAR(255) NOT NULL,
  contact_phone VARCHAR(20),
  contact_person_name VARCHAR(255),
  alt_contact_email VARCHAR(255),
  alt_contact_phone VARCHAR(20),
  
  -- Address
  full_address VARCHAR(500),
  state VARCHAR(100),
  lga VARCHAR(100),
  
  -- Status & Verification
  status ENUM('PENDING_VERIFICATION', 'APPROVED', 'ACTIVE', 'SUSPENDED', 'REJECTED') DEFAULT 'PENDING_VERIFICATION',
  verification_status ENUM('NOT_VERIFIED', 'EMAIL_VERIFIED', 'PHONE_VERIFIED', 'ADMIN_VERIFIED', 'FULLY_VERIFIED') DEFAULT 'NOT_VERIFIED',
  verified_at TIMESTAMP,
  verified_by UUID REFERENCES admin_users(id),
  rejection_reason TEXT,
  
  -- Onboarding
  onboarding_status ENUM('NOT_STARTED', 'IN_PROGRESS', 'COMPLETE', 'ABANDONED') DEFAULT 'NOT_STARTED',
  onboarding_completed_at TIMESTAMP,
  current_onboarding_step INT DEFAULT 0,
  
  -- Subscription
  subscription_tier ENUM('FREE', 'BASIC', 'PREMIUM', 'ENTERPRISE') DEFAULT 'BASIC',
  subscription_start_date TIMESTAMP,
  subscription_end_date TIMESTAMP,
  max_students INT DEFAULT 100,
  max_teachers INT DEFAULT 20,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE INDEX idx_schools_slug ON schools(slug);
CREATE INDEX idx_schools_status ON schools(status);
CREATE INDEX idx_schools_verification_status ON schools(verification_status);
```

#### Table: `school_admin_users`
```sql
CREATE TABLE school_admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- School Association
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  
  -- User Information
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  phone VARCHAR(20),
  
  -- Authentication
  email_verified_at TIMESTAMP,
  email_verification_token VARCHAR(255),
  email_verification_expires_at TIMESTAMP,
  
  phone_verified_at TIMESTAMP,
  phone_verification_token VARCHAR(6),
  phone_verification_expires_at TIMESTAMP,
  
  -- 2FA
  two_fa_enabled BOOLEAN DEFAULT FALSE,
  two_fa_method ENUM('SMS', 'EMAIL', 'AUTHENTICATOR') DEFAULT 'SMS',
  two_fa_secret VARCHAR(255),
  
  -- Password Reset
  password_reset_token VARCHAR(255),
  password_reset_expires_at TIMESTAMP,
  
  -- Session & Login
  last_login_at TIMESTAMP,
  last_login_ip VARCHAR(45),
  current_session_token VARCHAR(500),
  session_expires_at TIMESTAMP,
  
  -- Onboarding
  onboarding_status ENUM('NOT_STARTED', 'IN_PROGRESS', 'COMPLETE') DEFAULT 'NOT_STARTED',
  onboarding_completed_at TIMESTAMP,
  first_login BOOLEAN DEFAULT TRUE,
  
  -- Role & Permissions
  role ENUM('ADMIN', 'TEACHER', 'STAFF') DEFAULT 'ADMIN',
  
  -- Status
  status ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED') DEFAULT 'ACTIVE',
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE UNIQUE INDEX idx_school_admin_users_email_per_school ON school_admin_users(school_id, email);
CREATE INDEX idx_school_admin_users_school_id ON school_admin_users(school_id);
```

#### Table: `academic_sessions`
```sql
CREATE TABLE academic_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- School Association
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  
  -- Session Details
  name VARCHAR(20) NOT NULL, -- e.g., "2024/2025"
  session_year INT NOT NULL, -- 2024
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  
  -- Status
  status ENUM('PLANNING', 'ONGOING', 'COMPLETED', 'ARCHIVED') DEFAULT 'PLANNING',
  is_current BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  
  UNIQUE(school_id, name),
  CHECK (start_date < end_date)
);

CREATE INDEX idx_academic_sessions_school_id ON academic_sessions(school_id);
CREATE INDEX idx_academic_sessions_is_current ON academic_sessions(school_id, is_current);
```

#### Table: `terms`
```sql
CREATE TABLE terms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Session Association
  academic_session_id UUID NOT NULL REFERENCES academic_sessions(id) ON DELETE CASCADE,
  
  -- Term Details
  term_number INT NOT NULL, -- 1, 2, 3
  name VARCHAR(100) NOT NULL, -- "First Term", "Term 1", etc.
  
  -- Dates
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  break_start_date DATE,
  break_end_date DATE,
  
  -- Status
  status ENUM('NOT_STARTED', 'ONGOING', 'COMPLETED', 'ARCHIVED') DEFAULT 'NOT_STARTED',
  is_current BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  
  UNIQUE(academic_session_id, term_number),
  CHECK (start_date < end_date),
  CHECK (break_start_date IS NULL OR break_end_date IS NULL OR break_start_date < break_end_date)
);

CREATE INDEX idx_terms_academic_session_id ON terms(academic_session_id);
```

#### Table: `classes`
```sql
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- School Association
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  
  -- Class Details
  class_code VARCHAR(50) NOT NULL,
  class_name VARCHAR(100) NOT NULL,
  class_level ENUM('PRIMARY_1', 'PRIMARY_2', ... , 'SS_3', 'OTHER') NOT NULL,
  
  -- Capacity
  expected_student_count INT,
  form_teacher_id UUID REFERENCES school_admin_users(id),
  
  -- Display Order
  display_order INT DEFAULT 0,
  
  -- Status
  status ENUM('ACTIVE', 'ARCHIVED', 'INACTIVE') DEFAULT 'ACTIVE',
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  
  UNIQUE(school_id, class_code)
);

CREATE INDEX idx_classes_school_id ON classes(school_id);
```

#### Table: `subjects`
```sql
CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- School Association (can be shared across classes or class-specific)
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  
  -- Subject Details
  subject_name VARCHAR(100) NOT NULL,
  subject_code VARCHAR(20) NOT NULL,
  category ENUM('CORE', 'ELECTIVE', 'VOCATIONAL', 'EXTRACURRICULAR') DEFAULT 'CORE',
  credit_hours DECIMAL(3,1),
  
  -- Requirements
  is_compulsory BOOLEAN DEFAULT TRUE,
  
  -- Display Order
  display_order INT DEFAULT 0,
  
  -- Status
  status ENUM('ACTIVE', 'INACTIVE', 'ARCHIVED') DEFAULT 'ACTIVE',
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  
  UNIQUE(school_id, class_id, subject_code)
);

CREATE INDEX idx_subjects_school_id ON subjects(school_id);
CREATE INDEX idx_subjects_class_id ON subjects(class_id);
```

#### Table: `grading_systems`
```sql
CREATE TABLE grading_systems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- School Association
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  
  -- System Configuration
  template_type ENUM('STANDARD_5', 'EXTENDED_7', 'CAMBRIDGE', 'WAEC_NECO', 'CUSTOM') DEFAULT 'STANDARD_5',
  name VARCHAR(100) NOT NULL,
  description TEXT,
  
  -- Components
  scoring_components JSON, -- {ca: 30, exam: 70, project: 0}
  
  -- Status
  status ENUM('ACTIVE', 'INACTIVE', 'ARCHIVED') DEFAULT 'ACTIVE',
  is_default BOOLEAN DEFAULT TRUE,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  
  UNIQUE(school_id, name)
);

CREATE INDEX idx_grading_systems_school_id ON grading_systems(school_id);
```

#### Table: `grades`
```sql
CREATE TABLE grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- System Association
  grading_system_id UUID NOT NULL REFERENCES grading_systems(id) ON DELETE CASCADE,
  
  -- Grade Details
  grade_letter VARCHAR(5) NOT NULL,
  min_score DECIMAL(5,2) NOT NULL,
  max_score DECIMAL(5,2) NOT NULL,
  remark VARCHAR(100),
  grade_color VARCHAR(7),
  
  -- Display Order
  display_order INT DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  
  UNIQUE(grading_system_id, grade_letter),
  CHECK (min_score >= 0 AND max_score <= 100 AND min_score < max_score)
);

CREATE INDEX idx_grades_grading_system_id ON grades(grading_system_id);
```

#### Table: `onboarding_state`
```sql
CREATE TABLE onboarding_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- School Association
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  
  -- Step Data (JSON for flexibility)
  step_1_data JSON, -- School profile
  step_2_data JSON, -- Academic session
  step_3_data JSON, -- Classes
  step_4_data JSON, -- Subjects
  step_5_data JSON, -- Grading system
  step_6_data JSON, -- CSV upload
  
  -- Completion Status
  completed_steps INT[] DEFAULT '{}',
  current_step INT DEFAULT 1,
  is_complete BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  UNIQUE(school_id)
);

CREATE INDEX idx_onboarding_state_school_id ON onboarding_state(school_id);
```

---

## API Endpoints

### Authentication & Registration Endpoints

#### `POST /api/auth/register`
**Purpose:** Initial registration of school

```
Request:
{
  "schoolName": "Alexander Obi International College",
  "email": "principal@aoic.edu.ng",
  "phone": "+234 806 702 8859",
  "fullAddress": "Plot 45, Victoria Island, Lagos",
  "state": "Lagos",
  "lga": "Ikoyi"
}

Response (201):
{
  "success": true,
  "message": "Registration successful. Please check your email for verification.",
  "data": {
    "schoolId": "uuid",
    "email": "principal@aoic.edu.ng",
    "verificationSent": true,
    "expiresIn": 600 // seconds
  }
}

Response (400):
{
  "success": false,
  "error": "Email already registered",
  "code": "DUPLICATE_EMAIL"
}
```

#### `POST /api/auth/verify-email`
**Purpose:** Verify email with OTP

```
Request:
{
  "email": "principal@aoic.edu.ng",
  "otp": "123456"
}

Response (200):
{
  "success": true,
  "message": "Email verified. Your school is pending admin approval.",
  "data": {
    "schoolId": "uuid",
    "status": "PENDING_VERIFICATION",
    "nextStep": "await_approval"
  }
}

Response (400):
{
  "success": false,
  "error": "Invalid or expired OTP",
  "code": "INVALID_OTP",
  "attemptsRemaining": 2
}
```

#### `POST /api/auth/resend-verification`
**Purpose:** Resend verification OTP

```
Request:
{
  "email": "principal@aoic.edu.ng"
}

Response (200):
{
  "success": true,
  "message": "Verification code sent",
  "data": {
    "expiresIn": 600
  }
}
```

#### `POST /api/auth/login`
**Purpose:** School admin login

```
Request:
{
  "email": "principal@aoic.edu.ng",
  "password": "securepassword123"
}

Response (200):
{
  "success": true,
  "data": {
    "token": "jwt_token",
    "refreshToken": "refresh_token",
    "user": {
      "id": "uuid",
      "schoolId": "uuid",
      "email": "principal@aoic.edu.ng",
      "fullName": "Dr. Samuel Okoroafor",
      "role": "ADMIN"
    },
    "school": {
      "id": "uuid",
      "name": "Alexander Obi International College",
      "onboardingStatus": "COMPLETE",
      "status": "ACTIVE"
    }
  }
}

Response (401):
{
  "success": false,
  "error": "Invalid email or password",
  "code": "AUTH_FAILED"
}

Response (403):
{
  "success": false,
  "error": "School not yet approved. Please wait for admin approval.",
  "code": "SCHOOL_NOT_APPROVED"
}
```

---

### Onboarding Endpoints

#### `GET /api/onboarding/status`
**Purpose:** Get current onboarding status and progress

```
Response (200):
{
  "success": true,
  "data": {
    "schoolId": "uuid",
    "onboardingStatus": "IN_PROGRESS",
    "currentStep": 3,
    "completedSteps": [1, 2],
    "stepData": {
      "1": { ..., "completed": true },
      "2": { ..., "completed": true },
      "3": { ..., "completed": false }
    }
  }
}
```

#### `POST /api/onboarding/step/:stepNumber`
**Purpose:** Save onboarding data for specific step

```
POST /api/onboarding/step/1
Request:
{
  "logoUrl": "https://...",
  "motto": "Nurturing Excellence",
  "primaryColor": "#3b82f6",
  "secondaryColor": "#1e40af",
  "accentColor": "#FCD34D",
  "contactPerson": "Dr. Samuel",
  "contactEmail": "principal@aoic.edu.ng",
  "contactPhone": "+234 806 702 8859"
}

Response (200):
{
  "success": true,
  "message": "Step 1 saved successfully",
  "data": {
    "stepCompleted": true,
    "nextStep": 2
  }
}
```

#### `POST /api/onboarding/complete`
**Purpose:** Mark onboarding as complete

```
Response (200):
{
  "success": true,
  "message": "Onboarding complete!",
  "data": {
    "schoolId": "uuid",
    "onboardingStatus": "COMPLETE",
    "completedAt": "2024-02-17T10:30:00Z",
    "redirectTo": "/school-admin/overview"
  }
}
```

---

### School Profile Endpoints

#### `GET /api/schools/my-school`
**Purpose:** Get authenticated school's profile

```
Response (200):
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Alexander Obi International College",
    "slug": "aoic-lagos",
    "motto": "Nurturing Excellence",
    "logo": "url",
    "primaryColor": "#3b82f6",
    "status": "ACTIVE",
    "subscriptionTier": "PREMIUM",
    "maxStudents": 500,
    "currentStudentCount": 450,
    "createdAt": "2024-01-15"
  }
}
```

#### `PUT /api/schools/my-school`
**Purpose:** Update school profile

```
Request:
{
  "motto": "Updated motto",
  "primaryColor": "#8b5cf6",
  "contactEmail": "newemail@aoic.edu.ng"
}

Response (200):
{
  "success": true,
  "message": "School profile updated",
  "data": { ... }
}
```

---

### Academic Session Endpoints

#### `POST /api/schools/academic-sessions`
**Purpose:** Create academic session with terms

```
Request:
{
  "name": "2024/2025",
  "startDate": "2024-09-01",
  "endDate": "2025-07-31",
  "terms": [
    {
      "termNumber": 1,
      "name": "First Term",
      "startDate": "2024-09-01",
      "endDate": "2024-11-30",
      "breakStartDate": "2024-12-01",
      "breakEndDate": "2024-12-31"
    },
    { ... },
    { ... }
  ]
}

Response (201):
{
  "success": true,
  "message": "Academic session created",
  "data": {
    "id": "uuid",
    "name": "2024/2025",
    "terms": [ ... ]
  }
}
```

#### `GET /api/schools/academic-sessions`
**Purpose:** Get all academic sessions for school

```
Response (200):
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "2024/2025",
      "isCurrent": true,
      "status": "ONGOING",
      "terms": [ ... ]
    }
  ]
}
```

---

### Classes Endpoints

#### `POST /api/schools/classes`
**Purpose:** Create one or multiple classes

```
Request:
{
  "classes": [
    {
      "classCode": "PRIMARY_1",
      "className": "Primary 1",
      "classLevel": "PRIMARY_1",
      "expectedStudentCount": 45,
      "formTeacherId": "uuid" // optional
    },
    { ... }
  ]
}

Response (201):
{
  "success": true,
  "message": "Classes created successfully",
  "data": [
    {
      "id": "uuid",
      "classCode": "PRIMARY_1",
      "className": "Primary 1",
      "expectedStudentCount": 45
    }
  ]
}
```

#### `GET /api/schools/classes`
**Purpose:** Get all classes

```
Response (200):
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "classCode": "PRIMARY_1",
      "className": "Primary 1",
      "classLevel": "PRIMARY_1",
      "expectedStudentCount": 45,
      "studentCount": 42,
      "subjectCount": 8
    }
  ]
}
```

---

### Subjects Endpoints

#### `POST /api/schools/subjects`
**Purpose:** Create subjects for a class

```
Request:
{
  "classId": "uuid",
  "subjects": [
    {
      "subjectName": "Mathematics",
      "subjectCode": "MATH",
      "category": "CORE",
      "isCompulsory": true
    },
    { ... }
  ]
}

Response (201):
{
  "success": true,
  "message": "Subjects created successfully",
  "data": [ ... ]
}
```

#### `GET /api/schools/subjects?classId=uuid`
**Purpose:** Get subjects for a class

```
Response (200):
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "subjectName": "Mathematics",
      "subjectCode": "MATH",
      "category": "CORE",
      "isCompulsory": true,
      "displayOrder": 1
    }
  ]
}
```

---

### Grading System Endpoints

#### `POST /api/schools/grading-systems`
**Purpose:** Create or update grading system

```
Request:
{
  "templateType": "CUSTOM", // or STANDARD_5, EXTENDED_7, CAMBRIDGE, WAEC_NECO
  "name": "AOIC Grading System",
  "scoringComponents": {
    "ca": 30,
    "exam": 70
  },
  "grades": [
    {
      "gradeLetter": "A",
      "minScore": 80,
      "maxScore": 100,
      "remark": "Excellent",
      "gradeColor": "#22c55e",
      "displayOrder": 1
    },
    { ... }
  ]
}

Response (201):
{
  "success": true,
  "message": "Grading system created",
  "data": {
    "id": "uuid",
    "name": "AOIC Grading System",
    "grades": [ ... ]
  }
}
```

#### `GET /api/schools/grading-systems`
**Purpose:** Get all grading systems for school

```
Response (200):
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "AOIC Grading System",
      "templateType": "CUSTOM",
      "grades": [ ... ],
      "isDefault": true
    }
  ]
}
```

---

### CSV Upload & Validation Endpoints

#### `POST /api/csv/validate`
**Purpose:** Validate CSV before import

```
Request:
FormData:
  - file: [CSV file]
  - classId: "uuid" (optional, for single-class import)

Response (200):
{
  "success": true,
  "warnings": [],
  "errors": [],
  "rowCount": 45,
  "statusCode": "VALID"
}

Response (400):
{
  "success": false,
  "warnings": [
    {
      "row": 5,
      "column": "date_of_birth",
      "message": "Invalid date format",
      "suggestedFix": "Use YYYY-MM-DD format"
    }
  ],
  "errors": [
    {
      "row": 12,
      "column": "student_score_math",
      "message": "Score 150 exceeds maximum of 100",
      "suggestedFix": "Ensure scores are between 0-100"
    }
  ],
  "statusCode": "HAS_ERRORS"
}
```

#### `POST /api/csv/import`
**Purpose:** Import validated CSV data

```
Request:
FormData:
  - file: [CSV file]
  - academicSessionId: "uuid"
  - termId: "uuid"
  - overwrite: boolean (default: false)

Response (202):
{
  "success": true,
  "message": "Import started. This may take a few moments.",
  "data": {
    "jobId": "uuid",
    "statusUrl": "/api/csv/import-status/uuid"
  }
}
```

#### `GET /api/csv/import-status/:jobId`
**Purpose:** Check CSV import job status

```
Response (200):
{
  "success": true,
  "data": {
    "jobId": "uuid",
    "status": "COMPLETED", // PENDING, IN_PROGRESS, COMPLETED, FAILED
    "processedRows": 45,
    "totalRows": 45,
    "createdRecords": 45,
    "updatedRecords": 0,
    "errorCount": 0,
    "completedAt": "2024-02-17T10:30:00Z"
  }
}
```

#### `GET /api/csv/template`
**Purpose:** Download CSV template

```
Query Params:
  - academicSessionId: "uuid"
  - termId: "uuid"
  - classIds: "uuid1,uuid2" (comma-separated)

Response: CSV file with:
  - Headers: student_id, name, date_of_birth, gender, class, [subject1], [subject2], ...
  - 3 example rows
  - Instructions in comment rows
```

---

### Super Admin Verification Endpoints

#### `GET /api/super-admin/schools?status=PENDING_VERIFICATION`
**Purpose:** Get pending schools for verification

```
Response (200):
{
  "success": true,
  "data": {
    "results": [
      {
        "id": "uuid",
        "name": "Alexander Obi International College",
        "email": "principal@aoic.edu.ng",
        "phone": "+234 806 702 8859",
        "address": "Plot 45, Victoria Island, Lagos",
        "registeredAt": "2024-02-17T08:00:00Z",
        "verificationStatus": "EMAIL_VERIFIED",
        "adminNotes": ""
      }
    ],
    "total": 45,
    "page": 1,
    "pageSize": 10
  }
}
```

#### `POST /api/super-admin/schools/:schoolId/approve`
**Purpose:** Approve a school

```
Request:
{
  "notes": "All documents verified",
  "autoGeneratePassword": true // if true, system generates and sends password
}

Response (200):
{
  "success": true,
  "message": "School approved successfully",
  "data": {
    "schoolId": "uuid",
    "status": "APPROVED",
    "approvedAt": "2024-02-17T10:30:00Z",
    "approvedBy": "admin@resultspo.ng"
  }
}
```

#### `POST /api/super-admin/schools/:schoolId/request-info`
**Purpose:** Request additional information from school

```
Request:
{
  "message": "Please provide CAC registration document",
  "dueDate": "2024-02-24"
}

Response (200):
{
  "success": true,
  "message": "Information request sent to school"
}
```

#### `POST /api/super-admin/schools/:schoolId/reject`
**Purpose:** Reject a school application

```
Request:
{
  "reason": "Unable to verify school credentials",
  "resubmitAfter": 30 // days
}

Response (200):
{
  "success": true,
  "message": "School application rejected"
}
```

---

## Backend Architecture

### Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts
│   │   ├── auth.ts
│   │   ├── email.ts
│   │   ├── redis.ts
│   │   └── env.ts
│   │
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── errorHandler.middleware.ts
│   │   ├── requestLogger.middleware.ts
│   │   ├── rateLimit.middleware.ts
│   │   └── validation.middleware.ts
│   │
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── controllers/
│   │   │   │   └── auth.controller.ts
│   │   │   ├── services/
│   │   │   │   └── auth.service.ts
│   │   │   ├── repositories/
│   │   │   │   └── auth.repository.ts
│   │   │   ├── dtos/
│   │   │   │   ├── register.dto.ts
│   │   │   │   ├── login.dto.ts
│   │   │   │   └── verify-email.dto.ts
│   │   │   ├── validators/
│   │   │   │   └── registration.validator.ts
│   │   │   ├── routes/
│   │   │   │   └── auth.routes.ts
│   │   │   └── events/
│   │   │       └── auth.events.ts
│   │   │
│   │   ├── onboarding/
│   │   │   ├── controllers/
│   │   │   │   ├── onboarding.controller.ts
│   │   │   │   ├── schools.controller.ts
│   │   │   │   ├── sessions.controller.ts
│   │   │   │   ├── classes.controller.ts
│   │   │   │   ├── subjects.controller.ts
│   │   │   │   └── grading.controller.ts
│   │   │   ├── services/
│   │   │   │   ├── onboarding.service.ts
│   │   │   │   ├── schools.service.ts
│   │   │   │   ├── sessions.service.ts
│   │   │   │   ├── classes.service.ts
│   │   │   │   ├── subjects.service.ts
│   │   │   │   └── grading.service.ts
│   │   │   ├── repositories/
│   │   │   │   ├── schools.repository.ts
│   │   │   │   ├── sessions.repository.ts
│   │   │   │   ├── classes.repository.ts
│   │   │   │   ├── subjects.repository.ts
│   │   │   │   ├── grading.repository.ts
│   │   │   │   └── onboarding-state.repository.ts
│   │   │   ├── dtos/
│   │   │   │   ├── create-session.dto.ts
│   │   │   │   ├── create-class.dto.ts
│   │   │   │   ├── create-subject.dto.ts
│   │   │   │   └── create-grading.dto.ts
│   │   │   ├── validators/
│   │   │   │   ├── session.validator.ts
│   │   │   │   ├── class.validator.ts
│   │   │   │   └── grading.validator.ts
│   │   │   ├── routes/
│   │   │   │   └── onboarding.routes.ts
│   │   │   └── events/
│   │   │       └── onboarding.events.ts
│   │   │
│   │   ├── csv/
│   │   │   ├── controllers/
│   │   │   │   └── csv.controller.ts
│   │   │   ├── services/
│   │   │   │   ├── csv.service.ts
│   │   │   │   ├── csv-validator.service.ts
│   │   │   │   ├── csv-parser.service.ts
│   │   │   │   └── csv-queue.service.ts
│   │   │   ├── repositories/
│   │   │   │   └── csv-job.repository.ts
│   │   │   ├── workers/
│   │   │   │   └── csv-import.worker.ts
│   │   │   ├── routes/
│   │   │   │   └── csv.routes.ts
│   │   │   └── templates/
│   │   │       └── csv-template.ts
│   │   │
│   │   ├── super-admin/
│   │   │   ├── controllers/
│   │   │   │   ├── schools-verification.controller.ts
│   │   │   │   └── schools-management.controller.ts
│   │   │   ├── services/
│   │   │   │   ├── schools-verification.service.ts
│   │   │   │   └── schools-management.service.ts
│   │   │   ├── repositories/
│   │   │   │   └── super-admin.repository.ts
│   │   │   ├── routes/
│   │   │   │   └── super-admin.routes.ts
│   │   │   └── events/
│   │   │       └── school-verification.events.ts
│   │   │
│   │   └── common/
│   │       ├── services/
│   │       │   ├── email.service.ts
│   │       │   ├── otp.service.ts
│   │       │   ├── sms.service.ts
│   │       │   ├── pdf.service.ts
│   │       │   ├── file-upload.service.ts
│   │       │   └── notification.service.ts
│   │       ├── entities/
│   │       │   └── base.entity.ts
│   │       ├── exceptions/
│   │       │   ├── app.exception.ts
│   │       │   ├── validation.exception.ts
│   │       │   ├── not-found.exception.ts
│   │       │   ├── unauthorized.exception.ts
│   │       │   └── conflict.exception.ts
│   │       └── decorators/
│   │           ├── auth.decorator.ts
│   │           ├── roles.decorator.ts
│   │           ├── validate.decorator.ts
│   │           └── cache.decorator.ts
│   │
│   ├── database/
│   │   ├── migrations/
│   │   │   ├── 001_create_schools.ts
│   │   │   ├── 002_create_school_admin_users.ts
│   │   │   ├── 003_create_academic_sessions.ts
│   │   │   ├── 004_create_terms.ts
│   │   │   ├── 005_create_classes.ts
│   │   │   ├── 006_create_subjects.ts
│   │   │   ├── 007_create_grading_systems.ts
│   │   │   └── 008_create_grades.ts
│   │   ├── seeds/
│   │   │   ├── seed.ts
│   │   │   └── dev-schools.ts
│   │   └── connection.ts
│   │
│   ├── events/
│   │   ├── emitter.ts
│   │   ├── listeners/
│   │   │   ├── school-created.listener.ts
│   │   │   ├── email-verified.listener.ts
│   │   │   ├── school-approved.listener.ts
│   │   │   ├── onboarding-complete.listener.ts
│   │   │   └── csv-import-complete.listener.ts
│   │   └── types/
│   │       └── app.events.ts
│   │
│   ├── utils/
│   │   ├── validators/
│   │   │   ├── email.validator.ts
│   │   │   ├── phone.validator.ts
│   │   │   └── csv.validator.ts
│   │   ├── helpers/
│   │   │   ├── slug.helper.ts
│   │   │   ├── password.helper.ts
│   │   │   └── otp.helper.ts
│   │   ├── constants/
│   │   │   ├── errors.constants.ts
│   │   │   ├── messages.constants.ts
│   │   │   └── regex.constants.ts
│   │   └── enums/
│   │       ├── user-role.enum.ts
│   │       ├── school-status.enum.ts
│   │       ├── class-level.enum.ts
│   │       └── subject-category.enum.ts
│   │
│   ├── app.ts
│   └── server.ts
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── .env
├── .env.example
├── package.json
├── tsconfig.json
├── docker-compose.yml
└── README.md
```

### Technology Stack

```
Backend Framework: Node.js + Express.js (or NestJS for larger scale)
Database: PostgreSQL
ORM: TypeORM or Prisma
Validation: Joi or Zod
Authentication: JWT + Refresh tokens
File Upload: Multer + AWS S3 (or local storage for dev)
Email: Nodemailer + SendGrid (or Resend)
SMS: Twilio
Background Jobs: Bull (Redis) for CSV processing
Caching: Redis
Testing: Jest + Supertest
API Documentation: Swagger/OpenAPI
Logging: Winston or Pino
Error Tracking: Sentry
Rate Limiting: express-rate-limit
```

### Key Service Classes

#### `AuthService`
```typescript
class AuthService {
  async register(dto: RegisterDTO): Promise<{schoolId, email} >
  async verifyEmail(email: string, otp: string): Promise<boolean>
  async sendVerificationOTP(email: string): Promise<void>
  async login(email: string, password: string): Promise<{token, user}>
  async refreshToken(refreshToken: string): Promise<{token}>
  async resendOTP(email: string): Promise<void>
}
```

#### `OnboardingService`
```typescript
class OnboardingService {
  async getStatus(schoolId: string): Promise<OnboardingStatus>
  async saveStep(schoolId: string, step: number, data: any): Promise<void>
  async completeStep(schoolId: string, step: number): Promise<void>
  async markComplete(schoolId: string): Promise<void>
  async getStepData(schoolId: string, step: number): Promise<any>
}
```

#### `SchoolsService`
```typescript
class SchoolsService {
  async getMySchool(schoolId: string): Promise<School>
  async updateSchool(schoolId: string, data: Partial<School>): Promise<School>
  async createAcademicSession(schoolId: string, data: CreateSessionDTO): Promise<AcademicSession>
  async createClasses(schoolId: string, data: CreateClassDTO[]): Promise<Class[]>
  async createSubjects(schoolId: string, classId: string, data: CreateSubjectDTO[]): Promise<Subject[]>
  async createGradingSystem(schoolId: string, data: CreateGradingSystemDTO): Promise<GradingSystem>
}
```

#### `CSVService`
```typescript
class CSVService {
  async validateCSV(file: Express.Multer.File): Promise<ValidationResult>
  async parseCSV(file: Express.Multer.File): Promise<any[]>
  async generateTemplate(schoolId: string, classIds: string[]): Promise<Buffer>
  async importCSV(schoolId: string, file: Express.Multer.File, options: ImportOptions): Promise<ImportJob>
  async getImportStatus(jobId: string): Promise<JobStatus>
}
```

### Authentication Flow

```
1. User registers → AuthService.register()
   ├── Validate input
   ├── Check duplicate email
   ├── Hash password (bcrypt)
   ├── Create school record (status: PENDING_VERIFICATION)
   ├── Create school admin user
   ├── Generate OTP
   ├── Send verification email
   ├── Emit SchoolRegistered event
   └── Return success

2. User clicks verify link/enters OTP → AuthService.verifyEmail()
   ├── Validate OTP
   ├── Mark email as verified
   ├── Update user.email_verified_at
   ├── Emit EmailVerified event
   └── Return success

3. Super Admin approves → SchoolsVerificationService.approveSchool()
   ├── Validate school
   ├── Update school.status = APPROVED
   ├── Generate temp password (or send password reset link)
   ├── Create initial onboarding_state record
   ├── Send approval email to admin
   ├── Emit SchoolApproved event
   └── Return success

4. User logs in → AuthService.login()
   ├── Find user by email
   ├── Verify password
   ├── Check school.status = ACTIVE/APPROVED
   ├── Generate JWT token + refresh token
   ├── Check first_login flag
   ├── If first_login = true:
   │   └── Redirect to onboarding
   ├── Update last_login_at & session token
   └── Return token & user data

5. Subsequent logins
   └── Redirect directly to dashboard (first_login = false)
```

### Event-Driven Architecture

```
Events Emitted:

1. SchoolRegistered
   ├── Listeners:
   │   ├── SendWelcomeEmail
   │   ├── LogActivity
   │   └── UpdateMetrics

2. EmailVerified
   ├── Listeners:
   │   ├── NotifyAdmin (Super Admin)
   │   ├── LogActivity
   │   └── UpdateVerificationStatus

3. SchoolApproved
   ├── Listeners:
   │   ├── SendApprovalEmail
   │   ├── InitializeOnboarding
   │   ├── CreateDefaultSettings
   │   ├── LogActivity
   │   └── UpdateMetrics

4. OnboardingStepCompleted
   ├── Listeners:
   │   ├── SaveProgressMetrics
   │   └── TriggerNextStepNotification (if needed)

5. OnboardingCompleted
   ├── Listeners:
   │   ├── UpdateSchoolStatus
   │   ├── SendCongratulationsEmail
   │   ├── InitializeFirstDashboardView
   │   ├── LogActivity
   │   └── UpdateMetrics

6. CSVImportStarted
   ├── Listeners:
   │   ├── EnqueueImportJob
   │   └── NotifySchool (optional)

7. CSVImportCompleted
   ├── Listeners:
   │   ├── SendCompletionEmail
   │   ├── UpdateSchoolMetrics
   │   ├── LogActivity
   │   └── TriggerPostImportHooks
```

---

## Implementation Priority & Next Steps

### Phase 1 (Week 1-2): Authentication & Verification
- [ ] Setup backend project structure
- [ ] Implement Auth endpoints (register, verify, login)
- [ ] Setup email service
- [ ] Setup OTP system
- [ ] Create School & User tables

### Phase 2 (Week 3-4): Onboarding Wizard Backend
- [ ] Implement all onboarding endpoints
- [ ] Create all data tables (sessions, terms, classes, subjects, grading)
- [ ] Setup state management for multi-step form
- [ ] Implement auto-save logic

### Phase 3 (Week 5-6): CSV Processing
- [ ] Implement CSV validation
- [ ] Setup CSV parsing & import workers
- [ ] Create background job queue
- [ ] Implement CSV template generation

### Phase 4 (Week 7-8): Super Admin Features
- [ ] Implement schools verification dashboard backend
- [ ] Setup approval/rejection workflows
- [ ] Implement admin notification system

### Phase 5 (Week 9-10): Frontend Enhancement
- [ ] Build all onboarding screens
- [ ] Implement wizard navigation & state
- [ ] Add form validation & error handling
- [ ] Implement dashboard tour guide

---

## Success Metrics

**Registration:**
- First-time registration completion rate: > 80%
- Email verification rate: > 95%
- Time to completion: < 5 minutes

**Onboarding:**
- Wizard completion rate: > 90%
- Average time to complete: 15-20 minutes
- Drop-off rate by step: < 10%

**CSV Upload:**
- First upload success rate: > 85%
- Average time to validate: < 30 seconds
- Error rate: < 5%

---

## Summary

This specification provides a complete roadmap for building a professional school registration and onboarding system. The design emphasizes:

✅ **User Experience:** Clear progressive disclosure, auto-save, skip options  
✅ **Data Integrity:** Multi-step validation, error recovery, data consistency  
✅ **Scalability:** Event-driven, queue-based processing, database optimization  
✅ **Maintainability:** Modular architecture, separation of concerns, tested components  

Next step: Begin creating the backend project scaffold and implementing Phase 1 authentication.
