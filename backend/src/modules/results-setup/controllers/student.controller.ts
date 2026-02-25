import { Request, Response } from 'express';
import { studentService } from '../services/student.service';

/**
 * POST /api/results-setup/students/add
 * Add a new student
 */
export async function addStudent(req: Request, res: Response) {
  try {
    const schoolId = req.user?.schoolId;
    if (!schoolId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        code: 'UNAUTHORIZED',
      });
    }

    const { classId, name, parentEmail } = req.body;

    // Validation
    if (!classId || !name) {
      return res.status(400).json({
        success: false,
        error: 'classId and name are required',
        code: 'VALIDATION_ERROR',
      });
    }

    const student = await studentService.createStudent(
      schoolId,
      classId,
      name,
      parentEmail
    );

    res.json({
      success: true,
      message: 'Student added successfully',
      data: {
        student: {
          id: student.id,
          classId: student.classId,
          name: student.name,
          admissionNumber: student.admissionNumber,
          parentEmail: student.parentEmail,
        },
      },
    });
  } catch (error: any) {
    const status = error.status || 500;
    res.status(status).json({
      success: false,
      error: error.message,
      code: error.code || 'ERROR',
    });
  }
}

/**
 * GET /api/results-setup/students?classId=xxx
 * Get students for a class or all students
 */
export async function getStudents(req: Request, res: Response) {
  try {
    const schoolId = req.user?.schoolId;
    if (!schoolId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        code: 'UNAUTHORIZED',
      });
    }

    const classId = req.query.classId as string | undefined;

    let students;
    if (classId) {
      students = await studentService.getStudentsByClass(schoolId, classId);
    } else {
      students = await studentService.getStudentsForSession(schoolId);
    }

    res.json({
      success: true,
      data: {
        students: students.map((s: any) => ({
          id: s.id,
          classId: s.classId,
          className: (s as any).class?.name,
          name: s.name,
          admissionNumber: s.admissionNumber,
          parentEmail: s.parentEmail,
        })),
      },
    });
  } catch (error: any) {
    const status = error.status || 500;
    res.status(status).json({
      success: false,
      error: error.message,
      code: error.code || 'ERROR',
    });
  }
}

/**
 * DELETE /api/results-setup/students/:studentId
 * Delete a student
 */
export async function deleteStudent(req: Request, res: Response) {
  try {
    const schoolId = req.user?.schoolId;
    if (!schoolId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        code: 'UNAUTHORIZED',
      });
    }

    const { studentId } = req.params;
    if (!studentId) {
      return res.status(400).json({
        success: false,
        error: 'studentId is required',
        code: 'VALIDATION_ERROR',
      });
    }

    await studentService.deleteStudent(schoolId, studentId);

    res.json({
      success: true,
      message: 'Student deleted successfully',
    });
  } catch (error: any) {
    const status = error.status || 500;
    res.status(status).json({
      success: false,
      error: error.message,
      code: error.code || 'ERROR',
    });
  }
}

/**
 * PATCH /api/results-setup/students/:studentId
 * Update student information
 */
export async function updateStudent(req: Request, res: Response) {
  try {
    const schoolId = req.user?.schoolId;
    if (!schoolId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        code: 'UNAUTHORIZED',
      });
    }

    const { studentId } = req.params;
    if (!studentId) {
      return res.status(400).json({
        success: false,
        error: 'studentId is required',
        code: 'VALIDATION_ERROR',
      });
    }

    const student = await studentService.updateStudent(schoolId, studentId, req.body);

    res.json({
      success: true,
      message: 'Student updated successfully',
      data: {
        student: {
          id: student.id,
          classId: student.classId,
          name: student.name,
          admissionNumber: student.admissionNumber,
          parentEmail: student.parentEmail,
        },
      },
    });
  } catch (error: any) {
    const status = error.status || 500;
    res.status(status).json({
      success: false,
      error: error.message,
      code: error.code || 'ERROR',
    });
  }
}
