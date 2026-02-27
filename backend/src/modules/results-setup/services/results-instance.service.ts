import { prisma } from '@config/database';

// Custom exception classes
class NotFoundException extends Error {
  status = 404;
  code = 'NOT_FOUND';
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundException';
  }
}

class BadRequestException extends Error {
  status = 400;
  code = 'BAD_REQUEST';
  constructor(message: string) {
    super(message);
    this.name = 'BadRequestException';
  }
}

export class ResultsInstanceService {
  /**
   * Create a new results instance
   * Auto-archives any existing active instance for the same class/session/term
   */
  async createInstance(data: {
    schoolId: string;
    classId: string;
    sessionId: string;
    termId: string;
    instanceName: string;
    sessionName?: string;
    termName?: string;
    examConfigComponents: any[];
    affectiveTraits: string[];
    psychomotorSkills: string[];
    csvFileName?: string;
    csvFileUrl?: string;
    gradebookData: any[];
    totalStudents: number;
    createdBy?: string;
  }) {
    try {
      // Archive any existing active instance for this class/session/term
      await prisma.resultsInstance.updateMany({
        where: {
          schoolId: data.schoolId,
          classId: data.classId,
          sessionId: data.sessionId,
          termId: data.termId,
          status: 'active',
        },
        data: {
          status: 'archived',
          archivedAt: new Date(),
        },
      });

      // Create new instance
      const instance = await prisma.resultsInstance.create({
        data: {
          schoolId: data.schoolId,
          classId: data.classId,
          sessionId: data.sessionId,
          termId: data.termId,
          instanceName: data.instanceName,
          sessionName: data.sessionName,
          termName: data.termName,
          status: 'active',
          examConfigComponents: JSON.stringify(data.examConfigComponents),
          affectiveTraits: JSON.stringify(data.affectiveTraits),
          psychomotorSkills: JSON.stringify(data.psychomotorSkills),
          csvFileName: data.csvFileName,
          csvFileUrl: data.csvFileUrl,
          gradebookData: JSON.stringify(data.gradebookData),
          totalStudents: data.totalStudents,
          createdBy: data.createdBy,
        },
        include: {
          class: true,
          school: true,
        },
      });

      console.log('✅ Results instance created:', {
        id: instance.id,
        name: instance.instanceName,
        class: instance.class.name,
        students: instance.totalStudents,
      });

      return instance;
    } catch (error: any) {
      console.error('Failed to create results instance:', error);
      throw new BadRequestException('Failed to create results instance: ' + error.message);
    }
  }

  /**
   * Get active instance for a specific class/session/term
   */
  async getActiveInstance(schoolId: string, classId: string, sessionId: string, termId: string) {
    try {
      const instance = await prisma.resultsInstance.findFirst({
        where: {
          schoolId,
          classId,
          sessionId,
          termId,
          status: 'active',
        },
        include: {
          class: true,
          school: true,
        },
      });

      if (!instance) {
        throw new NotFoundException('No active results instance found for this class/term');
      }

      // Parse JSON fields
      return this.formatInstance(instance);
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * List all instances for a school
   */
  async listInstances(schoolId: string, filters?: { classId?: string; sessionId?: string; status?: string }) {
    try {
      const whereClause: any = { schoolId };
      if (filters?.classId) whereClause.classId = filters.classId;
      if (filters?.sessionId) whereClause.sessionId = filters.sessionId;
      if (filters?.status) whereClause.status = filters.status;

      const instances = await prisma.resultsInstance.findMany({
        where: whereClause,
        include: {
          class: true,
          school: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return instances.map((inst: any) => this.formatInstance(inst));
    } catch (error: any) {
      console.error('Failed to list instances:', error);
      throw new BadRequestException('Failed to list instances');
    }
  }

  /**
   * Get instance by ID
   */
  async getInstance(id: string) {
    try {
      const instance = await prisma.resultsInstance.findUnique({
        where: { id },
        include: {
          class: true,
          school: true,
        },
      });

      if (!instance) {
        throw new NotFoundException('Results instance not found');
      }

      return this.formatInstance(instance);
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Archive instance
   */
  async archiveInstance(id: string, archivedBy?: string) {
    try {
      const instance = await prisma.resultsInstance.update({
        where: { id },
        data: {
          status: 'archived',
          archivedAt: new Date(),
          archivedBy,
        },
        include: {
          class: true,
          school: true,
        },
      });

      console.log('📦 Instance archived:', instance.instanceName);
      return this.formatInstance(instance);
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Results instance not found');
      }
      throw new BadRequestException('Failed to archive instance');
    }
  }

  /**
   * Delete instance permanently
   */
  async deleteInstance(id: string) {
    try {
      await prisma.resultsInstance.delete({
        where: { id },
      });

      console.log('🗑️ Instance deleted:', id);
      return { success: true };
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Results instance not found');
      }
      throw new BadRequestException('Failed to delete instance');
    }
  }

  /**
   * Format instance data - parse JSON fields
   */
  private formatInstance(instance: any) {
    return {
      ...instance,
      examConfigComponents: this.parseJSON(instance.examConfigComponents),
      affectiveTraits: this.parseJSON(instance.affectiveTraits),
      psychomotorSkills: this.parseJSON(instance.psychomotorSkills),
      gradebookData: this.parseJSON(instance.gradebookData),
    };
  }

  /**
   * Safe JSON parse
   */
  private parseJSON(data: string) {
    try {
      return typeof data === 'string' ? JSON.parse(data) : data;
    } catch (e) {
      console.warn('Failed to parse JSON data:', e);
      return [];
    }
  }
}
