import { Router } from 'express';
import multer from 'multer';
import { OnboardingController } from '../controllers/onboarding.controller';
import { uploadLogo } from '../controllers/logo-upload.controller';

const router = Router();

// Configure multer for logo uploads
const uploadLogoMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, WebP, GIF, and SVG images are allowed'));
    }
  },
});

// All onboarding routes require authentication (enforced at app level)

// Upload logo file to S3
router.post('/logo-upload', uploadLogoMiddleware.single('file'), uploadLogo);

// Get school profile
router.get('/school/:schoolId', OnboardingController.getSchoolProfile);

// Get current onboarding status
router.get('/status', OnboardingController.getStatus);

// Step 1: Update school profile
router.post('/step/1', OnboardingController.updateSchoolProfile);

// Partial update school profile (real-time database writes)
router.patch('/school-profile', OnboardingController.partialUpdateSchoolProfile);

// Partial update academic session with terms (real-time database writes)
router.patch('/academic-session', OnboardingController.partialUpdateAcademicSession);

// Step 2: Create academic session and terms
router.post('/step/2', OnboardingController.createAcademicSession);

// Delete an academic session
router.delete('/academic-session/:sessionId', OnboardingController.deleteAcademicSession);

// Step 3: Create classes
router.post('/step/3', OnboardingController.createClasses);

// Get all classes for the school
router.get('/classes', OnboardingController.getClasses);

// Partial update classes (real-time database writes)
router.patch('/classes', OnboardingController.partialUpdateClasses);

// Step 4: Create subjects
router.post('/step/4', OnboardingController.createSubjects);

// Partial update subjects (real-time database writes)
router.patch('/subjects', OnboardingController.partialUpdateSubjects);

// Step 5: Configure grading system
router.post('/step/5', OnboardingController.configureGradingSystem);

// Step 6: Record CSV upload
router.post('/step/6', OnboardingController.recordCsvUpload);

// Complete onboarding
router.post('/complete', OnboardingController.completeOnboarding);

// Mark results setup as complete
router.post('/mark-results-setup-complete', OnboardingController.markResultsSetupComplete);

export default router;
