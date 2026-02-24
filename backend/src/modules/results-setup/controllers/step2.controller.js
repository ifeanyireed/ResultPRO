import { prisma } from '@config/database';
export async function handleStep2(req, res) {
    try {
        const schoolId = req.user?.schoolId;
        const { classes, sessionId, termId } = req.body;
        // Validate that user is authenticated
        if (!schoolId) {
            return res.status(401).json({
                success: false,
                error: 'User not authenticated',
            });
        }
        // Validate classes array
        if (!Array.isArray(classes) || classes.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'At least one class exam configuration is required',
            });
        }
        // Validate required session/term info (for updating session)
        if (!sessionId || !termId) {
            return res.status(400).json({
                success: false,
                error: 'Session ID and Term ID are required',
            });
        }
        // Validate each class configuration
        for (const classConfig of classes) {
            if (!classConfig.classId) {
                return res.status(400).json({
                    success: false,
                    error: 'Class ID is required for each class configuration',
                });
            }
            // Verify class belongs to school
            const schoolClass = await prisma.class.findFirst({
                where: {
                    id: classConfig.classId,
                    schoolId,
                },
            });
            if (!schoolClass) {
                return res.status(404).json({
                    success: false,
                    error: `Class ${classConfig.classId} not found for this school`,
                });
            }
            // Validate exams array for this class
            if (!Array.isArray(classConfig.exams) || classConfig.exams.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: `At least one exam is required for class ${classConfig.className}`,
                });
            }
            // Validate totalWeightage
            if (classConfig.totalWeightage !== 100) {
                return res.status(400).json({
                    success: false,
                    error: `Exam weights for ${classConfig.className} must sum to 100% (currently ${classConfig.totalWeightage}%)`,
                });
            }
            // Validate each exam
            for (const exam of classConfig.exams) {
                if (!exam.name || exam.name.trim() === '') {
                    return res.status(400).json({
                        success: false,
                        error: `All exams for ${classConfig.className} must have a name`,
                    });
                }
                if (exam.weight < 0 || exam.weight > 100) {
                    return res.status(400).json({
                        success: false,
                        error: `Exam weight for ${classConfig.className} must be between 0 and 100 (${exam.name}: ${exam.weight})`,
                    });
                }
                if (!exam.totalScore || exam.totalScore < 1) {
                    return res.status(400).json({
                        success: false,
                        error: `Each exam for ${classConfig.className} must have a total score of at least 1 (${exam.name})`,
                    });
                }
            }
        }
        // Find and update existing ResultsSetupSession
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
            return res.status(404).json({
                success: false,
                error: 'Results setup session not found. Please complete Step 1 first.',
            });
        }
        await prisma.resultsSetupSession.update({
            where: {
                id: resultsSetupSession.id,
            },
            data: {
                step2Data: JSON.stringify({ classes }),
                currentStep: 2,
                completedSteps: JSON.stringify([1, 2]),
            },
        });
        res.json({
            success: true,
            message: 'Exam configurations saved successfully for all classes',
            data: {
                classes,
            },
        });
    }
    catch (error) {
        console.error('Step 2 error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to configure exams',
            message: error.message,
        });
    }
}
//# sourceMappingURL=step2.controller.js.map