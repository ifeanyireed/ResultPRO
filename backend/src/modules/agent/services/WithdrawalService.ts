import { prisma } from '@config/database';

interface WithdrawalRequest {
  agentId: string;
  amount: number;
  bankAccountName?: string;
  bankCode?: string;
  paypalEmail?: string;
  walletAddress?: string;
  cryptoCurrency?: string;
}

export class WithdrawalService {
  // Create withdrawal request
  async requestWithdrawal(input: WithdrawalRequest) {
    // Validate amount
    if (input.amount <= 0) throw new Error('Amount must be positive');

    const agent = await prisma.agent.findUnique({
      where: { id: input.agentId },
    });

    if (!agent) throw new Error('Agent not found');
    if (agent.pendingCommission < input.amount) {
      throw new Error('Insufficient funds');
    }

    // Determine payment method
    let paymentMethod = 'BANK_TRANSFER';
    if (input.paypalEmail) paymentMethod = 'PAYPAL';
    if (input.walletAddress) paymentMethod = 'CRYPTOCURRENCY';

    const withdrawal = await prisma.rewardWithdrawal.create({
      data: {
        agentId: input.agentId,
        amount: input.amount,
        paymentMethod,
        status: 'PENDING',
        bankAccountName: input.bankAccountName,
        bankCode: input.bankCode,
        walletAddress: input.walletAddress,
      },
      include: {
        agent: {
          include: { user: true },
        },
      },
    });

    // Deduct from pending commission
    await prisma.agent.update({
      where: { id: input.agentId },
      data: {
        pendingCommission: {
          decrement: input.amount,
        },
      },
    });

    return withdrawal;
  }

  // Get agent withdrawals
  async getAgentWithdrawals(agentId: string, skip: number = 0, take: number = 20) {
    const [withdrawals, total] = await Promise.all([
      prisma.rewardWithdrawal.findMany({
        where: { agentId },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.rewardWithdrawal.count({ where: { agentId } }),
    ]);

    return {
      withdrawals,
      total,
      page: Math.floor(skip / take) + 1,
      pages: Math.ceil(total / take),
    };
  }

  // Approve withdrawal
  async approveWithdrawal(withdrawalId: string, approvedBy: string) {
    const withdrawal = await prisma.rewardWithdrawal.findUnique({
      where: { id: withdrawalId },
    });

    if (!withdrawal) throw new Error('Withdrawal not found');

    return prisma.rewardWithdrawal.update({
      where: { id: withdrawalId },
      data: {
        status: 'APPROVED',
        approvedAt: new Date(),
        approvedBy,
      },
      include: {
        agent: {
          include: { user: true },
        },
      },
    });
  }

  // Mark withdrawal as paid
  async markAsPaid(withdrawalId: string, txHash?: string) {
    return prisma.rewardWithdrawal.update({
      where: { id: withdrawalId },
      data: {
        status: 'PAID',
        paidAt: new Date(),
        txHash,
      },
      include: {
        agent: {
          include: { user: true },
        },
      },
    });
  }

  // Reject withdrawal
  async rejectWithdrawal(withdrawalId: string, reason: string) {
    const withdrawal = await prisma.rewardWithdrawal.findUnique({
      where: { id: withdrawalId },
      include: { agent: true },
    });

    if (!withdrawal) throw new Error('Withdrawal not found');

    // Refund to pending commission
    if (withdrawal.agent) {
      await prisma.agent.update({
        where: { id: withdrawal.agent.id },
        data: {
          pendingCommission: {
            increment: withdrawal.amount,
          },
        },
      });
    }

    return prisma.rewardWithdrawal.update({
      where: { id: withdrawalId },
      data: {
        status: 'REJECTED',
        rejectionReason: reason,
      },
      include: {
        agent: {
          include: { user: true },
        },
      },
    });
  }

  // Get withdrawal stats
  async getWithdrawalStats(agentId: string) {
    const [total, pending, approved, paid, rejected] = await Promise.all([
      prisma.rewardWithdrawal.count({
        where: { agentId },
      }),
      prisma.rewardWithdrawal.count({
        where: { agentId, status: 'PENDING' },
      }),
      prisma.rewardWithdrawal.count({
        where: { agentId, status: 'APPROVED' },
      }),
      prisma.rewardWithdrawal.count({
        where: { agentId, status: 'PAID' },
      }),
      prisma.rewardWithdrawal.count({
        where: { agentId, status: 'REJECTED' },
      }),
    ]);

    const totalAmount = await prisma.rewardWithdrawal.aggregate({
      where: { agentId, status: 'PAID' },
      _sum: { amount: true },
    });

    return {
      totalWithdrawals: total,
      pending,
      approved,
      paid,
      rejected,
      totalWithdrawn: totalAmount._sum.amount || 0,
    };
  }

  // Get all pending withdrawals (admin)
  async getPendingWithdrawals(skip: number = 0, take: number = 20) {
    const [withdrawals, total] = await Promise.all([
      prisma.rewardWithdrawal.findMany({
        where: { status: 'PENDING' },
        include: {
          agent: {
            include: { user: true },
          },
        },
        orderBy: { createdAt: 'asc' },
        skip,
        take,
      }),
      prisma.rewardWithdrawal.count({ where: { status: 'PENDING' } }),
    ]);

    return {
      withdrawals,
      total,
      page: Math.floor(skip / take) + 1,
      pages: Math.ceil(total / take),
    };
  }

  // Cancel withdrawal (admin only)
  async cancelWithdrawal(withdrawalId: string) {
    const withdrawal = await prisma.rewardWithdrawal.findUnique({
      where: { id: withdrawalId },
      include: { agent: true },
    });

    if (!withdrawal) throw new Error('Withdrawal not found');

    if (withdrawal.status !== 'PENDING') {
      throw new Error('Can only cancel pending withdrawals');
    }

    // Refund to pending commission
    if (withdrawal.agent) {
      await prisma.agent.update({
        where: { id: withdrawal.agent.id },
        data: {
          pendingCommission: {
            increment: withdrawal.amount,
          },
        },
      });
    }

    return prisma.rewardWithdrawal.update({
      where: { id: withdrawalId },
      data: {
        status: 'CANCELLED',
      },
    });
  }

  // Get minimum withdrawal amount
  getMinimumWithdrawalAmount(): number {
    return 100; // $100 minimum
  }
}

export const withdrawalService = new WithdrawalService();
