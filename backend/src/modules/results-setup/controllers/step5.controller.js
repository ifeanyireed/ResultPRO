import { prisma } from '@config/database';
export async function handleStep5(req, res) {
    try {
        const schoolId = req.user?.schoolId;
        const { classTeachers, principalName, principalSignatureUrl, sessionId, termId } = req.body;
        console.log('📥 Step 5 received from frontend:', {
            classTeachers,
            principalName,
            principalSignatureUrl,
            hasFormTutorUrls: classTeachers?.some((ct) => ct.formTutorSignatureUrl),
        });
        // Validate that user is authenticated
        if (!schoolId) {
            return res.status(401).json({
                success: false,
                error: 'User not authenticated',
            });
        }
        // Validate class teachers
        if (!Array.isArray(classTeachers) || classTeachers.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'At least one class teacher is required',
            });
        }
        // Validate principal name
        if (!principalName || principalName.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'Principal name is required',
            });
        }
        // Validate each class teacher
        for (const teacher of classTeachers) {
            if (!teacher.formTutorName || teacher.formTutorName.trim() === '') {
                return res.status(400).json({
                    success: false,
                    error: `Form tutor name is required for ${teacher.className}`,
                });
            }
        }
        // Save to ResultsSetupSession
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
        const step5Payload = { classTeachers, principalName, principalSignatureUrl };
        console.log('💾 Saving to database:', JSON.stringify(step5Payload).substring(0, 200) + '...');
        await prisma.resultsSetupSession.update({
            where: {
                id: resultsSetupSession.id,
            },
            data: {
                principalName: principalName || 'Principal',
                principalSignatureUrl: principalSignatureUrl,
                staffData: JSON.stringify(classTeachers || []),
                currentStep: 5,
                completedSteps: JSON.stringify([1, 2, 3, 4, 5]),
            },
        });
        console.log('✅ Step 5 saved to database');
        res.json({
            success: true,
            message: 'Staff configuration saved successfully',
            data: {
                classTeachers,
                principalName,
                principalSignatureUrl,
            },
        });
    }
    catch (error) {
        console.error('❌ Step 5 error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to configure staff',
            message: error.message,
        });
    }
}
//# sourceMappingURL=step5.controller.js.map