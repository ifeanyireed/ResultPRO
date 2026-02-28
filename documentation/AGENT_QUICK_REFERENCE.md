# Agent Accounts System - Quick Reference Guide

## 📍 File Locations

### Backend Services
- **AgentService**: `backend/src/modules/agent/services/AgentService.ts`
- **ReferralService**: `backend/src/modules/agent/services/ReferralService.ts`
- **RewardService**: `backend/src/modules/agent/services/RewardService.ts`
- **WithdrawalService**: `backend/src/modules/agent/services/WithdrawalService.ts`

### Backend Controller & Routes
- **Controller**: `backend/src/modules/agent/controllers/AgentController.ts`
- **Routes**: `backend/src/modules/agent/routes/index.ts`

### Database Schema
- **Prisma Models**: `backend/prisma/schema.prisma` (lines 320-490)
  - Agent, AgentSchoolAssignment, Referral, AgentReward, AgentBadge, RewardWithdrawal

### Frontend Hooks
- **useAgentAnalytics**: `src/hooks/useAgentAnalytics.ts` (6 custom hooks)

### Frontend Pages
- **Dashboard**: `src/pages/agent/Dashboard.tsx`
- **Profile**: `src/pages/agent/Profile.tsx`
- **SchoolsManaged**: `src/pages/agent/SchoolsManaged.tsx`
- **Referrals**: `src/pages/agent/Referrals.tsx`
- **Rewards**: `src/pages/agent/Rewards.tsx`
- **Withdrawals**: `src/pages/agent/Withdrawals.tsx`
- **SubscriptionPlans**: `src/pages/agent/SubscriptionPlans.tsx`

---

## 🔌 API Endpoints

### Public
- `GET /api/agent/subscription-pricing` - Get subscription plans

### Agent Authentication (Protected)
- `POST /api/agent/create` - Create agent account
- `GET /api/agent/profile/me` - Get my profile
- `GET /api/agent/profile/:agentId` - Get agent profile
- `PATCH /api/agent/profile/:agentId` - Update profile
- `POST /api/agent/subscription/:agentId/upgrade` - Upgrade subscription tier

### Referrals
- `GET /api/agent/:agentId/referrals` - List referrals (paginated)
- `GET /api/agent/:agentId/referrals/stats` - Referral statistics

### Rewards & Gamification
- `GET /api/agent/:agentId/rewards` - Get rewards summary
- `GET /api/agent/leaderboard` - Get top agents leaderboard

### Withdrawals
- `POST /api/agent/:agentId/withdrawals/request` - Request withdrawal
- `GET /api/agent/:agentId/withdrawals` - Withdrawal history
- `GET /api/agent/:agentId/withdrawals/stats` - Withdrawal statistics

### Dashboard
- `GET /api/agent/:agentId/dashboard` - Full dashboard with all stats

### Admin Only
- `GET /api/agent/` - List all agents (paginated)
- `POST /api/agent/:agentId/verify` - Verify agent identity
- `POST /api/agent/withdrawals/:withdrawalId/approve` - Approve withdrawal

---

## 🗄️ Database Relationships

```
User (1) ──→ Agent (1)
             ├─ (1) ──→ (many) AgentSchoolAssignment
             ├─ (1) ──→ (many) Referral
             ├─ (1) ──→ (many) AgentReward
             ├─ (1) ──→ (many) AgentBadge
             └─ (1) ──→ (many) RewardWithdrawal

AgentSchoolAssignment (many) ──→ School (many)

Referral ──→ Agent (many-to-1)
Referral ──→ School (many-to-1)

AgentReward ──→ Agent (many-to-1)
AgentBadge ──→ Agent (many-to-1)
RewardWithdrawal ──→ Agent (many-to-1)
```

---

## 💡 Integration Example (React Component)

```typescript
import { useAgentDashboard } from '@/hooks/useAgentAnalytics';

export const MyDashboard = () => {
  const { data, loading, fetchDashboard } = useAgentDashboard('agent-id-123');

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return (
    <div>
      {loading && <p>Loading...</p>}
      {data && (
        <div>
          <h1>{data.agent.specialization}</h1>
          <p>Earned: ${data.agent.totalCommissionEarned}</p>
          <p>Points: {data.rewards.pointsBalance}</p>
          <p>Referrals: {data.referralStats.totalReferrals}</p>
        </div>
      )}
    </div>
  );
};
```

---

## 🎯 Common Tasks

### Create New Agent Account
```typescript
POST /api/agent/create
Body: {
  "specialization": "Technical Lead",
  "bio": "Experienced tech specialist",
  "credentials": { /* optional JSON */ }
}
```

### Upgrade Agent Plan
```typescript
POST /api/agent/subscription/agent-123/upgrade
Body: {
  "subscriptionTier": "Pro"  // or "Premium"
}
```

### Request Commission Withdrawal
```typescript
POST /api/agent/agent-123/withdrawals/request
Body: {
  "amount": 500,
  "paymentMethod": "BANK_TRANSFER",
  "bankAccountName": "Jane Doe",
  "bankCode": "SWIFTCODE"
}
```

### Get Agent Dashboard
```typescript
GET /api/agent/agent-123/dashboard

Response: {
  agent: { ...profile },
  referralStats: { totalReferrals, pendingReferrals, approvedReferrals, totalClicks, totalCommissionPaid },
  rewards: { pointsBalance, lifetimePoints, leaderboardRank, badges },
  withdrawalStats: { totalWithdrawals, pending, approved, paid, totalWithdrawn }
}
```

---

## 📱 Frontend Component Usage

### Import Dashboard Page
```typescript
import { Dashboard } from '@/pages/agent';

// Use in Router
<Route path="/agent/dashboard" element={<Dashboard />} />
```

### Import All Agent Pages
```typescript
import { Dashboard, Profile, Referrals, Rewards, Withdrawals, SubscriptionPlans, SchoolsManaged } from '@/pages/agent';
```

---

## 🔍 Subscription Tiers

### Free
- Cost: $0/month
- Commission: 15%
- Max Schools: 3
- Features: Basic referral tracking

### Pro
- Cost: $29.99/month
- Commission: 20%
- Max Schools: 15
- Features: Advanced referral, gamification, analytics

### Premium
- Cost: $99.99/month
- Commission: 25%
- Max Schools: 100
- Features: All Pro + API access, white-label, dedicated support

---

## 🏅 Badge Types

| Badge | Trigger | Icon | Description |
|-------|---------|------|-------------|
| FIRST_SCHOOL | Assign 1st school | ⭐ | School Starter |
| FIVE_SCHOOLS | Manage 5 schools | 🏢 | School Builder |
| TEN_SCHOOLS | Manage 10 schools | 🎖️ | School Expert |
| REFERRAL_MASTER | 10 successful referrals | 👥 | Referral Master |
| TOP_PERFORMER | Top 10 leaderboard | 🏆 | Top Performer |
| POWER_AGENT | 1000+ points | ⚡ | Power Agent |
| PREMIUM_SUBSCRIBER | Premium plan | 👑 | Premium Agent |

---

## ⚙️ System Configuration

### Minimum Withdrawal
- Amount: $100 USD

### Points Earning
- School signup: 50 points
- Referral complete: 100 points
- Referral approved: 150 points
- Monthly goal hit: 300 points

### Commission Rates
- Free tier: 15% (per school)
- Pro tier: 20% (per school)
- Premium tier: 25% (per school)

---

## 🚀 Testing Checklist

- [ ] Create new agent account
- [ ] Update agent profile
- [ ] View referral dashboard
- [ ] Request commission withdrawal
- [ ] Approve withdrawal (admin)
- [ ] Upgrade subscription plan
- [ ] Check leaderboard
- [ ] View earned badges
- [ ] Verify verification workflow
- [ ] Test pagination on lists

---

## 📞 Support

For issues or questions:
1. Check `AGENT_ACCOUNTS_IMPLEMENTATION.md` for detailed docs
2. Review actual API responses in network tab
3. Check browser console for errors
4. Verify agent ID is being passed correctly
5. Ensure authentication token is included

---

**Last Updated**: 2024
**Status**: ✅ Production Ready
