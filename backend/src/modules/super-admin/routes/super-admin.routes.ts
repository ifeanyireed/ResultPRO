import { Router } from 'express';
import { prisma } from '@config/database';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { SuperAdminController } from '../controllers/super-admin.controller';
import emailManagementRoutes from './email-management.routes';
import blogManagementRoutes from './blog-management.routes';

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

// ========================
// Agent Management Routes
// ========================

// List all agents
router.get('/agents', SuperAdminController.listAgents);

// Create agent
router.post('/agents', SuperAdminController.createAgent);

// Bulk invite agents (must come before /:id routes)
router.post('/agents/bulk/invite', SuperAdminController.bulkInviteAgents);

// Get agent details
router.get('/agents/:agentId', SuperAdminController.getAgent);

// Update agent
router.patch('/agents/:agentId', SuperAdminController.updateAgent);

// Toggle agent status
router.patch('/agents/:agentId/status', SuperAdminController.toggleAgentStatus);

// Delete agent
router.delete('/agents/:agentId', SuperAdminController.deleteAgent);

// ========================
// Support Staff Management Routes
// ========================

// List all support staff
router.get('/support-staff', SuperAdminController.listSupportStaff);

// Create support staff
router.post('/support-staff', SuperAdminController.createSupportStaff);

// Bulk invite support staff (must come before /:id routes)
router.post('/support-staff/bulk/invite', SuperAdminController.bulkInviteSupportStaff);

// Get support staff details
router.get('/support-staff/:staffId', SuperAdminController.getSupportStaff);

// Update support staff
router.patch('/support-staff/:staffId', SuperAdminController.updateSupportStaff);

// Update staff permission level
// Update staff permission level
router.patch('/support-staff/:staffId/permission-level', SuperAdminController.updateStaffPermissionLevel);

// Toggle staff status
router.patch('/support-staff/:staffId/status', SuperAdminController.toggleStaffStatus);

// Delete support staff
router.delete('/support-staff/:staffId', SuperAdminController.deleteSupportStaff);

// ========================
// Email Management Routes
// ========================
router.use('/email', emailManagementRoutes);

// ========================
// Blog Management Routes
// ========================
router.use('/blog', blogManagementRoutes);

export default router;
