import { Router } from 'express';
import multer from 'multer';
import { AuthController } from '../controllers/auth.controller';

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/png', 'image/jpeg', 'application/pdf'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PNG, JPEG, and PDF allowed.'));
    }
  },
});

const router = Router();

// Public routes
router.post('/register', AuthController.register);
router.post('/verify-email', AuthController.verifyEmail);
router.post('/resend-verification', AuthController.resendVerification);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);
router.post('/login', AuthController.login);
router.post('/refresh-token', AuthController.refreshToken);
router.post('/logout', AuthController.logout);
router.post('/upload-document', upload.single('document'), AuthController.uploadDocument);
router.post('/submit-verification-documents', AuthController.submitVerificationDocuments);
router.get('/document-url', AuthController.getDocumentPresignedUrl);
router.get('/school-status/:schoolId', AuthController.getSchoolStatus);

export default router;
