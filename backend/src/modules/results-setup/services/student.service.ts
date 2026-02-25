import { prisma } from '@config/database';
import { NotFoundException } from '@modules/common/exceptions/not-found.exception';

export class StudentService {
  /**
   * Generate admission number from student's name
   * Format: FFF-LLL-NNNN where FFF is first 3 letters of first name, LLL is first 3 letters of last name, NNNN is globally incremental for school
   * Example: "Ebere Mbilitam" -> "EBE-MBI-0001", next student -> "JOH-DOE-0002", etc.
   */
  private async generateAdmissionNumber(schoolId: string, fullName: string): Promise<string> {
    // Split name into parts
    const nameParts = fullName.trim().split(/\s+/);
    const firstName = nameParts[0] || '';
    const lastName = nameParts[nameParts.length - 1] || '';

    const firstNamePrefix = firstName.substring(0, 3).toUpperCase();
    const lastNamePrefix = lastName.substring(0, 3).toUpperCase();

    // Get the total count of students for this school (globally incremental)
    const totalStudentsCount = await prisma.student.count({
      where: {
        schoolId,
      },
    });

    // Create admission number with globally incremental ID (0001, 0002, etc.)
    const sequenceNumber = (totalStudentsCount + 1).toString().padStart(4, '0');
    return `${firstNamePrefix}-${lastNamePrefix}-${sequenceNumber}`;
  }

  /**
   * Create a new student
   */
  async createStudent(schoolId: string, classId: string, name: string, parentEmail?: string) {
    // Verify school exists
    const school = await prisma.school.findUnique({ where: { id: schoolId } });
    if (!school) throw new NotFoundException('School not found');

    // Verify class exists
    const classItem = await prisma.class.findUnique({ where: { id: classId } });
    if (!classItem) throw new NotFoundException('Class not found');

    // Generate admission number
    const admissionNumber = await this.generateAdmissionNumber(schoolId, name);

    // Create student
    const student = await prisma.student.create({
      data: {
        schoolId,
        classId,
        name,
        admissionNumber,
        parentEmail: parentEmail || null,
      },
    });

    return student;
  }

  /**
   * Get all students for a session/class
   */
  async getStudentsForSession(schoolId: string, classId?: string) {
    const school = await prisma.school.findUnique({ where: { id: schoolId } });
    if (!school) throw new NotFoundException('School not found');

    const students = await prisma.student.findMany({
      where: {
        schoolId,
        ...(classId && { classId }),
      },
      include: {
        class: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return students;
  }

  /**
   * Get students for a specific class
   */
  async getStudentsByClass(schoolId: string, classId: string) {
    const classItem = await prisma.class.findUnique({ where: { id: classId } });
    if (!classItem) throw new NotFoundException('Class not found');

    const students = await prisma.student.findMany({
      where: {
        schoolId,
        classId,
      },
      orderBy: { createdAt: 'asc' },
    });

    return students;
  }

  /**
   * Delete a student
   */
  async deleteStudent(schoolId: string, studentId: string) {
    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student || student.schoolId !== schoolId) {
      throw new NotFoundException('Student not found');
    }

    await prisma.student.delete({ where: { id: studentId } });
    return true;
  }

  /**
   * Update student information
   */
  async updateStudent(schoolId: string, studentId: string, data: any) {
    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student || student.schoolId !== schoolId) {
      throw new NotFoundException('Student not found');
    }

    const updated = await prisma.student.update({
      where: { id: studentId },
      data: {
        name: data.name || student.name,
        parentEmail: data.parentEmail !== undefined ? data.parentEmail : student.parentEmail,
      },
    });

    return updated;
  }
}

export const studentService = new StudentService();
