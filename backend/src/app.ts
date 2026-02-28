import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { config } from '@config/environment';
import { errorHandler } from '@middleware/error.middleware';
import { authMiddleware } from '@middleware/auth.middleware';

export async function createApp(): Promise<Express> {
  const app = express();

  // Security middleware
  app.use(helmet());

  // CORS middleware - allow multiple frontend addresses
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:8080',
    'http://localhost:8081',
    'http://localhost:8082',
    config.FRONTEND_URL,
  ];
  
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
    })
  );

  // Compression middleware
  app.use(compression());

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  // Health check endpoint
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      success: true,
      message: 'Server is running',
      timestamp: new Date().toISOString(),
    });
  });

  // API version endpoint
  app.get('/api/version', (req: Request, res: Response) => {
    res.json({
      success: true,
      version: '1.0.0',
      environment: config.NODE_ENV,
    });
  });

  // Auth routes (public)
  const authRoutes = await import('@modules/auth/routes/auth.routes');
  app.use('/api/auth', authRoutes.default);

  // Onboarding routes (protected)
  const onboardingRoutes = await import('@modules/onboarding/routes/onboarding.routes');
  app.use('/api/onboarding', authMiddleware, onboardingRoutes.default);

  // CSV routes (protected)
  const csvRoutes = await import('@modules/onboarding/routes/csv.routes');
  app.use('/api/csv', authMiddleware, csvRoutes.default);

  // Results Setup routes (protected)
  const resultsSetupRoutes = await import('@modules/results-setup/routes/results-setup.routes');
  app.use('/api/results-setup', authMiddleware, resultsSetupRoutes.default);

  // Payment routes
  const paymentRoutes = await import('@modules/payment/routes/payment.routes');
  app.use('/api/payment', paymentRoutes.default);

  // Support routes (protected)
  const supportRoutes = await import('@modules/support/routes/support.routes');
  app.use('/api/support/tickets', supportRoutes.default);

  // Notification routes (protected)
  const notificationRoutes = await import('@modules/support/routes/notifications.routes');
  app.use('/api/notifications', notificationRoutes.default);

  // Super Admin routes (auth protection handled within routes)
  const superAdminRoutes = await import('@modules/super-admin/routes/super-admin.routes');
  app.use('/api/super-admin', superAdminRoutes.default);

  // School routes (protected)
  app.use('/api/schools', authMiddleware, onboardingRoutes.default);

  // Admin Scratch Card routes (protected - for SuperAdmin)
  const adminScratchCardRoutes = await import('@modules/scratch-cards/routes/admin-scratch-cards.routes');
  app.use('/api/admin/scratch-cards', adminScratchCardRoutes.default);

  // Admin Payment/Subscription routes (protected - for SuperAdmin)
  const adminPaymentRoutes = await import('@modules/payment/routes/admin-payment.routes');
  app.use('/api/admin/payment', adminPaymentRoutes.default);

  // Admin Schools/Network Management routes (protected - for SuperAdmin)
  const adminSchoolsRoutes = await import('@modules/super-admin/routes/admin-schools.routes');
  app.use('/api/admin/schools', authMiddleware, adminSchoolsRoutes.default);

  // School Scratch Card routes (protected - for SchoolAdmin)
  const schoolScratchCardRoutes = await import('@modules/scratch-cards/routes/school-scratch-cards.routes');
  app.use('/api/school/scratch-cards', schoolScratchCardRoutes.default);

  // Public Scratch Card routes (no authentication required)
  const publicScratchCardRoutes = await import('@modules/scratch-cards/routes/public-scratch-cards.routes');
  app.use('/api/scratch-cards', publicScratchCardRoutes.default);

  // Analytics routes (protected - for Teachers, Principals, Students)
  const analyticsRoutes = await import('@modules/analytics/routes/analytics.routes');
  app.use('/api/analytics', analyticsRoutes.default);

  // Parent Analytics routes (protected - for Parents)
  const parentAnalyticsRoutes = await import('@modules/analytics/routes/parentAnalytics.routes');
  app.use('/api/parent-analytics', parentAnalyticsRoutes.default);

  // Agent routes (protected - for Agents)
  const agentRoutes = await import('@modules/agent/routes');
  app.use('/api/agent', agentRoutes.default);

  // 404 handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: 'Endpoint not found',
      code: 'NOT_FOUND',
      path: req.path,
    });
  });

  // Error handling middleware (must be last)
  app.use(errorHandler);

  return app;
}
