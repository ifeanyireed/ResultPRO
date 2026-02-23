import { Router } from 'express';
import { prisma } from '@config/database';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { SuperAdminController } from '../controllers/super-admin.controller';

const router = Router();

// Debug endpoint - show all schools (NO AUTH for debugging)
router.get('/debug/schools', async (req, res) => {
  try {
    console.log('🔍 Debug endpoint called');
    
    console.log('📊 Querying schools from database...');
    const schools = await prisma.school.findMany({
      select: {
        id: true,
        name: true,
        status: true,
        contactEmail: true,
        documentVerificationType: true,
        documentVerificationSubmittedAt: true,
        verificationStatus: true,
      },
    });
    
    console.log(`✅ Found ${schools.length} schools`);
    res.json({ success: true, count: schools.length, data: schools });
  } catch (error: any) {
    console.error('❌ Debug endpoint error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// All super-admin routes require authentication
router.use(authMiddleware);

// Note: In production, you should add a superAdminonly middleware
// that checks if the user is a super admin before allowing access

// Get all schools with optional status filter
router.get('/schools', SuperAdminController.getAllSchools);

// Get pending schools for verification
router.get('/schools/pending', SuperAdminController.getPendingSchools);

// Get specific school details
router.get('/schools/:schoolId', SuperAdminController.getSchoolDetails);

// Approve a school
router.post('/schools/:schoolId/approve', SuperAdminController.approveSchool);

// Reject a school
router.post('/schools/:schoolId/reject', SuperAdminController.rejectSchool);

export default router;
