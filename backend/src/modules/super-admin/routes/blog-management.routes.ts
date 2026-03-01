import { Router } from 'express';
import { BlogManagementController } from '../controllers/blog-management.controller';
import { authMiddleware } from '@/middleware/auth-middleware';

const router = Router();

// ============================================================================
// PUBLIC BLOG ROUTES (No authentication required)
// ============================================================================

// Get all published blog posts (with pagination, category filter)
router.get('/public/posts', BlogManagementController.getPublishedPosts);

// Get single published blog post by slug (includes approved comments)
router.get('/public/posts/:slug', BlogManagementController.getPostBySlug);

// Get all active blog categories
router.get('/public/categories', BlogManagementController.getBlogCategories);

// Add comment to blog post
router.post('/public/posts/:postId/comments', BlogManagementController.addComment);

// Like/unlike blog post
router.post('/public/posts/:slug/like', BlogManagementController.likePost);

// ============================================================================
// SUPERADMIN CMS ROUTES (Protected by authMiddleware)
// ============================================================================

router.use(authMiddleware);

// ============================================================================
// CMS POST MANAGEMENT
// ============================================================================

// Get all posts (including drafts and published) for CMS dashboard
router.get('/cms/posts', BlogManagementController.getAllPosts);

// Create new blog post
router.post('/cms/posts', BlogManagementController.createPost);

// Update blog post
router.put('/cms/posts/:postId', BlogManagementController.updatePost);

// Delete blog post
router.delete('/cms/posts/:postId', BlogManagementController.deletePost);

// Publish draft post
router.post('/cms/posts/:postId/publish', BlogManagementController.publishPost);

// ============================================================================
// CMS CATEGORY MANAGEMENT
// ============================================================================

// Create blog category
router.post('/cms/categories', BlogManagementController.createCategory);

// Update blog category
router.put('/cms/categories/:categoryId', BlogManagementController.updateCategory);

// Delete blog category
router.delete('/cms/categories/:categoryId', BlogManagementController.deleteCategory);

// ============================================================================
// CMS COMMENT MODERATION
// ============================================================================

// Get comments for a post (with status filter)
router.get('/cms/posts/:postId/comments', BlogManagementController.getPostComments);

// Approve blog comment
router.post('/cms/comments/:commentId/approve', BlogManagementController.approveComment);

// Reject blog comment
router.post('/cms/comments/:commentId/reject', BlogManagementController.rejectComment);

// Delete blog comment
router.delete('/cms/comments/:commentId', BlogManagementController.deleteComment);

// ============================================================================
// CMS ANALYTICS
// ============================================================================

// Get stats for single blog post
router.get('/cms/posts/:postId/stats', BlogManagementController.getPostStats);

// Get overall blog statistics
router.get('/cms/stats', BlogManagementController.getBlogStats);

export default router;
