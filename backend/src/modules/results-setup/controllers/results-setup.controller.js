import { prisma } from '@config/database';
import { S3Upload } from '@modules/auth/utils/s3-upload';
export async function getResultsSetupSession(req, res) {
    try {
        const schoolId = req.user?.schoolId;
        const { sessionId, termId } = req.params;
        if (!schoolId) {
            return res.status(401).json({
                success: false,
                error: 'User not authenticated',
            });
        }
        if (!sessionId || !termId) {
            return res.status(400).json({
                success: false,
                error: 'Session ID and Term ID are required',
            });
        }
        const resultsSetupSession = await prisma.resultsSetupSession.findUnique({
            where: {
                schoolId_sessionId_termId: {
                    schoolId,
                    sessionId,
                    termId,
                },
            },
        });
        if (!resultsSetupSession) {
            return res.json({
                success: true,
                data: {
                    resultsSetupSession: null,
                },
            });
        }
        res.json({
            success: true,
            data: {
                resultsSetupSession,
            },
        });
    }
    catch (error) {
        console.error('Get results setup session error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve results setup session',
            message: error.message,
        });
    }
}
export async function uploadSignature(req, res) {
    try {
        const schoolId = req.user?.schoolId;
        const file = req.file;
        const { signatureType } = req.body;
        if (!schoolId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated',
                code: 'UNAUTHORIZED',
            });
        }
        if (!file) {
            return res.status(400).json({
                success: false,
                message: 'Signature file is required',
                code: 'VALIDATION_ERROR',
            });
        }
        if (!signatureType || !['formTutor', 'principal'].includes(signatureType)) {
            return res.status(400).json({
                success: false,
                message: 'Valid signature type (formTutor or principal) is required',
                code: 'VALIDATION_ERROR',
            });
        }
        // Upload to S3
        const signatureUrl = await S3Upload.uploadFile(file, schoolId, `signature-${signatureType}`);
        res.json({
            success: true,
            message: 'Signature uploaded successfully',
            data: {
                signatureUrl,
                fileName: file.originalname,
                fileSize: file.size,
            },
        });
    }
    catch (error) {
        console.error('❌ Signature upload error:', error);
        const status = error.status || 500;
        res.status(status).json({
            success: false,
            message: error.message || 'Failed to upload signature',
            code: error.code || 'UPLOAD_ERROR',
        });
    }
}
// Get all students for a specific class
export async function getStudents(req, res) {
    try {
        const schoolId = req.user?.schoolId;
        const { classId } = req.params;
        console.log('📚 Fetching students:', {
            schoolId,
            classId,
            userExists: !!req.user,
            fullUser: req.user
        });
        if (!schoolId) {
            console.warn('⚠️ No schoolId found in request');
            return res.status(401).json({
                success: false,
                error: 'User not authenticated',
            });
        }
        if (!classId) {
            return res.status(400).json({
                success: false,
                error: 'classId is required',
            });
        }
        // First, let's check if this student data even exists in the database
        const allStudentsForSchool = await prisma.student.findMany({
            where: {
                schoolId,
            },
        });
        console.log(`📊 Total students in DB for school ${schoolId}: ${allStudentsForSchool.length}`);
        const students = await prisma.student.findMany({
            where: {
                schoolId,
                classId,
            },
        });
        console.log(`✅ Found ${students.length} students for class ${classId}`);
        // Map to frontend format
        const mappedStudents = students.map((s) => ({
            id: s.admissionNumber, // Use admission number as the display ID
            name: s.studentName,
            parentEmail: s.parentEmail,
        }));
        res.json({
            success: true,
            data: {
                students: mappedStudents,
            },
        });
    }
    catch (error) {
        console.error('❌ Get students error:', {
            message: error.message,
            code: error.code,
            meta: error.meta,
        });
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve students',
            message: error.message,
        });
    }
}
// Add a new student to a class
export async function addStudent(req, res) {
    try {
        const schoolId = req.user?.schoolId;
        const { classId, className, studentId, studentName, parentEmail } = req.body;
        console.log('📝 Adding student:', { schoolId, classId, studentId, studentName, userExists: !!req.user });
        if (!schoolId) {
            console.warn('⚠️ No schoolId found in request');
            return res.status(401).json({
                success: false,
                error: 'User not authenticated',
            });
        }
        if (!classId || !studentId || !studentName || !parentEmail) {
            console.warn('⚠️ Missing required fields:', { classId, studentId, studentName, parentEmail });
            return res.status(400).json({
                success: false,
                error: 'classId, studentId, studentName, and parentEmail are required',
            });
        }
        // Create student in database
        const student = await prisma.student.create({
            data: {
                schoolId,
                classId,
                admissionNumber: studentId,
                studentName,
                parentEmail,
                status: 'ACTIVE',
            },
        });
        console.log(`✅ Student created: ${studentName} (${studentId}) in class ${className}`);
        res.json({
            success: true,
            message: 'Student added successfully',
            data: {
                studentId: student.admissionNumber,
                studentName: student.studentName,
                classId: student.classId,
            },
        });
    }
    catch (error) {
        console.error('❌ Add student error:', {
            message: error.message,
            code: error.code,
            meta: error.meta,
        });
        res.status(500).json({
            success: false,
            error: 'Failed to add student',
            message: error.message,
        });
    }
}
// Delete a student
export async function deleteStudent(req, res) {
    try {
        const schoolId = req.user?.schoolId;
        const { studentId } = req.params;
        if (!schoolId) {
            return res.status(401).json({
                success: false,
                error: 'User not authenticated',
            });
        }
        if (!studentId) {
            return res.status(400).json({
                success: false,
                error: 'Student ID is required',
            });
        }
        // Delete student from database
        await prisma.student.deleteMany({
            where: {
                schoolId,
                admissionNumber: studentId,
            },
        });
        console.log(`✅ Student deleted: ${studentId}`);
        res.json({
            success: true,
            message: 'Student deleted successfully',
            data: {
                studentId,
            },
        });
    }
    catch (error) {
        console.error('Delete student error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete student',
            message: error.message,
        });
    }
}
export async function getClassSubjects(req, res) {
    try {
        const schoolId = req.user?.schoolId;
        const { classId } = req.params;
        if (!schoolId) {
            return res.status(401).json({
                success: false,
                error: 'User not authenticated',
            });
        }
        if (!classId) {
            return res.status(400).json({
                success: false,
                error: 'Class ID is required',
            });
        }
        // Fetch subjects for the class in the school
        const subjects = await prisma.subject.findMany({
            where: {
                classId,
                class: {
                    schoolId,
                },
            },
            select: {
                id: true,
                subjectName: true,
                subjectCode: true,
            },
            orderBy: {
                subjectName: 'asc',
            },
        });
        console.log(`📚 Fetching subjects for class ${classId}: Found ${subjects.length} subjects`);
        res.json({
            success: true,
            data: {
                subjects,
            },
        });
    }
    catch (error) {
        console.error('Get class subjects error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch subjects',
            message: error.message,
        });
    }
}
//# sourceMappingURL=results-setup.controller.js.map