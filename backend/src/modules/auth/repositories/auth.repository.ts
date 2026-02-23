import { prisma } from '@config/database';
import { ConflictException } from '@modules/common/exceptions/conflict.exception';
import { NotFoundException } from '@modules/common/exceptions/not-found.exception';

export class AuthRepository {
  /**
   * Create a new school
   */
  async createSchool(data: any) {
    return await prisma.school.create({ data });
  }

  /**
   * Find school by email
   */
  async findSchoolByEmail(email: string) {
    return await prisma.school.findUnique({
      where: { contactEmail: email },
    });
  }

  /**
   * Find school by ID
   */
  async findSchoolById(schoolId: string) {
    return await prisma.school.findUnique({
      where: { id: schoolId },
    });
  }

  /**
   * Update school
   */
  async updateSchool(schoolId: string, data: any) {
    const school = await this.findSchoolById(schoolId);
    if (!school) throw new NotFoundException('School not found');
    return await prisma.school.update({
      where: { id: schoolId },
      data,
    });
  }

  /**
   * Create school admin user
   */
  async createAdminUser(data: any) {
    return await prisma.schoolAdminUser.create({ data });
  }

  /**
   * Find admin user by email and school
   */
  async findAdminUserByEmailAndSchool(email: string, schoolId: string) {
    return await prisma.schoolAdminUser.findFirst({
      where: { email, schoolId },
    });
  }

  /**
   * Find admin user by email (school-specific users only)
   */
  async findAdminUserByEmail(email: string) {
    return await prisma.schoolAdminUser.findUnique({
      where: { email },
      include: { school: true },
    });
  }

  /**
   * Find system user by email (super-admin, etc.)
   */
  async findSystemUserByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Find any user by email (checks both tables)
   */
  async findUserByEmail(email: string) {
    // First check system users (super-admin, etc.)
    const systemUser = await this.findSystemUserByEmail(email);
    if (systemUser) {
      return { ...systemUser, userType: 'system' } as any;
    }

    // Then check school admins
    const schoolUser = await this.findAdminUserByEmail(email);
    if (schoolUser) {
      return { ...schoolUser, userType: 'school-admin' } as any;
    }

    return null;
  }

  /**
   * Find admin user by ID
   */
  async findAdminUserById(userId: string) {
    return await prisma.schoolAdminUser.findUnique({
      where: { id: userId },
      include: { school: true },
    });
  }

  /**
   * Update admin user
   */
  async updateAdminUser(userId: string, data: any) {
    const user = await this.findAdminUserById(userId);
    if (!user) throw new NotFoundException('User not found');
    return await prisma.schoolAdminUser.update({
      where: { id: userId },
      data,
    });
  }

  /**
   * Update system user
   */
  async updateSystemUser(userId: string, data: any) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new NotFoundException('User not found');
    return await prisma.user.update({
      where: { id: userId },
      data,
    });
  }

  /**
   * Check if email is already registered
   */
  async isEmailRegistered(email: string): Promise<boolean> {
    const user = await prisma.schoolAdminUser.findUnique({
      where: { email },
    });
    return !!user;
  }

  /**
   * Check if school slug exists
   */
  async isSlugExists(slug: string): Promise<boolean> {
    const school = await prisma.school.findUnique({
      where: { slug },
    });
    return !!school;
  }

  /**
   * Check if school name already exists
   */
  async isNameExists(name: string): Promise<boolean> {
    const school = await prisma.school.findUnique({
      where: { name },
    });
    return !!school;
  }
}
