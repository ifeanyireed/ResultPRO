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
   * Get school profile
   */
  async getSchoolProfile(schoolId: string) {
    const school = await prisma.school.findUnique({
      where: { id: schoolId },
      select: {
        id: true,
        name: true,
        motto: true,
        logoUrl: true,
        logoEmoji: true,
        primaryColor: true,
        secondaryColor: true,
        accentColor: true,
        contactEmail: true,
        contactPhone: true,
        contactPersonName: true,
        altContactEmail: true,
        altContactPhone: true,
        fullAddress: true,
        state: true,
        lga: true,
        subscriptionTier: true,
        subscriptionStartDate: true,
        subscriptionEndDate: true,
        maxStudents: true,
        maxTeachers: true,
        academicSessions: {
          select: {
            id: true,
            name: true,
            startDate: true,
            endDate: true,
            isActive: true,
            terms: {
              select: {
                id: true,
                name: true,
                startDate: true,
                endDate: true,
                isActive: true,
              },
              orderBy: {
                name: 'asc',
              },
            },
          },
          orderBy: {
            startDate: 'desc',
          },
        },
      },
    });
    if (!school) throw new NotFoundException('School not found');
    return school;
  }

  /**
   * Get onboarding status
   */
  async getStatus(schoolId: string) {
    return await this.onboardingRepo.getStatus(schoolId);
  }

  /**
   * Step 1: Update school profile (full update)
   */
  async updateSchoolProfile(schoolId: string, data: any) {
    const school = await prisma.school.findUnique({ where: { id: schoolId } });
    if (!school) throw new NotFoundException('School not found');

    const updateData: any = {};
    if (data.motto !== undefined) updateData.motto = data.motto;
    if (data.logoUrl !== undefined) updateData.logoUrl = data.logoUrl;
    if (data.primaryColor !== undefined) updateData.primaryColor = data.primaryColor;
    if (data.secondaryColor !== undefined) updateData.secondaryColor = data.secondaryColor;
    if (data.accentColor !== undefined) updateData.accentColor = data.accentColor;
    if (data.contactPersonName !== undefined) updateData.contactPersonName = data.contactPersonName;
    if (data.contactPhone !== undefined) updateData.contactPhone = data.contactPhone;
    if (data.altContactEmail !== undefined) updateData.altContactEmail = data.altContactEmail;
    if (data.altContactPhone !== undefined) updateData.altContactPhone = data.altContactPhone;

    await prisma.school.update({
      where: { id: schoolId },
      data: updateData,
    });

    await this.onboardingRepo.updateStep(schoolId, 1, data);

    return school;
  }

  /**
   * Step 1: Partial update school profile (real-time database write)
   */
  async partialUpdateSchoolProfile(schoolId: string, data: any) {
    const school = await prisma.school.findUnique({ where: { id: schoolId } });
    if (!school) throw new NotFoundException('School not found');

    const updateData: any = {};
    if (data.motto !== undefined) updateData.motto = data.motto;
    if (data.logoUrl !== undefined) updateData.logoUrl = data.logoUrl;
    if (data.primaryColor !== undefined) updateData.primaryColor = data.primaryColor;
    if (data.secondaryColor !== undefined) updateData.secondaryColor = data.secondaryColor;
    if (data.accentColor !== undefined) updateData.accentColor = data.accentColor;
    if (data.contactPersonName !== undefined) updateData.contactPersonName = data.contactPersonName;
    if (data.contactPhone !== undefined) updateData.contactPhone = data.contactPhone;
    if (data.altContactEmail !== undefined) updateData.altContactEmail = data.altContactEmail;
    if (data.altContactPhone !== undefined) updateData.altContactPhone = data.altContactPhone;

    if (Object.keys(updateData).length === 0) {
      return school;
    }

    const updated = await prisma.school.update({
      where: { id: schoolId },
      data: updateData,
    });

    return updated;
  }

  /**
   * Step 2: Partial update academic session with terms (real-time database write)
   */
  async partialUpdateAcademicSession(schoolId: string, data: any) {
    const school = await prisma.school.findUnique({ where: { id: schoolId } });
    if (!school) throw new NotFoundException('School not found');

    const sessionName = data.academicSessionName || `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`;

    // Upsert the academic session (handles unique constraint on schoolId + name)
    const session = await prisma.academicSession.upsert({
      where: {
        schoolId_name: {
          schoolId,
          name: sessionName,
        },
      },
      create: {
        schoolId,
        name: sessionName,
        startDate: data.startDate ? new Date(data.startDate) : new Date(),
        endDate: data.endDate ? new Date(data.endDate) : new Date(),
        isActive: true,
      },
      update: {
        ...(data.startDate && { startDate: new Date(data.startDate) }),
        ...(data.endDate && { endDate: new Date(data.endDate) }),
      },
    });

    // If updating terms data with valid dates
    if (data.terms && Array.isArray(data.terms)) {
      // Filter terms that have valid dates (not empty strings)
      const validTerms = data.terms.filter((term: any) => 
        term.startDate && term.endDate && term.startDate.trim() && term.endDate.trim()
      );

      // Only create terms if there are valid ones
      if (validTerms.length > 0) {
        // Delete existing terms
        await prisma.term.deleteMany({
          where: { sessionId: session.id },
        });

        // Create new terms
        const newTerms = await Promise.all(
          validTerms.map((term: any) =>
            prisma.term.create({
              data: {
                sessionId: session.id,
                name: term.name,
                startDate: new Date(term.startDate),
                endDate: new Date(term.endDate),
                isActive: false,
              },
            })
          )
        );

        return {
          session: {
            id: session.id,
            name: session.name,
            startDate: session.startDate,
            endDate: session.endDate,
          },
          terms: newTerms.map(t => ({
            id: t.id,
            name: t.name,
            startDate: t.startDate,
            endDate: t.endDate,
          })),
        };
      }
    }

    return session;
  }

  /**
   * Step 2: Create academic session and terms
   */
  async createAcademicSession(schoolId: string, data: any) {
    const school = await prisma.school.findUnique({ where: { id: schoolId } });
    if (!school) throw new NotFoundException('School not found');

    // Create session (use academicSessionName if provided, fallback to name)
    const sessionName = data.academicSessionName || data.name || `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`;
    
    // Upsert session - if exists for this school with same name, update it
    const session = await prisma.academicSession.upsert({
      where: {
        schoolId_name: {
          schoolId,
          name: sessionName,
        },
      },
      create: {
        schoolId,
        name: sessionName,
        startDate: data.startDate ? new Date(data.startDate) : new Date(),
        endDate: data.endDate ? new Date(data.endDate) : new Date(),
        isActive: true,
      },
      update: {
        startDate: data.startDate ? new Date(data.startDate) : new Date(),
        endDate: data.endDate ? new Date(data.endDate) : new Date(),
        isActive: true,
      },
    });

    // Create terms (filter valid ones with dates)
    const validTerms = (data.terms || []).filter((term: any) => 
      term.startDate && term.endDate && 
      typeof term.startDate === 'string' && term.startDate.trim() &&
      typeof term.endDate === 'string' && term.endDate.trim()
    );

    let terms: any[] = [];
    if (validTerms.length > 0) {
      const termData = validTerms.map((term: any, index: number) => ({
        sessionId: session.id,
        name: term.name || `Term ${index + 1}`,
        startDate: new Date(term.startDate),
        endDate: new Date(term.endDate),
        isActive: index === 0,
      }));

      terms = await this.termRepo.bulkCreate(termData);
    }

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

    // Generate unique codes with collision handling
    const codeTracker = new Map<string, string[]>(); // baseCode -> list of generated codes
    const subjectData = (data.subjects as any[]).map((subj: any, index: number) => {
      let baseCode = subj.code || subj.subjectCode || (subj.name || subj.subjectName)?.toUpperCase().substring(0, 3) || 'SUB';
      
      // Ensure code is unique within this batch
      let code = baseCode;
      let suffix = 1;
      while ((codeTracker.get(baseCode) || []).includes(code)) {
        // If this code is already taken, append a number to make it unique
        code = `${baseCode}${suffix}`;
        suffix++;
      }

      // Track this code
      if (!codeTracker.has(baseCode)) {
        codeTracker.set(baseCode, []);
      }
      codeTracker.get(baseCode)!.push(code);

      return {
        schoolId,
        name: subj.name || subj.subjectName,
        code: code,
        description: subj.description,
      };
    });

    const subjects = await this.subjectRepo.bulkCreate(subjectData);

    // Link subjects to classes if classId is provided
    for (const subject of subjects) {
      const originalSubject = data.subjects.find((s: any) => (s.name || s.subjectName) === subject.name);
      if (originalSubject?.classId) {
        // Validate that the class exists and belongs to this school
        const cls = await prisma.class.findFirst({
          where: {
            id: originalSubject.classId,
            schoolId,
          },
        });
        if (cls) {
          await prisma.classSubject.upsert({
            where: {
              classId_subjectId: {
                classId: cls.id,
                subjectId: subject.id,
              },
            },
            create: {
              classId: cls.id,
              subjectId: subject.id,
            },
            update: {},
          });
        }
      }
    }

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
   * Step 3: Partial update classes (real-time database write)
   */
  async partialUpdateClasses(schoolId: string, data: any) {
    const school = await prisma.school.findUnique({ where: { id: schoolId } });
    if (!school) throw new NotFoundException('School not found');

    if (!data.classes || !Array.isArray(data.classes)) {
      return { classes: [] };
    }

    // Delete existing classes and recreate
    await prisma.class.deleteMany({
      where: { schoolId },
    });

    // Create new classes
    const classData = data.classes.map((cls: any) => ({
      schoolId,
      name: cls.name || cls.className,
      level: cls.level || cls.classLevel || 'SS1',
      maxCapacity: cls.maxCapacity,
      classTeacher: cls.classTeacher,
    }));

    const classes = await Promise.all(
      classData.map((c: any) =>
        prisma.class.create({
          data: c,
        })
      )
    );

    return {
      classes: classes.map((c) => ({
        id: c.id,
        name: c.name,
        level: c.level,
      })),
    };
  }

  /**
   * Step 4: Partial update subjects with class associations (real-time database write)
   */
  async partialUpdateSubjects(schoolId: string, data: any) {
    const school = await prisma.school.findUnique({ where: { id: schoolId } });
    if (!school) throw new NotFoundException('School not found');

    if (!data.subjects || !Array.isArray(data.subjects)) {
      return { subjects: [] };
    }

    // Delete existing subjects and recreate
    await prisma.subject.deleteMany({
      where: { schoolId },
    });

    // Create new subjects
    const subjects = await Promise.all(
      data.subjects.map((subj: any) =>
        prisma.subject.create({
          data: {
            schoolId,
            name: subj.name || subj.subjectName,
            code: subj.code || subj.subjectCode || subj.name?.toUpperCase().substring(0, 3) || 'SUB',
            description: subj.description,
          },
        })
      )
    );

    // Link subjects to classes if classId is provided
    const classSubjectLinks: any[] = [];
    for (const subject of subjects) {
      const originalSubject = data.subjects.find((s: any) => (s.name || s.subjectName) === subject.name);
      if (originalSubject?.classId) {
        // Validate that the class exists and belongs to this school
        const cls = await prisma.class.findFirst({
          where: {
            id: originalSubject.classId,
            schoolId,
          },
        });
        if (cls) {
          const link = await prisma.classSubject.create({
            data: {
              classId: cls.id,
              subjectId: subject.id,
            },
          });
          classSubjectLinks.push(link);
        }
      }
    }

    return {
      subjects: subjects.map((s) => ({
        id: s.id,
        name: s.name,
        code: s.code,
      })),
      classSubjectLinks,
    };
  }

  /**
   * Step 5: Configure grading system
   */
  async createGradingSystem(schoolId: string, data: any) {
    const school = await prisma.school.findUnique({ where: { id: schoolId } });
    if (!school) throw new NotFoundException('School not found');

    // Extract grades from the correct location in the request
    // Frontend sends: { gradingSystem: { template, gradeScale: [...] } }
    const gradeScaleData = data?.gradingSystem?.gradeScale || data?.grades || [];
    
    if (!Array.isArray(gradeScaleData) || gradeScaleData.length === 0) {
      throw new Error('Grade scale is required and must contain at least one grade');
    }

    // Create grading system
    const gradingSystem = await this.gradingRepo.createSystem({
      schoolId,
      name: data?.gradingSystem?.template || data?.name || 'Grading System',
      description: data?.gradingSystem?.template ? `${data.gradingSystem.template} grading system` : data?.description,
      isDefault: true,
    });

    // Create grades (no specific subject required for grading system templates)
    const gradeData = gradeScaleData.map((grade: any, index: number) => ({
      schoolId,
      gradingSystemId: gradingSystem.id,
      subjectId: null, // Grades are tied to the grading system, not specific subjects
      gradeName: grade.grade || grade.gradeName || grade.gradeLetter || 'Grade',
      minScore: grade.minScore || 0,
      maxScore: grade.maxScore || 100,
      description: grade.description || '',
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
