import { Router } from 'express';
import multer from 'multer';
import { OnboardingController } from '../controllers/onboarding.controller';

const router = Router();

// Configure multer for school logo uploads
const uploadLogo = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, WebP, and SVG images are allowed'));
    }
  },
});

// All onboarding routes require authentication (enforced at app level)

// Get current onboarding status
router.get('/status', OnboardingController.getStatus);

// Step 1: Update school profile
router.post('/step/1', OnboardingController.updateSchoolProfile);

// Step 2: Create academic session and terms
router.post('/step/2', OnboardingController.createAcademicSession);

// Step 3: Create classes
router.post('/step/3', OnboardingController.createClasses);

// Step 4: Create subjects
router.post('/step/4', OnboardingController.createSubjects);

// Step 5: Configure grading system
router.post('/step/5', OnboardingController.configureGradingSystem);

// Step 6: Record CSV upload
router.post('/step/6', OnboardingController.recordCsvUpload);

// Complete onboarding
router.post('/complete', OnboardingController.completeOnboarding);

export default router;
