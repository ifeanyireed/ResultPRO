import express from 'express';
import multer from 'multer';
import { handleStep1 } from '../controllers/step1.controller';
import { handleStep2 } from '../controllers/step2.controller';
import { handleStep3 } from '../controllers/step3.controller';
import { handleStep4 } from '../controllers/step4.controller';
import { handleStep5 } from '../controllers/step5.controller';
import { handleStep6 } from '../controllers/step6.controller';
import { getResultsSetupSession, uploadSignature, addStudent, getStudents, deleteStudent, getClassSubjects } from '../controllers/results-setup.controller';
// Configure multer for signature uploads (images)
const uploadImages = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max for images
    fileFilter: (req, file, cb) => {
        const allowedMimes = ['image/png', 'image/jpeg', 'image/gif'];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Invalid file type. Only PNG, JPEG, and GIF allowed.'));
        }
    },
});
// Configure multer for CSV uploads
const uploadCsv = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max for CSV
    fileFilter: (req, file, cb) => {
        const allowedMimes = ['text/csv', 'application/vnd.ms-excel'];
        const isValidMime = allowedMimes.includes(file.mimetype);
        const isValidName = file.originalname.endsWith('.csv');
        if (isValidMime || isValidName) {
            cb(null, true);
        }
        else {
            cb(new Error('Invalid file type. Only CSV files allowed.'));
        }
    },
});
const router = express.Router();
// POST /api/results-setup/step/1
router.post('/step/1', handleStep1);
// POST /api/results-setup/step/2
router.post('/step/2', handleStep2);
// POST /api/results-setup/step/3
router.post('/step/3', handleStep3);
// POST /api/results-setup/step/4
router.post('/step/4', handleStep4);
// POST /api/results-setup/step/5
router.post('/step/5', handleStep5);
// POST /api/results-setup/step/6 - with CSV file upload
router.post('/step/6', uploadCsv.single('csvFile'), handleStep6);
// GET /api/results-setup/session/:sessionId/:termId
router.get('/session/:sessionId/:termId', getResultsSetupSession);
// GET /api/results-setup/classes/:classId/subjects
router.get('/classes/:classId/subjects', getClassSubjects);
// POST /api/results-setup/upload-signature
router.post('/upload-signature', uploadImages.single('signature'), uploadSignature);
// Student management endpoints - for immediate persistence
router.get('/students/:classId', getStudents);
router.post('/students', addStudent);
router.delete('/students/:studentId', deleteStudent);
export default router;
//# sourceMappingURL=results-setup.routes.js.map