import { prisma } from '@config/database';
import { NotFoundException } from '@modules/common/exceptions/not-found.exception';

export class ClassRepository {
  async create(data: any) {
    return await prisma.class.create({ data });
  }

  async findById(id: string) {
    return await prisma.class.findUnique({ where: { id } });
  }

  async findBySchool(schoolId: string) {
    return await prisma.class.findMany({
      where: { schoolId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findByCode(schoolId: string, classCode: string) {
    return await prisma.class.findFirst({
      where: { schoolId, name: classCode },
    });
  }

  async update(id: string, data: any) {
    const classItem = await this.findById(id);
    if (!classItem) throw new NotFoundException('Class not found');
    return await prisma.class.update({ where: { id }, data });
  }

  async bulkCreate(classData: any[]) {
    const createdClasses = await Promise.all(
      classData.map(data => prisma.class.create({ data }))
    );
    return createdClasses;
  }

  async delete(id: string): Promise<boolean> {
    const classItem = await this.findById(id);
    if (!classItem) throw new NotFoundException('Class not found');
    await prisma.class.delete({ where: { id } });
    return true;
  }
}
