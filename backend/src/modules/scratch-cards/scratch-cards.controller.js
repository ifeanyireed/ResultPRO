import { prisma } from '@config/database';
import crypto from 'crypto';
/**
 * Generate random PIN for scratch card
 */
function generateScratchCardPin() {
    // Generate 10-digit PIN
    return crypto.randomBytes(5).toString('hex').toUpperCase().slice(0, 10);
}
/**
 * Generate multiple scratch cards
 * POST /api/scratch-cards/generate
 */
export async function generateScratchCards(req, res) {
    try {
        const schoolId = req.user?.schoolId;
        const { quantity } = req.body;
        if (!schoolId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }
        if (!quantity || quantity < 1 || quantity > 100) {
            return res.status(400).json({ success: false, error: 'Quantity must be between 1 and 100' });
        }
        // Generate unique PINs
        const pinsSet = new Set();
        while (pinsSet.size < quantity) {
            pinsSet.add(generateScratchCardPin());
        }
        // Create scratch cards
        const newCards = await Promise.all(Array.from(pinsSet).map(pin => prisma.scratchCard.create({
            data: {
                schoolId,
                pin,
                usesRemaining: 3,
                usageCount: 0,
            },
        })));
        return res.json({
            success: true,
            message: `Generated ${quantity} scratch cards`,
            data: newCards.map(card => ({
                id: card.id,
                pin: card.pin,
                usesRemaining: card.usesRemaining,
                createdAt: card.createdAt,
            })),
        });
    }
    catch (error) {
        console.error('Error generating scratch cards:', error);
        return res.status(500).json({ success: false, error: 'Failed to generate scratch cards' });
    }
}
/**
 * Get all scratch cards for a school
 * GET /api/scratch-cards
 */
export async function getScratchCards(req, res) {
    try {
        const schoolId = req.user?.schoolId;
        if (!schoolId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }
        const cards = await prisma.scratchCard.findMany({
            where: { schoolId },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                pin: true,
                usesRemaining: true,
                usageCount: true,
                createdAt: true,
                lastUsedAt: true,
                deactivatedAt: true,
            },
        });
        const stats = {
            total: cards.length,
            active: cards.filter(c => c.usesRemaining > 0).length,
            inactive: cards.filter(c => c.usesRemaining === 0).length,
            totalUses: cards.reduce((sum, c) => sum + c.usageCount, 0),
        };
        return res.json({
            success: true,
            stats,
            data: cards,
        });
    }
    catch (error) {
        console.error('Error fetching scratch cards:', error);
        return res.status(500).json({ success: false, error: 'Failed to fetch scratch cards' });
    }
}
/**
 * Check scratch card and return student results
 * POST /api/scratch-cards/check-results
 */
export async function checkResultsWithScratchCard(req, res) {
    try {
        const { scratchCardPin, sessionId, termId, admissionNumber } = req.body;
        if (!scratchCardPin || !sessionId || !termId || !admissionNumber) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: scratchCardPin, sessionId, termId, admissionNumber',
            });
        }
        // Find the scratch card
        const card = await prisma.scratchCard.findUnique({
            where: { pin: scratchCardPin },
            include: { school: true },
        });
        if (!card) {
            return res.status(404).json({ success: false, error: 'Invalid scratch card PIN' });
        }
        // Check if card is expired
        if (card.usesRemaining <= 0) {
            return res.status(403).json({
                success: false,
                error: 'This scratch card has expired (no uses remaining)',
            });
        }
        // Find the student by admission number
        const student = await prisma.student.findFirst({
            where: {
                schoolId: card.schoolId,
                admissionNumber,
            },
            include: {
                class: true,
                school: true,
            },
        });
        if (!student) {
            return res.status(404).json({
                success: false,
                error: 'Student not found',
            });
        }
        // Get all subject results for the student in the specified session/term
        const results = await prisma.studentResult.findMany({
            where: {
                studentId: student.id,
                sessionId,
                termId,
            },
            include: {
                subject: true,
            },
            orderBy: { subject: { displayOrder: 'asc' } },
        });
        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'No results found for this student in the specified session/term',
            });
        }
        // Decrement card usage
        await prisma.scratchCard.update({
            where: { id: card.id },
            data: {
                usesRemaining: card.usesRemaining - 1,
                usageCount: card.usageCount + 1,
                lastUsedAt: new Date(),
                deactivatedAt: card.usesRemaining - 1 === 0 ? new Date() : null,
            },
        });
        // Transform results to frontend format
        const transformedResults = results.map(result => ({
            subject: result.subject.subjectName,
            examScores: JSON.parse(result.examScores),
            totalScore: result.totalScore,
            affectiveRatings: result.affectiveRatings ? JSON.parse(result.affectiveRatings) : {},
            psychomotorRatings: result.psychomotorRatings ? JSON.parse(result.psychomotorRatings) : {},
            principalComments: result.principalComments,
            tutorComments: result.tutorComments,
        }));
        return res.json({
            success: true,
            data: {
                student: {
                    id: student.id,
                    name: student.studentName,
                    admissionNumber: student.admissionNumber,
                    class: student.class.className,
                    sex: student.sex,
                    age: student.age,
                    height: student.height,
                    weight: student.weight,
                    dateOfBirth: student.dateOfBirth,
                    favouriteColor: student.favouriteColor,
                },
                school: {
                    name: card.school.name,
                    logo: card.school.logoUrl,
                    motto: card.school.motto,
                    primaryColor: card.school.primaryColor,
                    secondaryColor: card.school.secondaryColor,
                    accentColor: card.school.accentColor,
                },
                results: transformedResults,
                remainingUses: card.usesRemaining - 1,
            },
        });
    }
    catch (error) {
        console.error('Error checking results:', error);
        return res.status(500).json({ success: false, error: 'Failed to check results' });
    }
}
/**
 * Get scratch card statistics (admin)
 * GET /api/scratch-cards/stats
 */
export async function getScratchCardStats(req, res) {
    try {
        const schoolId = req.user?.schoolId;
        if (!schoolId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }
        const cards = await prisma.scratchCard.findMany({
            where: { schoolId },
        });
        const stats = {
            total: cards.length,
            active: cards.filter(c => c.usesRemaining > 0).length,
            inactive: cards.filter(c => c.usesRemaining === 0).length,
            totalUses: cards.reduce((sum, c) => sum + c.usageCount, 0),
            remainingCapacity: cards.reduce((sum, c) => sum + c.usesRemaining, 0),
            cardsCurrentlyInUse: cards.filter(c => c.usageCount > 0 && c.usageCount < 3).length,
        };
        return res.json({ success: true, stats });
    }
    catch (error) {
        console.error('Error fetching stats:', error);
        return res.status(500).json({ success: false, error: 'Failed to fetch statistics' });
    }
}
//# sourceMappingURL=scratch-cards.controller.js.map