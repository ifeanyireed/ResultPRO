import { Router } from 'express';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { CSVController } from '../controllers/csv.controller';

const router = Router();

// All CSV routes require authentication
router.use(authMiddleware);

// Get CSV template
router.get('/template', CSVController.getTemplate);

// Validate CSV before import
router.post('/validate', CSVController.validateCSV);

// Preview CSV data
router.post('/preview', CSVController.previewCSV);

export default router;
