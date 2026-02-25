import { Router } from 'express';
import multer from 'multer';
import { handleStep1 } from '../controllers/step1.controller';
import { handleStep2 } from '../controllers/step2.controller';
import { handleStep3 } from '../controllers/step3.controller';
import { handleStep4 } from '../controllers/step4.controller';
import { handleStep5, updateStaffData } from '../controllers/step5.controller';
import { uploadSignature } from '../controllers/signature-upload.controller';
import { processCSV } from '../controllers/csv-processor.controller';
import { getResultsSetupSession, initializeResultsSetup, getClassSubjects } from '../controllers/results-setup.controller';
import { createSampleClasses } from '../controllers/debug.controller';
import { addStudent, getStudents, deleteStudent, updateStudent } from '../controllers/student.controller';

const router = Router();

// Configure multer for signature uploads
const uploadSignatureMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, WebP, and GIF images are allowed for signatures'));
    }
  },
});

// Configure multer for CSV uploads
const uploadCSVMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['text/csv', 'application/vnd.ms-excel'];
    if (allowedMimes.includes(file.mimetype) || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  },
});

// GET /api/results-setup/session - Fetch current setup session
router.get('/session', getResultsSetupSession);

// GET /api/results-setup/class-subjects - Get subjects for a specific class
router.get('/class-subjects', getClassSubjects);

// POST /api/results-setup/initialize - Initialize new setup session
router.post('/initialize', initializeResultsSetup);

// POST /api/results-setup/step/1 - Handle step 1
router.post('/step/1', handleStep1);

// POST /api/results-setup/step/2 - Handle step 2 (Exam Config)
router.post('/step/2', handleStep2);

// POST /api/results-setup/step/3 - Handle step 3 (Affective Domain)
router.post('/step/3', handleStep3);

// POST /api/results-setup/step/4 - Handle step 4 (Psychomotor Domain)
router.post('/step/4', handleStep4);

// POST /api/results-setup/upload-signature - Upload signature to S3
router.post('/upload-signature', uploadSignatureMiddleware.single('file'), uploadSignature);

// PATCH /api/results-setup/staff-data - Real-time staff data update
router.patch('/staff-data', updateStaffData);

// POST /api/results-setup/step/5 - Handle step 5 (Staff Uploads)
router.post('/step/5', handleStep5);

// Student Management Endpoints
// POST /api/results-setup/students/add - Add a new student
router.post('/students/add', addStudent);

// GET /api/results-setup/students - Get students (optionally filtered by classId query param)
router.get('/students', getStudents);

// DELETE /api/results-setup/students/:studentId - Delete a student
router.delete('/students/:studentId', deleteStudent);

// PATCH /api/results-setup/students/:studentId - Update student information
router.patch('/students/:studentId', updateStudent);

// POST /api/results-setup/process-csv - Process uploaded results CSV
router.post('/process-csv', uploadCSVMiddleware.single('csvFile'), processCSV);

// Placeholder for remaining steps - to be implemented
router.post('/step/6', (req, res) => {
  res.json({ success: true, message: 'Step 6 not yet implemented' });
});
router.post('/step/7', (req, res) => {
  res.json({ success: true, message: 'Step 7 not yet implemented' });
});

// DEBUG ONLY - Create sample classes for testing (development only)
router.post('/debug/create-sample-classes', createSampleClasses);

export default router;
