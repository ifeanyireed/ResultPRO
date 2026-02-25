import { prisma } from '@config/database';
import { NotFoundException } from '@modules/common/exceptions/not-found.exception';

export class ResultsSetupService {
  async createOrUpdateSession(schoolId: string, stepData: any) {
    const existingSession = await prisma.resultsSetupSession.findUnique({
      where: { schoolId },
    });

    if (existingSession) {
      return prisma.resultsSetupSession.update({
        where: { schoolId },
        data: stepData,
      });
    }

    return prisma.resultsSetupSession.create({
      data: {
        schoolId,
        ...stepData,
      },
    });
  }

  async getSession(schoolId: string) {
    const session = await prisma.resultsSetupSession.findUnique({
      where: { schoolId },
    });

    if (!session) {
      throw new NotFoundException('Results setup session not found');
    }

    return session;
  }

  async updateStep(schoolId: string, stepNumber: number, stepData: any) {
    const session = await prisma.resultsSetupSession.findUnique({
      where: { schoolId },
    });

    if (!session) {
      throw new NotFoundException('Results setup session not found');
    }

    // Parse completed steps
    const completedSteps = JSON.parse(session.completedSteps || '[]');
    if (!completedSteps.includes(stepNumber)) {
      completedSteps.push(stepNumber);
      completedSteps.sort((a: number, b: number) => a - b);
    }

    return prisma.resultsSetupSession.update({
      where: { schoolId },
      data: {
        ...stepData,
        completedSteps: JSON.stringify(completedSteps),
      },
    });
  }

  async updateStaffDataRealtime(schoolId: string, dataUpdate: any) {
    const session = await prisma.resultsSetupSession.findUnique({
      where: { schoolId },
    });

    if (!session) {
      throw new NotFoundException('Results setup session not found');
    }

    // Only update the fields provided (real-time partial update)
    const updateData: any = {};
    if (dataUpdate.principalName !== undefined) {
      updateData.principalName = dataUpdate.principalName;
    }
    if (dataUpdate.principalSignatureUrl !== undefined) {
      updateData.principalSignatureUrl = dataUpdate.principalSignatureUrl;
    }
    if (dataUpdate.staffData !== undefined) {
      updateData.staffData = dataUpdate.staffData;
    }

    return prisma.resultsSetupSession.update({
      where: { schoolId },
      data: updateData,
    });
  }

  async initializeSession(schoolId: string) {
    const existingSession = await prisma.resultsSetupSession.findUnique({
      where: { schoolId },
    });

    if (existingSession) {
      return existingSession;
    }

    return prisma.resultsSetupSession.create({
      data: {
        schoolId,
        currentStep: 1,
        completedSteps: '[]',
      },
    });
  }
}
