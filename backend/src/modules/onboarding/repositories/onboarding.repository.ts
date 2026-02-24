import { prisma } from '@config/database';
import { NotFoundException } from '@modules/common/exceptions/not-found.exception';

export class OnboardingRepository {
  async getState(schoolId: string) {
    return await prisma.onboardingState.findUnique({
      where: { schoolId },
    });
  }

  async createState(schoolId: string) {
    return await prisma.onboardingState.create({
      data: {
        schoolId,
        completedSteps: JSON.stringify([]),
        currentStep: 1,
        isComplete: false,
      },
    });
  }

  async updateStep(schoolId: string, stepNumber: number, stepData: any) {
    let state = await this.getState(schoolId);

    if (!state) {
      state = await this.createState(schoolId);
    }

    const completedSteps = Array.from(new Set([...JSON.parse(state.completedSteps || '[]'), stepNumber]));

    return await prisma.onboardingState.update({
      where: { schoolId },
      data: {
        completedSteps: JSON.stringify(completedSteps),
        currentStep: Math.max(state.currentStep, stepNumber + 1),
      },
    });
  }

  async getStepData(schoolId: string, stepNumber: number) {
    const state = await this.getState(schoolId);
    if (!state) return null;

    return state.completedSteps;
  }

  async markComplete(schoolId: string) {
    const state = await this.getState(schoolId);
    if (!state) return null;

    const updated = await prisma.onboardingState.update({
      where: { schoolId },
      data: {
        isComplete: true,
        completedSteps: JSON.stringify([1, 2, 3, 4, 5, 6]),
        currentStep: 6,
      },
    });

    // Update school onboarding status
    await prisma.school.update({
      where: { id: schoolId },
      data: {
        onboardingStatus: 'COMPLETE',
        onboardingCompletedAt: new Date(),
      },
    });

    return updated;
  }

  async getStatus(schoolId: string) {
    const state = await this.getState(schoolId);
    const school = await prisma.school.findUnique({ where: { id: schoolId } });

    if (!school) throw new NotFoundException('School not found');

    return {
      schoolId,
      schoolName: school.name,
      onboardingStatus: school.onboardingStatus,
      currentStep: state?.currentStep || 1,
      completedSteps: JSON.parse(state?.completedSteps || '[]'),
      // Step 1: School Profile
      motto: school.motto,
      logoUrl: school.logoUrl,
      primaryColor: school.primaryColor,
      secondaryColor: school.secondaryColor,
      accentColor: school.accentColor,
      contactPersonName: school.contactPersonName,
      contactPhone: school.contactPhone,
      altContactEmail: school.altContactEmail,
      altContactPhone: school.altContactPhone,
      stepData: {},
    };
  }
}
