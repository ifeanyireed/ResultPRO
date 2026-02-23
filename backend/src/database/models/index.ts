/**
 * Database Models - Prisma Only
 * 
 * All database operations use Prisma exclusively.
 * Access all models through: prisma.modelName
 */

export { prisma } from '@config/database';

// Re-export Prisma client for type definitions
export type { 
  School,
  User,
  SchoolAdminUser,
  AcademicSession,
  Term,
  Class,
  Subject,
  GradingSystem,
  Grade,
  OnboardingState,
} from '@prisma/client';
