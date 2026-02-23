import { prisma } from '@config/database';
import { NotFoundException } from '@modules/common/exceptions/not-found.exception';

export class GradingRepository {
  async createSystem(data: any) {
    return await prisma.gradingSystem.create({ data });
  }

  async findSystemById(id: string) {
    return await prisma.gradingSystem.findUnique({ where: { id } });
  }

  async findSystemsBySchool(schoolId: string) {
    return await prisma.gradingSystem.findMany({
      where: { schoolId },
    });
  }

  async updateSystem(id: string, data: any) {
    const system = await this.findSystemById(id);
    if (!system) throw new NotFoundException('Grading system not found');
    return await prisma.gradingSystem.update({ where: { id }, data });
  }

  async deleteSystem(id: string): Promise<boolean> {
    const system = await this.findSystemById(id);
    if (!system) throw new NotFoundException('Grading system not found');
    await prisma.gradingSystem.delete({ where: { id } });
    return true;
  }

  async createGrade(data: any) {
    return await prisma.grade.create({ data });
  }

  async findGradesBySystem(systemId: string) {
    return await prisma.grade.findMany({
      where: { gradingSystemId: systemId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async bulkCreateGrades(gradeData: any[]) {
    return await prisma.grade.createMany({ data: gradeData });
  }

  async deleteGrade(id: string): Promise<boolean> {
    const grade = await prisma.grade.findUnique({ where: { id } });
    if (!grade) throw new NotFoundException('Grade not found');
    await prisma.grade.delete({ where: { id } });
    return true;
  }
}
