import { Router } from 'express';
import { handleStep1 } from '../controllers/step1.controller';
import { getResultsSetupSession, initializeResultsSetup } from '../controllers/results-setup.controller';

const router = Router();

// GET /api/results-setup/session - Fetch current setup session
router.get('/session', getResultsSetupSession);

// POST /api/results-setup/initialize - Initialize new setup session
router.post('/initialize', initializeResultsSetup);

// POST /api/results-setup/step/1 - Handle step 1
router.post('/step/1', handleStep1);

// Placeholder for other steps - to be implemented
router.post('/step/2', (req, res) => {
  res.json({ success: true, message: 'Step 2 not yet implemented' });
});
router.post('/step/3', (req, res) => {
  res.json({ success: true, message: 'Step 3 not yet implemented' });
});
router.post('/step/4', (req, res) => {
  res.json({ success: true, message: 'Step 4 not yet implemented' });
});
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
