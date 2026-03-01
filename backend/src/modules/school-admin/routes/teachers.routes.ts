import { Router, Request, Response } from 'express';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { TeachersController } from '../controllers/teachers.controller';

const router = Router();

/**
 * List all teachers for a school
 * GET /teachers?schoolId=xxx&page=1&limit=20&status=ACTIVE&search=john
 */
router.get('/', authMiddleware, (req: Request, res: Response) =>
  TeachersController.listTeachers(req, res)
);

/**
 * Create a new teacher
 * POST /teachers
 */
router.post('/', authMiddleware, (req: Request, res: Response) =>
  TeachersController.createTeacher(req, res)
);

/**
 * Bulk invite teachers
 * POST /teachers/bulk/invite
 */
router.post('/bulk/invite', authMiddleware, (req: Request, res: Response) =>
  TeachersController.bulkInviteTeachers(req, res)
);

/**
 * Get teacher details
 * GET /teachers/:teacherId
 */
router.get('/:teacherId', authMiddleware, (req: Request, res: Response) =>
  TeachersController.getTeacher(req, res)
);

/**
 * Update teacher
 * PATCH /teachers/:teacherId
 */
router.patch('/:teacherId', authMiddleware, (req: Request, res: Response) =>
  TeachersController.updateTeacher(req, res)
);

/**
 * Assign class to teacher
 * PATCH /teachers/:teacherId/assign-class
 */
router.patch('/:teacherId/assign-class', authMiddleware, (req: Request, res: Response) =>
  TeachersController.assignClass(req, res)
);

/**
 * Assign subject to teacher
 * PATCH /teachers/:teacherId/assign-subject
 */
router.patch('/:teacherId/assign-subject', authMiddleware, (req: Request, res: Response) =>
  TeachersController.assignSubject(req, res)
);

/**
 * Toggle teacher status
 * PATCH /teachers/:teacherId/status
 */
router.patch('/:teacherId/status', authMiddleware, (req: Request, res: Response) =>
  TeachersController.toggleTeacherStatus(req, res)
);

/**
 * Update teacher permissions
 * PATCH /teachers/:teacherId/permissions
 */
router.patch('/:teacherId/permissions', authMiddleware, (req: Request, res: Response) =>
  TeachersController.updatePermissions(req, res)
);

/**
 * Delete teacher
 * DELETE /teachers/:teacherId
 */
router.delete('/:teacherId', authMiddleware, (req: Request, res: Response) =>
  TeachersController.deleteTeacher(req, res)
);

export default router;
