import { prisma } from '@config/database';
export async function handleStep1(req, res) {
    try {
        const userId = req.user?.id;
        const schoolId = req.user?.schoolId;
        const { sessionId, termId, startDate, endDate, sessionName, termName } = req.body;
        // Validate that user is authenticated
        if (!schoolId || !userId) {
            return res.status(401).json({
                success: false,
                error: 'User not authenticated',
            });
        }
        // Validate required fields
        if (!sessionId || !termId || !startDate || !endDate) {
            return res.status(400).json({
                success: false,
                error: 'Session ID, Term ID, Start Date, and End Date are required',
            });
        }
        // Verify session belongs to school
        const session = await prisma.academicSession.findFirst({
            where: {
                id: sessionId,
                schoolId,
            },
        });
        if (!session) {
            return res.status(404).json({
                success: false,
                error: 'Academic session not found',
            });
        }
        // Verify term exists and belongs to the session
        const term = await prisma.term.findFirst({
            where: {
                id: termId,
                academicSessionId: sessionId,
            },
        });
        if (!term) {
            return res.status(404).json({
                success: false,
                error: 'Academic term not found',
            });
        }
        if (term.termNumber < 1 || term.termNumber > 3) {
            return res.status(400).json({
                success: false,
                error: 'Invalid term. Must be Term 1, 2, or 3',
            });
        }
        // Validate dates
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (start >= end) {
            return res.status(400).json({
                success: false,
                error: 'Start date must be before end date',
            });
        }
        const step1Data = {
            sessionId,
            sessionName,
            termId,
            termName,
            startDate,
            endDate,
        };
        // Find existing session or create new one
        let resultsSetupSession = await prisma.resultsSetupSession.findUnique({
            where: {
                schoolId,
            },
        });
        if (resultsSetupSession) {
            // Update existing session
            resultsSetupSession = await prisma.resultsSetupSession.update({
                where: {
                    id: resultsSetupSession.id,
                },
                data: {
                    sessionId,
                    sessionName,
                    termId,
                    termName,
                    currentStep: 1,
                    completedSteps: JSON.stringify([1]),
                },
            });
        }
        else {
            // Create new session
            resultsSetupSession = await prisma.resultsSetupSession.create({
                data: {
                    schoolId,
                    sessionId,
                    sessionName,
                    termId,
                    termName,
                    currentStep: 1,
                    completedSteps: JSON.stringify([1]),
                },
            });
        }
        res.json({
            success: true,
            message: 'Session and term configured successfully',
            data: {
                sessionId,
                sessionName,
                termId,
                termName,
                startDate,
                endDate,
            },
        });
    }
    catch (error) {
        console.error('Step 1 error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to configure session',
            message: error.message,
        });
    }
}
//# sourceMappingURL=step1.controller.js.map