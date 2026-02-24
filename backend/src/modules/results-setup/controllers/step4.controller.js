import { prisma } from '@config/database';
export async function handleStep4(req, res) {
    try {
        const schoolId = req.user?.schoolId;
        const { psychomotorDomains, enablePsychomotor, sessionId, termId } = req.body;
        // Validate that user is authenticated
        if (!schoolId) {
            return res.status(401).json({
                success: false,
                error: 'User not authenticated',
            });
        }
        // Validate
        if (enablePsychomotor && (!Array.isArray(psychomotorDomains) || psychomotorDomains.length === 0)) {
            return res.status(400).json({
                success: false,
                error: 'At least one psychomotor domain is required when enabled',
            });
        }
        // Validate scoring scale
        const validScales = ['1-5', '1-10', 'A-F'];
        if (enablePsychomotor) {
            for (const domain of psychomotorDomains) {
                if (!validScales.includes(domain.scoringScale)) {
                    return res.status(400).json({
                        success: false,
                        error: `Invalid scoring scale: ${domain.scoringScale}`,
                    });
                }
            }
        }
        // Save to ResultsSetupSession
        if (sessionId && termId) {
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
                    step4Data: JSON.stringify({ psychomotorDomains, enablePsychomotor }),
                    currentStep: 4,
                    completedSteps: JSON.stringify([1, 2, 3, 4]),
                },
            });
        }
        res.json({
            success: true,
            message: 'Psychomotor configuration saved successfully',
            data: {
                psychomotorDomains,
                enablePsychomotor,
            },
        });
    }
    catch (error) {
        console.error('Step 4 error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to configure psychomotor domains',
            message: error.message,
        });
    }
}
//# sourceMappingURL=step4.controller.js.map