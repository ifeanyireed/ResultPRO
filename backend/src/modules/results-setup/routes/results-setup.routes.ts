import { Router } from 'express';
import { handleStep1 } from '../controllers/step1.controller';
import { handleStep2 } from '../controllers/step2.controller';
import { handleStep3 } from '../controllers/step3.controller';
import { handleStep4 } from '../controllers/step4.controller';
import { getResultsSetupSession, initializeResultsSetup } from '../controllers/results-setup.controller';

const router = Router();

// GET /api/results-setup/session - Fetch current setup session
router.get('/session', getResultsSetupSession);

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

// Placeholder for remaining steps - to be implemented
router.post('/step/5', (req, res) => {
  res.json({ success: true, message: 'Step 5 not yet implemented' });
});
router.post('/step/6', (req, res) => {
  res.json({ success: true, message: 'Step 6 not yet implemented' });
});
router.post('/step/7', (req, res) => {
  res.json({ success: true, message: 'Step 7 not yet implemented' });
});

export default router;
