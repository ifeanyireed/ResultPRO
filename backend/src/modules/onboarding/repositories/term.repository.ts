import { prisma } from '@config/database';
import { NotFoundException } from '@modules/common/exceptions/not-found.exception';

export class TermRepository {
  async create(data: any) {
    return await prisma.term.create({ data });
  }

  async findById(id: string) {
    return await prisma.term.findUnique({ where: { id } });
  }

  async findBySession(sessionId: string) {
    return await prisma.term.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async update(id: string, data: any) {
    const term = await this.findById(id);
    if (!term) throw new NotFoundException('Term not found');
    return await prisma.term.update({ where: { id }, data });
  }

  async bulkCreate(termData: any[]) {
    // Create all terms in parallel and return the created terms
    const createdTerms = await Promise.all(
      termData.map(data => prisma.term.create({ data }))
    );
    return createdTerms;
  }

  async delete(id: string): Promise<boolean> {
    const term = await this.findById(id);
    if (!term) throw new NotFoundException('Term not found');
    await prisma.term.delete({ where: { id } });
    return true;
  }
}
