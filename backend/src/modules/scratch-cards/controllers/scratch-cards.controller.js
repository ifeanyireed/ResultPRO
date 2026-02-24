import { prisma } from '@config/database';
/**
 * SCHOOL ADMIN ENDPOINTS - VIEW & TRACK ONLY
 * School admins can ONLY view assigned cards and track usage
 * Card generation is handled exclusively by SUPER_ADMIN
 */
// Verify and use a scratch card (PUBLIC ENDPOINT - no auth required)
// Accepts only PIN and looks up associated school/card
export async function verifyScratchCard(req, res) {
    try {
        const { pin } = req.body;
        if (!pin) {
            return res.status(400).json({
                success: false,
                error: 'PIN is required'
            });
        }
        // Find the scratch card by PIN
        const card = await prisma.scratchCard.findUnique({
            where: { pin },
            include: {
                school: {
                    select: { id: true, name: true }
                }
            }
        });
        if (!card) {
            return res.status(404).json({
                success: false,
                error: 'Invalid scratch card PIN'
            });
        }
        // Check if card has uses remaining
        if (card.usesRemaining <= 0) {
            return res.status(400).json({
                success: false,
                error: 'This scratch card has no uses remaining'
            });
        }
        // Decrement uses and update usage
        const updated = await prisma.scratchCard.update({
            where: { pin },
            data: {
                usesRemaining: card.usesRemaining - 1,
                usageCount: card.usageCount + 1,
                lastUsedAt: new Date(),
                deactivatedAt: card.usesRemaining - 1 === 0 ? new Date() : null,
            }
        });
        res.json({
            success: true,
            message: 'Scratch card verified successfully',
            data: {
                schoolId: card.schoolId,
                schoolName: card.school.name,
                pin: card.pin,
                usesRemaining: updated.usesRemaining,
                usageCount: updated.usageCount
            }
        });
    }
    catch (error) {
        console.error('Error verifying scratch card:', error);
        res.status(500).json({ success: false, error: 'Failed to verify scratch card' });
    }
}
// Get scratch card statistics for school admin
export async function getScratchCardStats(req, res) {
    try {
        const schoolId = req.user?.schoolId;
        if (!schoolId) {
            return res.status(401).json({ success: false, error: 'Not authenticated' });
        }
        const cards = await prisma.scratchCard.findMany({
            where: { schoolId },
            orderBy: { createdAt: 'desc' }
        });
        // Calculate statistics
        const stats = {
            total: cards.length,
            active: cards.filter(c => c.usesRemaining > 0).length,
            exhausted: cards.filter(c => c.usesRemaining === 0).length,
            totalUsages: cards.reduce((sum, c) => sum + c.usageCount, 0),
            totalUsesAvailable: cards.reduce((sum, c) => sum + 3, 0), // Each card has 3 uses
            generationRate: {
                today: cards.filter(c => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return c.createdAt >= today;
                }).length,
                thisWeek: cards.filter(c => {
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return c.createdAt >= weekAgo;
                }).length,
                thisMonth: cards.filter(c => {
                    const monthAgo = new Date();
                    monthAgo.setMonth(monthAgo.getMonth() - 1);
                    return c.createdAt >= monthAgo;
                }).length
            }
        };
        res.json({
            success: true,
            stats,
            cards: cards.map(c => ({
                id: c.id,
                pin: c.pin,
                usesRemaining: c.usesRemaining,
                usageCount: c.usageCount,
                createdAt: c.createdAt,
                lastUsedAt: c.lastUsedAt,
                isActive: c.usesRemaining > 0,
                isExhausted: c.usesRemaining === 0
            }))
        });
    }
    catch (error) {
        console.error('Error getting scratch card stats:', error);
        res.status(500).json({ success: false, error: 'Failed to get scratch card statistics' });
    }
}
// Download scratch cards as CSV
export async function downloadScratchCards(req, res) {
    try {
        const schoolId = req.user?.schoolId;
        if (!schoolId) {
            return res.status(401).json({ success: false, error: 'Not authenticated' });
        }
        const cards = await prisma.scratchCard.findMany({
            where: { schoolId, usesRemaining: 3, usageCount: 0 }, // Only unused cards
            orderBy: { createdAt: 'desc' }
        });
        if (cards.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'No unused scratch cards found'
            });
        }
        // Generate CSV
        const csv = 'PIN,Uses Remaining,Created At\n' +
            cards.map(c => `${c.pin},3,${c.createdAt.toISOString()}`).join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=scratch-cards.csv');
        res.send(csv);
    }
    catch (error) {
        console.error('Error downloading scratch cards:', error);
        res.status(500).json({ success: false, error: 'Failed to download scratch cards' });
    }
}
// Get comprehensive dashboard data for scratch cards
export async function getScratchCardDashboard(req, res) {
    try {
        const schoolId = req.user?.schoolId;
        if (!schoolId) {
            return res.status(401).json({ success: false, error: 'Not authenticated' });
        }
        const cards = await prisma.scratchCard.findMany({
            where: { schoolId },
            orderBy: { createdAt: 'desc' }
        });
        // Calculate comprehensive statistics
        const activeCards = cards.filter(c => c.usesRemaining > 0);
        const exhaustedCards = cards.filter(c => c.usesRemaining === 0);
        const partiallyUsedCards = cards.filter(c => c.usageCount > 0 && c.usageCount < 3);
        const neverUsedCards = cards.filter(c => c.usageCount === 0);
        const totalUsages = cards.reduce((sum, c) => sum + c.usageCount, 0);
        const totalCapacity = cards.length * 3; // Each card has 3 uses
        const stats = {
            overview: {
                totalCardsGenerated: cards.length,
                activeCardsCount: activeCards.length,
                exhaustedCardsCount: exhaustedCards.length,
                activePercentage: cards.length > 0 ? ((activeCards.length / cards.length) * 100).toFixed(2) + '%' : '0%',
            },
            usage: {
                totalUsagesSoFar: totalUsages,
                totalAvailableUses: totalCapacity,
                remainingUses: activeCards.reduce((sum, c) => sum + c.usesRemaining, 0),
                usagePercentage: totalCapacity > 0 ? ((totalUsages / totalCapacity) * 100).toFixed(2) + '%' : '0%',
            },
            distribution: {
                neverUsed: neverUsedCards.length,
                partiallyUsed: partiallyUsedCards.length,
                fullyExhausted: exhaustedCards.length,
            },
            recentActivity: {
                lastCardGenerated: cards.length > 0 ? cards[0].createdAt : null,
                recentlyUsedCount: cards.filter(c => {
                    const oneDayAgo = new Date();
                    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
                    return c.lastUsedAt && c.lastUsedAt >= oneDayAgo;
                }).length,
                mostRecentlyUsed: cards.find(c => c.lastUsedAt)?.lastUsedAt || null,
            },
            trend: {
                generatedToday: cards.filter(c => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return c.createdAt >= today;
                }).length,
                generatedThisWeek: cards.filter(c => {
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return c.createdAt >= weekAgo;
                }).length,
                generatedThisMonth: cards.filter(c => {
                    const monthAgo = new Date();
                    monthAgo.setMonth(monthAgo.getMonth() - 1);
                    return c.createdAt >= monthAgo;
                }).length,
            },
            topCards: {
                mostUsed: cards.sort((a, b) => b.usageCount - a.usageCount).slice(0, 5).map(c => ({
                    pin: c.pin,
                    usageCount: c.usageCount,
                    usesRemaining: c.usesRemaining,
                    lastUsedAt: c.lastUsedAt,
                })),
            },
        };
        res.json({
            success: true,
            data: stats,
            allCards: cards.map(c => ({
                id: c.id,
                pin: c.pin,
                usesRemaining: c.usesRemaining,
                usageCount: c.usageCount,
                createdAt: c.createdAt,
                lastUsedAt: c.lastUsedAt,
                deactivatedAt: c.deactivatedAt,
                status: c.usesRemaining > 0 ? 'ACTIVE' : 'EXHAUSTED',
            })),
        });
    }
    catch (error) {
        console.error('Error getting dashboard:', error);
        res.status(500).json({ success: false, error: 'Failed to get dashboard data' });
    }
}
//# sourceMappingURL=scratch-cards.controller.js.map