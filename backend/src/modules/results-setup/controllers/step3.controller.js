import { prisma } from '@config/database';
export async function handleStep3(req, res) {
    try {
        const schoolId = req.user?.schoolId;
        const { affectiveDomains, enableAffective, sessionId, termId } = req.body;
        // Validate that user is authenticated
        if (!schoolId) {
            return res.status(401).json({
                success: false,
                error: 'User not authenticated',
            });
        }
        // Validate
        if (enableAffective && (!Array.isArray(affectiveDomains) || affectiveDomains.length === 0)) {
            return res.status(400).json({
                success: false,
                error: 'At least one affective domain is required when enabled',
            });
        }
        // Save to ResultsSetupSession
        if (sessionId && termId) {
            const resultsSetupSession = await prisma.resultsSetupSession.findUnique({
                where: {
                    schoolId,
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
                    affectiveTraits: JSON.stringify(affectiveDomains || []),
                    currentStep: 3,
                    completedSteps: JSON.stringify([1, 2, 3]),
                },
            });
        }
        res.json({
            success: true,
            message: 'Affective configuration saved successfully',
            data: {
                affectiveDomains,
                enableAffective,
            },
        });
    }
    catch (error) {
        console.error('Step 3 error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to configure affective domains',
            message: error.message,
        });
    }
}
//# sourceMappingURL=step3.controller.js.map