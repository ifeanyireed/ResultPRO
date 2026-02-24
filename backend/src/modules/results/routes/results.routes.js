import { Router } from 'express';
import { getStudentResults, getSessionsAndTerms } from '../controllers/results.controller';
const router = Router();
// Public endpoints (no auth required for student result checking)
router.post('/student-results', getStudentResults);
router.get('/sessions-and-terms', getSessionsAndTerms);
export default router;
//# sourceMappingURL=results.routes.js.map