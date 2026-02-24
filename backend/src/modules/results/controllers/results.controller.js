import { prisma } from '@config/database';
/**
 * Get a student's results by admission number and PIN
 * This endpoint is called after scratch card verification
 */
export async function getStudentResults(req, res) {
    try {
        const { schoolId, admissionNumber, studentPin, sessionId, termId } = req.body;
        if (!schoolId || !admissionNumber || !studentPin) {
            return res.status(400).json({
                success: false,
                error: 'School ID, admission number, and student PIN are required'
            });
        }
        // Find student
        const student = await prisma.student.findFirst({
            where: {
                schoolId,
                admissionNumber,
                // Add PIN verification if students have PINs stored
            },
            include: {
                results: {
                    where: sessionId && termId ? {
                        sessionId,
                        termId
                    } : undefined
                }
            }
        });
        if (!student) {
            return res.status(404).json({
                success: false,
                error: 'Student not found'
            });
        }
        // Get student results
        if (student.results.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'No results found for this student'
            });
        }
        res.json({
            success: true,
            data: {
                studentName: student.firstName + ' ' + student.lastName,
                admissionNumber: student.admissionNumber,
                results: student.results
            }
        });
    }
    catch (error) {
        console.error('Error fetching student results:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch student results' });
    }
}
/**
 * Get available sessions and terms for a school
 */
export async function getSessionsAndTerms(req, res) {
    try {
        const { schoolId } = req.query;
        if (!schoolId) {
            return res.status(400).json({
                success: false,
                error: 'School ID is required'
            });
        }
        const sessions = await prisma.academicSession.findMany({
            where: { schoolId: schoolId },
            select: { id: true, sessionName: true }
        });
        // Get terms from first session or all terms
        const terms = await prisma.term.findMany({
            select: { id: true, name: true }
        });
        res.json({
            success: true,
            sessions,
            terms
        });
    }
    catch (error) {
        console.error('Error fetching sessions and terms:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch sessions and terms' });
    }
}
//# sourceMappingURL=results.controller.js.map