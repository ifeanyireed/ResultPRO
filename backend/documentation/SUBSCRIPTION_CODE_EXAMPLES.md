# 💻 Code Examples - Using the Subscription APIs

## Frontend Usage Examples

### React Component - Get Subscription Data
```tsx
import { useEffect, useState } from 'react';
import axios from 'axios';

const MyBillingComponent = () => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get(
          'http://localhost:5000/api/payment/subscription/active',
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSubscription(response.data.data);
      } catch (error) {
        console.error('Failed to fetch subscription:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, []);

  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      {subscription ? (
        <>
          <h2>{subscription.planName} Plan</h2>
          <p>Expires: {new Date(subscription.endDate).toLocaleDateString()}</p>
          <p>Days Remaining: {subscription.daysRemaining}</p>
        </>
      ) : (
        <p>No active subscription</p>
      )}
    </div>
  );
};
```

### React Component - Check Usage Limits
```tsx
const UsageDashboard = () => {
  const [usage, setUsage] = useState(null);

  useEffect(() => {
    const fetchUsage = async () => {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(
        'http://localhost:5000/api/payment/subscription/usage',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsage(response.data.data);
    };
    fetchUsage();
  }, []);

  return (
    <div>
      <h3>Students: {usage?.students.used}/{usage?.students.limit}</h3>
      <div className="progress-bar">
        <div style={{ width: `${usage?.students.percentage}%` }} />
      </div>
      {usage?.students.isAtLimit && (
        <p>⚠️ You've reached your student limit!</p>
      )}
    </div>
  );
};
```

### React Component - Cancel Subscription
```tsx
const CancelSubscription = () => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post(
        'http://localhost:5000/api/payment/subscription/cancel',
        { reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        toast.success('Subscription cancelled successfully');
        // Refresh subscription data
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to cancel');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Tell us why you're cancelling (optional)"
      />
      <button onClick={handleCancel} disabled={loading}>
        {loading ? 'Cancelling...' : 'Cancel Subscription'}
      </button>
    </div>
  );
};
```

### React Component - View Invoice History
```tsx
const InvoiceHistory = () => {
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    const fetchInvoices = async () => {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(
        'http://localhost:5000/api/payment/subscription/billing-history?limit=12',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setInvoices(response.data.data);
    };
    fetchInvoices();
  }, []);

  return (
    <table>
      <thead>
        <tr>
          <th>Invoice #</th>
          <th>Plan</th>
          <th>Amount</th>
          <th>Status</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        {invoices.map(inv => (
          <tr key={inv.id}>
            <td>{inv.invoiceNumber}</td>
            <td>{inv.planName}</td>
            <td>₦{inv.totalAmount.toLocaleString()}</td>
            <td>{inv.status}</td>
            <td>{new Date(inv.createdAt).toLocaleDateString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
```

### Upgrade Plan Flow
```tsx
const UpgradePlan = ({ newPlanId }) => {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post(
        'http://localhost:5000/api/payment/subscription/upgrade',
        { newPlanId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.requiresPayment) {
        // Redirect to payment with price difference
        const priceDifference = response.data.priceDifference;
        toast.info(`Your new plan costs ₦${priceDifference} more`);
        // Trigger payment flow
      } else {
        // Downgrade applied immediately
        toast.success('Plan downgraded successfully');
      }
    } catch (error) {
      toast.error('Failed to upgrade plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleUpgrade} disabled={loading}>
      {loading ? 'Processing...' : 'Upgrade Now'}
    </button>
  );
};
```

---

## Backend Usage Examples (TypeScript)

### Use Subscription Service Directly
```typescript
import { subscriptionService } from '@modules/payment/services/subscription.service';

// Get active subscription
const result = await subscriptionService.getActiveSubscription(schoolId);
if (result.success) {
  console.log(result.subscription);
}

// Check plan limits
const limits = await subscriptionService.checkPlanLimits(schoolId);
console.log(`Students: ${limits.usage.students.used}/${limits.usage.students.limit}`);

// Create invoice
const invoice = await subscriptionService.createInvoice(paymentId, paymentData, planData);
console.log(`Invoice created: ${invoice.invoiceNumber}`);

// Cancel subscription
const cancelResult = await subscriptionService.cancelSubscription(schoolId, 'Too expensive');
```

### Extend Payment Service with Auto-Renewal
```typescript
// In payment.service.ts, add this method:

async setupAutoRenewal(schoolId: string, planId: string) {
  // Get subscription
  const subscription = await prisma.subscription.findUnique({
    where: {
      schoolId_planId: { schoolId, planId }
    },
    include: { plan: true }
  });

  // Check if expiring soon (7 days)
  const daysUntilExpiry = Math.ceil(
    (subscription.endDate.getTime() - new Date().getTime()) / (24 * 60 * 60 * 1000)
  );

  if (daysUntilExpiry <= 7) {
    // Send email reminder
    await emailService.sendSubscriptionExpiringEmail(
      schoolId,
      daysUntilExpiry,
      subscription.plan.name
    );

    // If autoRenew is enabled
    if (subscription.isAutoRenew) {
      // Initiate payment for renewal
      return {
        requiresRenewal: true,
        planId,
        amount: subscription.plan.priceNGN,
        daysRemaining: daysUntilExpiry
      };
    }
  }

  return { requiresRenewal: false };
}
```

### Create a Scheduled Task for Expiry Checking
```typescript
// Create: backend/src/tasks/check-subscription-expiry.ts

import { scheduleJob } from 'node-schedule';
import { subscriptionService } from '@modules/payment/services/subscription.service';

export function scheduleSubscriptionExpiryCheck() {
  // Run daily at 2 AM
  scheduleJob('0 2 * * *', async () => {
    console.log('🔍 Checking for expired subscriptions...');
    
    try {
      const result = await subscriptionService.checkAndHandleExpiredSubscriptions();
      console.log(`✅ Processed ${result.expiredCount} expired subscriptions`);
    } catch (error) {
      console.error('❌ Error checking subscriptions:', error);
    }
  });
}

// Use in server.ts:
import { scheduleSubscriptionExpiryCheck } from './tasks/check-subscription-expiry';

// After server setup
scheduleSubscriptionExpiryCheck();
```

### Admin Usage Examples
```typescript
// Get all active subscriptions
router.get('/admin/subscriptions', AdminSubscriptionController.getAllSubscriptions);

// Fetch with filters
GET /api/admin/payment/subscriptions?status=ACTIVE&limit=50&offset=0

// Response structure
{
  success: true,
  data: [
    {
      id: "sub_xxx",
      schoolId: "school_xxx",
      schoolName: "Example School",
      planName: "Pro",
      status: "ACTIVE",
      startDate: "2026-01-15T00:00:00Z",
      endDate: "2027-01-15T00:00:00Z",
      isAutoRenew: true,
      createdAt: "2026-01-15T00:00:00Z"
    }
  ],
  pagination: {
    total: 150,
    limit: 50,
    offset: 0
  }
}

// Cancel subscription from admin
curl -X POST \
  -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/admin/payment/subscriptions/{id}/cancel \
  -H "Content-Type: application/json" \
  -d '{"reason": "Admin override"}'

// Get statistics
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/admin/payment/subscriptions/stats

// Response: subscription counts and total revenue
{
  success: true,
  data: {
    activeSubscriptions: 87,
    expiredSubscriptions: 12,
    cancelledSubscriptions: 5,
    totalRevenue: 4520000,
    subscriptionsByPlan: [
      { planId: "plan_pro", _count: { id: 75 } },
      { planId: "plan_enterprise", _count: { id: 12 } }
    ]
  }
}
```

---

## Testing with cURL

### Get Active Subscription
```bash
curl -X GET \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:5000/api/payment/subscription/active
```

### Get Billing History
```bash
curl -X GET \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:5000/api/payment/subscription/billing-history?limit=10"
```

### Check Usage
```bash
curl -X GET \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:5000/api/payment/subscription/usage
```

### Cancel Subscription
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reason": "Too expensive"}' \
  http://localhost:5000/api/payment/subscription/cancel
```

### Admin: List All Subscriptions
```bash
curl -X GET \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  "http://localhost:5000/api/admin/payment/subscriptions?status=ACTIVE&limit=20"
```

### Admin: Get Stats
```bash
curl -X GET \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  http://localhost:5000/api/admin/payment/subscriptions/stats
```

---

## Error Handling

### Standard Error Format
```typescript
{
  success: false,
  error: "Error message here",
  code: "ERROR_CODE"
}
```

### Common Error Codes
- `UNAUTHORIZED` - Missing or invalid auth token
- `VALIDATION_ERROR` - Invalid input data
- `NOT_FOUND` - Resource not found
- `SUBSCRIPTION_EXPIRED` - Subscription has expired
- `PLAN_LIMIT_EXCEEDED` - User/student limit exceeded

### Handling Errors in React
```tsx
try {
  const response = await axios.get(endpoint, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data.data;
} catch (error) {
  const errorMessage = error.response?.data?.error || error.message;
  const errorCode = error.response?.data?.code;
  
  switch (errorCode) {
    case 'UNAUTHORIZED':
      // Redirect to login
      navigate('/auth/login');
      break;
    case 'SUBSCRIPTION_EXPIRED':
      // Show upgrade prompt
      showUpgradeModal();
      break;
    case 'PLAN_LIMIT_EXCEEDED':
      // Show limit alert
      showLimitAlert();
      break;
    default:
      toast.error(errorMessage);
  }
}
```

---

## Database Queries (Direct Prisma)

### Get subscription with full details
```typescript
const subscription = await prisma.subscription.findUnique({
  where: { id: subscriptionId },
  include: {
    school: true,
    plan: true,
  }
});
```

### Get all active subscriptions for a plan
```typescript
const subscriptions = await prisma.subscription.findMany({
  where: {
    status: 'ACTIVE',
    planId: planId
  },
  include: {
    school: {
      select: {
        id: true,
        name: true,
      }
    }
  }
});
```

### Check if school has active subscription
```typescript
const hasSubscription = await prisma.subscription.count({
  where: {
    schoolId,
    status: 'ACTIVE'
  }
}) > 0;
```

### Get revenue for period
```typescript
const revenue = await prisma.invoice.aggregate({
  where: {
    status: 'PAID',
    createdAt: {
      gte: new Date('2026-01-01'),
      lte: new Date('2026-12-31')
    }
  },
  _sum: { totalAmount: true }
});

console.log(`Revenue in 2026: ₦${revenue._sum.totalAmount}`);
```

---

## Best Practices

✅ **DO:**
- Always check `response.data.success` before using data
- Handle all error codes properly
- Cache subscription data with appropriate TTL
- Show loading states during API calls
- Verify dates server-side

❌ **DON'T:**
- Store sensitive subscription data in localStorage
- Make API calls without auth token
- Assume subscription status client-side
- Make subscription changes without verification
- Display amounts without proper formatting

---

**Last Updated**: 2026-02-28
