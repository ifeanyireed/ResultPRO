import { prisma } from '@config/database';
import { NotFoundException } from '@modules/common/exceptions/not-found.exception';

export class SubjectRepository {
  async create(data: any) {
    return await prisma.subject.create({ data });
  }

  async findById(id: string) {
    return await prisma.subject.findUnique({ where: { id } });
  }

  async findByClass(classId: string) {
    return await prisma.subject.findMany({
      where: { schoolId: classId }, // Updated to match schema
      orderBy: { createdAt: 'asc' },
    });
  }

  async findBySchool(schoolId: string) {
    return await prisma.subject.findMany({
      where: { schoolId },
    });
  }

  async update(id: string, data: any) {
    const subject = await this.findById(id);
    if (!subject) throw new NotFoundException('Subject not found');
    return await prisma.subject.update({ where: { id }, data });
  }

  async bulkCreate(subjectData: any[]) {
    // Check for existing subjects by school and name to handle duplicates
    const existingSubjects = new Map();
    
    const createdSubjects = await Promise.all(
      subjectData.map(async (data) => {
        // Try to find existing subject by schoolId and name first
        const existing = await prisma.subject.findFirst({
          where: {
            schoolId: data.schoolId,
            name: data.name,
          },
        });
        
        if (existing) {
          return existing;
        }
        
        // Use upsert with schoolId + code as unique identifier
        // This prevents duplicate code errors
        return await prisma.subject.upsert({
          where: {
            schoolId_code: {
              schoolId: data.schoolId,
              code: data.code,
            },
          },
          create: data,
          update: {
            name: data.name,
            description: data.description,
          },
        });
      })
    );
    return createdSubjects;
  }

  async delete(id: string): Promise<boolean> {
    const subject = await this.findById(id);
    if (!subject) throw new NotFoundException('Subject not found');
    await prisma.subject.delete({ where: { id } });
    return true;
  }
}
