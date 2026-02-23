import { OnboardingRepository } from '../repositories/onboarding.repository';
import { SessionRepository } from '../repositories/session.repository';
import { TermRepository } from '../repositories/term.repository';
import { ClassRepository } from '../repositories/class.repository';
import { SubjectRepository } from '../repositories/subject.repository';
import { GradingRepository } from '../repositories/grading.repository';
import { prisma } from '@config/database';
import { NotFoundException } from '@modules/common/exceptions/not-found.exception';
import { ConflictException } from '@modules/common/exceptions/conflict.exception';

export class OnboardingService {
  private onboardingRepo: OnboardingRepository;
  private sessionRepo: SessionRepository;
  private termRepo: TermRepository;
  private classRepo: ClassRepository;
  private subjectRepo: SubjectRepository;
  private gradingRepo: GradingRepository;

  constructor() {
    this.onboardingRepo = new OnboardingRepository();
    this.sessionRepo = new SessionRepository();
    this.termRepo = new TermRepository();
    this.classRepo = new ClassRepository();
    this.subjectRepo = new SubjectRepository();
    this.gradingRepo = new GradingRepository();
  }

  /**
   * Get onboarding status
   */
  async getStatus(schoolId: string) {
    return await this.onboardingRepo.getStatus(schoolId);
  }

  /**
   * Step 1: Update school profile
   */
  async updateSchoolProfile(schoolId: string, data: any) {
    const school = await prisma.school.findUnique({ where: { id: schoolId } });
    if (!school) throw new NotFoundException('School not found');

    await prisma.school.update({
      where: { id: schoolId },
      data: {
        motto: data.motto,
        logoUrl: data.logoUrl,
        logoEmoji: data.logoEmoji,
        primaryColor: data.primaryColor,
        secondaryColor: data.secondaryColor,
        accentColor: data.accentColor,
        contactPersonName: data.contactPersonName,
        contactPhone: data.contactPhone,
        altContactEmail: data.altContactEmail,
        altContactPhone: data.altContactPhone,
      },
    });

    await this.onboardingRepo.updateStep(schoolId, 1, data);

    return school;
  }

  /**
   * Step 2: Create academic session and terms
   */
  async createAcademicSession(schoolId: string, data: any) {
    const school = await prisma.school.findUnique({ where: { id: schoolId } });
    if (!school) throw new NotFoundException('School not found');

    // Create session
    const session = await this.sessionRepo.create({
      schoolId,
      name: data.name,
      startDate: data.startDate,
      endDate: data.endDate,
      isActive: true,
    });

    // Create terms
    const termData = data.terms.map((term: any, index: number) => ({
      sessionId: session.id,
      name: term.name,
      startDate: term.startDate,
      endDate: term.endDate,
      isActive: index === 0,
    }));

    const terms = await this.termRepo.bulkCreate(termData);

    // Update onboarding state
    await this.onboardingRepo.updateStep(schoolId, 2, {
      sessionId: session.id,
      terms: terms.map((t) => ({
        id: t.id,
        name: t.name,
      })),
    });

    return {
      session: {
        id: session.id,
        name: session.name,
        startDate: session.startDate,
        endDate: session.endDate,
      },
      terms: terms.map((t) => ({
        id: t.id,
        name: t.name,
        startDate: t.startDate,
        endDate: t.endDate,
      })),
    };
  }

  /**
   * Step 3: Create classes
   */
  async createClasses(schoolId: string, data: any) {
    const school = await prisma.school.findUnique({ where: { id: schoolId } });
    if (!school) throw new NotFoundException('School not found');

    const classData = data.classes.map((cls: any, index: number) => ({
      schoolId,
      name: cls.name || cls.className,
      level: cls.level || cls.classLevel || 'SS1',
      maxCapacity: cls.maxCapacity,
    }));

    const classes = await this.classRepo.bulkCreate(classData);

    await this.onboardingRepo.updateStep(schoolId, 3, {
      classIds: classes.map((c) => c.id),
      classes: classes.map((c) => ({
        id: c.id,
        name: c.name,
      })),
    });

    return classes.map((c) => ({
      id: c.id,
      name: c.name,
      level: c.level,
    }));
  }

  /**
   * Step 4: Create subjects for classes
   */
  async createSubjects(schoolId: string, data: any) {
    const school = await prisma.school.findUnique({ where: { id: schoolId } });
    if (!school) throw new NotFoundException('School not found');

    const subjectData = (data.subjects as any[]).map((subj: any, index: number) => ({
      schoolId,
      name: subj.name || subj.subjectName,
      code: subj.code || subj.subjectCode,
      description: subj.description,
    }));

    const subjects = await this.subjectRepo.bulkCreate(subjectData);

    await this.onboardingRepo.updateStep(schoolId, 4, {
      subjectCount: subjects.length,
      subjects: subjects.map((s) => ({
        id: s.id,
        name: s.name,
        code: s.code,
      })),
    });

    return subjects.map((s) => ({
      id: s.id,
      name: s.name,
      code: s.code,
    }));
  }

  /**
   * Step 5: Configure grading system
   */
  async createGradingSystem(schoolId: string, data: any) {
    const school = await prisma.school.findUnique({ where: { id: schoolId } });
    if (!school) throw new NotFoundException('School not found');

    // Create grading system
    const gradingSystem = await this.gradingRepo.createSystem({
      schoolId,
      name: data.name || 'Grading System',
      description: data.description,
      isDefault: true,
    });

    // Create grades
    const gradeData = data.grades.map((grade: any, index: number) => ({
      schoolId,
      gradingSystemId: gradingSystem.id,
      subjectId: grade.subjectId || 'default',
      gradeName: grade.gradeName || grade.gradeLetter || 'Grade',
      minScore: grade.minScore || 0,
      maxScore: grade.maxScore || 100,
      description: grade.description,
    }));

    const grades = await this.gradingRepo.bulkCreateGrades(gradeData);

    await this.onboardingRepo.updateStep(schoolId, 5, {
      gradingSystemId: gradingSystem.id,
      gradeCount: gradeData.length,
    });

    return {
      gradingSystem: {
        id: gradingSystem.id,
        name: gradingSystem.name,
      },
      grades: gradeData.map((g: any) => ({
        gradeName: g.gradeName,
        minScore: g.minScore,
        maxScore: g.maxScore,
      })),
    };
  }

  /**
   * Step 6: CSV upload (just track in onboarding state)
   */
  async recordCsvUpload(schoolId: string, data: any) {
    await this.onboardingRepo.updateStep(schoolId, 6, {
      recordsUploaded: data.recordCount || 0,
      uploadedAt: new Date(),
    });

    return {
      success: true,
      message: 'Data uploaded successfully',
    };
  }

  /**
   * Mark onboarding as complete
   */
  async completeOnboarding(schoolId: string) {
    const school = await prisma.school.findUnique({ where: { id: schoolId } });
    if (!school) throw new NotFoundException('School not found');

    return await this.onboardingRepo.markComplete(schoolId);
  }
}

export const onboardingService = new OnboardingService();
