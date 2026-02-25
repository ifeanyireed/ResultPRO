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

  // CORS middleware
  app.use(
    cors({
      origin: config.FRONTEND_URL,
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

  // Super Admin routes (auth protection handled within routes)
  const superAdminRoutes = await import('@modules/super-admin/routes/super-admin.routes');
  app.use('/api/super-admin', superAdminRoutes.default);

  // School routes (protected)
  app.use('/api/schools', authMiddleware, onboardingRoutes.default);

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
