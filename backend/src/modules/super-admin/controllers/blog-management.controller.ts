import { prisma } from '@/index';
import { Request, Response } from 'express';

export class BlogManagementController {
  // ============================================================================
  // PUBLIC BLOG ENDPOINTS
  // ============================================================================

  static async getPublishedPosts(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10, category } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const where: any = { status: 'PUBLISHED' };
      if (category) {
        where.category = { slug: category };
      }

      const [posts, total] = await Promise.all([
        prisma.blogPost.findMany({
          where,
          include: {
            category: true,
            _count: { select: { comments: true, likes: true } },
          },
          orderBy: { publishedAt: 'desc' },
          skip,
          take: Number(limit),
        }),
        prisma.blogPost.count({ where }),
      ]);

      res.json({
        success: true,
        data: posts,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getPostBySlug(req: Request, res: Response) {
    try {
      const { slug } = req.params;

      const post = await prisma.blogPost.findUnique({
        where: { slug },
        include: {
          category: true,
          comments: {
            where: { status: 'APPROVED' },
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (!post) {
        return res.status(404).json({ success: false, error: 'Post not found' });
      }

      // Increment view count
      await prisma.blogPost.update({
        where: { id: post.id },
        data: { viewCount: { increment: 1 } },
      });

      res.json({
        success: true,
        data: { ...post, viewCount: post.viewCount + 1 },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getBlogCategories(req: Request, res: Response) {
    try {
      const categories = await prisma.blogCategory.findMany({
        where: { isActive: true },
        orderBy: { displayOrder: 'asc' },
        include: {
          _count: { select: { posts: true } },
        },
      });

      res.json({ success: true, data: categories });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async addComment(req: Request, res: Response) {
    try {
      const { postId } = req.params;
      const { authorName, authorEmail, content } = req.body;

      // Validate post exists and comments are allowed
      const post = await prisma.blogPost.findUnique({
        where: { id: postId },
      });

      if (!post) {
        return res.status(404).json({ success: false, error: 'Post not found' });
      }

      if (!post.allowComments) {
        return res.status(403).json({ success: false, error: 'Comments are disabled for this post' });
      }

      // Create comment
      const comment = await prisma.blogComment.create({
        data: {
          postId,
          authorName,
          authorEmail,
          content,
          status: 'PENDING',
        },
      });

      res.status(201).json({
        success: true,
        data: comment,
        message: 'Comment submitted and pending approval',
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async likePost(req: Request, res: Response) {
    try {
      const { slug } = req.params;
      const { email } = req.body;

      const post = await prisma.blogPost.findUnique({
        where: { slug },
      });

      if (!post) {
        return res.status(404).json({ success: false, error: 'Post not found' });
      }

      const likes = JSON.parse(post.likes || '[]');
      const hasLiked = likes.includes(email);

      if (hasLiked) {
        // Unlike
        const updatedLikes = likes.filter((l: string) => l !== email);
        await prisma.blogPost.update({
          where: { id: post.id },
          data: {
            likes: JSON.stringify(updatedLikes),
            likeCount: { decrement: 1 },
          },
        });
      } else {
        // Like
        const updatedLikes = [...likes, email];
        await prisma.blogPost.update({
          where: { id: post.id },
          data: {
            likes: JSON.stringify(updatedLikes),
            likeCount: { increment: 1 },
          },
        });
      }

      res.json({
        success: true,
        data: { liked: !hasLiked },
        message: hasLiked ? 'Post unliked' : 'Post liked',
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // ============================================================================
  // SUPERADMIN CMS ENDPOINTS
  // ============================================================================

  static async getAllPosts(req: Request, res: Response) {
    try {
      const { page = 1, limit = 20, status, category } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const where: any = {};
      if (status) where.status = status;
      if (category) where.category = { slug: category };

      const [posts, total] = await Promise.all([
        prisma.blogPost.findMany({
          where,
          include: {
            category: true,
            _count: { select: { comments: true } },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: Number(limit),
        }),
        prisma.blogPost.count({ where }),
      ]);

      res.json({
        success: true,
        data: posts,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async createPost(req: Request, res: Response) {
    try {
      const {
        categoryId,
        title,
        slug,
        excerpt,
        content,
        htmlContent,
        featuredImage,
        metaDescription,
        metaKeywords,
        authorName,
        authorEmail,
        status = 'DRAFT',
      } = req.body;

      // Check slug uniqueness
      const existingPost = await prisma.blogPost.findUnique({
        where: { slug },
      });

      if (existingPost) {
        return res.status(400).json({ success: false, error: 'Slug already exists' });
      }

      const post = await prisma.blogPost.create({
        data: {
          categoryId,
          title,
          slug,
          excerpt,
          content,
          htmlContent,
          featuredImage,
          metaDescription,
          metaKeywords,
          authorName,
          authorEmail,
          status,
          publishedAt: status === 'PUBLISHED' ? new Date() : null,
        },
        include: { category: true },
      });

      res.status(201).json({ success: true, data: post });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async updatePost(req: Request, res: Response) {
    try {
      const { postId } = req.params;
      const {
        categoryId,
        title,
        excerpt,
        content,
        htmlContent,
        featuredImage,
        metaDescription,
        metaKeywords,
        status,
        publishedAt,
      } = req.body;

      const post = await prisma.blogPost.update({
        where: { id: postId },
        data: {
          categoryId,
          title,
          excerpt,
          content,
          htmlContent,
          featuredImage,
          metaDescription,
          metaKeywords,
          status,
          publishedAt: status === 'PUBLISHED' && !publishedAt ? new Date() : publishedAt,
        },
        include: { category: true },
      });

      res.json({ success: true, data: post });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async deletePost(req: Request, res: Response) {
    try {
      const { postId } = req.params;

      await prisma.blogPost.delete({
        where: { id: postId },
      });

      res.json({ success: true, message: 'Post deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async publishPost(req: Request, res: Response) {
    try {
      const { postId } = req.params;

      const post = await prisma.blogPost.update({
        where: { id: postId },
        data: {
          status: 'PUBLISHED',
          publishedAt: new Date(),
        },
        include: { category: true },
      });

      res.json({
        success: true,
        data: post,
        message: 'Post published successfully',
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // ============================================================================
  // CATEGORY MANAGEMENT
  // ============================================================================

  static async createCategory(req: Request, res: Response) {
    try {
      const { name, slug, description, icon, color } = req.body;

      const category = await prisma.blogCategory.create({
        data: {
          name,
          slug,
          description,
          icon,
          color,
        },
      });

      res.status(201).json({ success: true, data: category });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async updateCategory(req: Request, res: Response) {
    try {
      const { categoryId } = req.params;
      const { name, slug, description, icon, color, isActive, displayOrder } = req.body;

      const category = await prisma.blogCategory.update({
        where: { id: categoryId },
        data: {
          name,
          slug,
          description,
          icon,
          color,
          isActive,
          displayOrder,
        },
      });

      res.json({ success: true, data: category });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async deleteCategory(req: Request, res: Response) {
    try {
      const { categoryId } = req.params;

      // Check if category has posts
      const postCount = await prisma.blogPost.count({
        where: { categoryId },
      });

      if (postCount > 0) {
        return res.status(400).json({
          success: false,
          error: `Cannot delete category with ${postCount} posts. Please reassign or delete posts first.`,
        });
      }

      await prisma.blogCategory.delete({
        where: { id: categoryId },
      });

      res.json({ success: true, message: 'Category deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // ============================================================================
  // COMMENT MANAGEMENT
  // ============================================================================

  static async getPostComments(req: Request, res: Response) {
    try {
      const { postId } = req.params;
      const { status = 'PENDING' } = req.query;

      const comments = await prisma.blogComment.findMany({
        where: {
          postId,
          status: status as string,
        },
        orderBy: { createdAt: 'desc' },
      });

      res.json({ success: true, data: comments });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async approveComment(req: Request, res: Response) {
    try {
      const { commentId } = req.params;
      const { approvedBy } = req.body;

      const comment = await prisma.blogComment.update({
        where: { id: commentId },
        data: {
          status: 'APPROVED',
          approvedAt: new Date(),
          approvedBy,
        },
      });

      // Increment comment count on post
      const post = await prisma.blogPost.findUnique({
        where: { id: comment.postId },
      });

      if (post) {
        await prisma.blogPost.update({
          where: { id: post.id },
          data: { commentCount: { increment: 1 } },
        });
      }

      res.json({
        success: true,
        data: comment,
        message: 'Comment approved',
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async rejectComment(req: Request, res: Response) {
    try {
      const { commentId } = req.params;

      await prisma.blogComment.update({
        where: { id: commentId },
        data: { status: 'REJECTED' },
      });

      res.json({ success: true, message: 'Comment rejected' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async deleteComment(req: Request, res: Response) {
    try {
      const { commentId } = req.params;

      const comment = await prisma.blogComment.findUnique({
        where: { id: commentId },
      });

      if (comment && comment.status === 'APPROVED') {
        await prisma.blogPost.update({
          where: { id: comment.postId },
          data: { commentCount: { decrement: 1 } },
        });
      }

      await prisma.blogComment.delete({
        where: { id: commentId },
      });

      res.json({ success: true, message: 'Comment deleted' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // ============================================================================
  // ANALYTICS
  // ============================================================================

  static async getPostStats(req: Request, res: Response) {
    try {
      const { postId } = req.params;

      const post = await prisma.blogPost.findUnique({
        where: { id: postId },
        include: {
          _count: { select: { comments: true } },
        },
      });

      if (!post) {
        return res.status(404).json({ success: false, error: 'Post not found' });
      }

      res.json({
        success: true,
        data: {
          postId: post.id,
          title: post.title,
          views: post.viewCount,
          likes: post.likeCount,
          comments: post._count.comments,
          shares: post.shareCount,
          publishedAt: post.publishedAt,
          status: post.status,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getBlogStats(req: Request, res: Response) {
    try {
      const [totalPosts, publishedPosts, draftPosts, totalCategories, totalComments, totalLikes] = await Promise.all([
        prisma.blogPost.count(),
        prisma.blogPost.count({ where: { status: 'PUBLISHED' } }),
        prisma.blogPost.count({ where: { status: 'DRAFT' } }),
        prisma.blogCategory.count(),
        prisma.blogComment.count({ where: { status: 'APPROVED' } }),
        prisma.blogPost.aggregate({
          _sum: { likeCount: true },
        }),
      ]);

      const topPosts = await prisma.blogPost.findMany({
        where: { status: 'PUBLISHED' },
        orderBy: { viewCount: 'desc' },
        take: 5,
        select: { id: true, title: true, viewCount: true, likeCount: true },
      });

      res.json({
        success: true,
        data: {
          totalPosts,
          publishedPosts,
          draftPosts,
          totalCategories,
          totalComments,
          totalLikes: totalLikes._sum.likeCount || 0,
          topPosts,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}
