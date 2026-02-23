import { prisma } from '@config/database';
import { NotFoundException } from '@modules/common/exceptions/not-found.exception';

export class SessionRepository {
  async create(data: any) {
    return await prisma.academicSession.create({ data });
  }

  async findById(id: string) {
    return await prisma.academicSession.findUnique({ where: { id } });
  }

  async findBySchool(schoolId: string) {
    return await prisma.academicSession.findMany({
      where: { schoolId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findCurrentBySchool(schoolId: string) {
    return await prisma.academicSession.findFirst({
      where: { schoolId, isActive: true },
    });
  }

  async update(id: string, data: any) {
    const session = await this.findById(id);
    if (!session) throw new NotFoundException('Academic session not found');
    return await prisma.academicSession.update({ where: { id }, data });
  }

  async delete(id: string): Promise<boolean> {
    const session = await this.findById(id);
    if (!session) throw new NotFoundException('Academic session not found');
    await prisma.academicSession.delete({ where: { id } });
    return true;
  }
}
