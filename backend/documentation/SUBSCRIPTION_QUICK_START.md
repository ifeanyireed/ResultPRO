# 🚀 Subscription System - Quick Integration Guide

## Database Setup
The Invoice model has been added to your Prisma schema. The migration was already applied.

```bash
# Already done - schema synced with:
npx prisma db push
```

## Backend Servers Running

### Start Backend
```bash
cd backend
npm run dev
# Listens on: http://localhost:5000
```

### Start Frontend  
```bash
npm run dev
# Listens on: http://localhost:8083
```

---

## API Endpoints Quick Reference

### 🔑 Authentication
All endpoints (except `/api/payment/webhook`) require:
```
Authorization: Bearer {JWT_TOKEN}
```

### 💳 School/User Subscription APIs

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/payment/subscription/active` | Get current subscription |
| GET | `/api/payment/subscription/billing-history` | View invoices |
| GET | `/api/payment/subscription/usage` | Check student/teacher limits |
| POST | `/api/payment/subscription/upgrade` | Upgrade plan |
| POST | `/api/payment/subscription/cancel` | Cancel subscription |
| POST | `/api/payment/subscription/renew` | Renew subscription |

### 👨‍💼 Admin APIs

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/admin/payment/subscriptions` | List all subscriptions |
| GET | `/api/admin/payment/subscriptions/stats` | Get revenue/stats |
| GET | `/api/admin/payment/subscriptions/:id/invoices` | Get invoices |
| POST | `/api/admin/payment/subscriptions/:id/cancel` | Cancel (admin) |
| POST | `/api/admin/payment/subscriptions/:id/renew` | Renew (admin) |

---

## Frontend Components

### BillingSubscription Component
**Location**: `src/pages/school-admin/BillingSubscription.tsx`

Features:
- Shows current plan and expiry
- Displays usage metrics (students/teachers)
- Invoice history table
- Cancel subscription modal
- Real-time data from backend

### Step6PaymentPlans Component
**Location**: `src/pages/onboarding/steps/Step6PaymentPlans.tsx`

Features:
- Shows current subscription if user is upgrading
- Green banner with plan details
- Expiry information

---

## Testing Checklist

### ✅ Test Subscription Flow
1. Login as school admin
2. Go to `/school-admin/billing`
3. View subscription details
4. Check invoice history
5. Test cancel subscription

### ✅ Test Upgrade Flow
1. During onboarding Step 6, see current plan
2. Select new plan
3. Proceed to payment
4. Verify new subscription created
5. Invoice should be generated

### ✅ Test Admin APIs
```bash
# Get all subscriptions
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/admin/payment/subscriptions

# Get stats
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/admin/payment/subscriptions/stats

# Cancel subscription
curl -X POST -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/admin/payment/subscriptions/{id}/cancel
```

---

## Data Models

### Subscription
```
{
  id: string
  schoolId: string
  planId: string
  status: "ACTIVE" | "EXPIRED" | "CANCELLED"
  startDate: DateTime
  endDate: DateTime
  isAutoRenew: boolean
}
```

### Invoice
```
{
  id: string
  invoiceNumber: string (unique)
  schoolId: string
  paymentId: string
  planId: string
  billingPeriod: "term" | "year"
  periodStartDate: DateTime
  periodEndDate: DateTime
  baseAmount: number
  taxAmount: number (7.5%)
  totalAmount: number
  currency: "NGN"
  status: "ISSUED" | "PAID" | "OVERDUE" | "CANCELLED"
  paidAt: DateTime | null
  dueDate: DateTime
}
```

---

## Key Business Logic

### Subscription Duration
- **Term**: 4 months (academic term)
- **Year**: 12 months (full year)

### Tax Calculation
- Standard: 7.5% on all amounts

### Invoice Terms
- Due date: 30 days from issue

### Plan Limits
- Free: 0-100 students
- Pro: 101-2,000 students
- Enterprise: Unlimited

---

## Environment Variables

Already configured in `.env`:
```
DATABASE_URL=file:./prisma/resultspro.db
PAYSTACK_PUBLIC_KEY=pk_test_xxx
PAYSTACK_SECRET_KEY=sk_test_xxx
FRONTEND_URL=http://localhost:8083
BACKEND_URL=http://localhost:5000
```

---

## Troubleshooting

### Issue: "Unknown field 'invoices' in model 'Payment'"
**Solution**: Run `npx prisma db push` to sync schema

### Issue: API returns 401
**Solution**: Ensure auth token is in Authorization header

### Issue: Invoice field missing in response
**Solution**: Verify database migration completed with `npx prisma db push`

### Issue: BillingSubscription component errors
**Solution**: 
1. Clear browser cache
2. Restart frontend server
3. Check console for exact error

---

## File Changes Summary

**Modified Files:**
- `backend/prisma/schema.prisma` - Added Invoice model
- `backend/src/app.ts` - Added admin payment routes
- `backend/src/modules/payment/routes/payment.routes.ts` - Added subscription endpoints
- `backend/src/modules/payment/services/payment.service.ts` - Added invoice creation
- `src/pages/school-admin/BillingSubscription.tsx` - Complete rewrite
- `src/pages/onboarding/steps/Step6PaymentPlans.tsx` - Show current subscription

**New Files:**
- `backend/src/modules/payment/services/subscription.service.ts` - Core service
- `backend/src/modules/payment/controllers/subscription.controller.ts` - User endpoints
- `backend/src/modules/payment/controllers/admin-subscription.controller.ts` - Admin endpoints
- `backend/src/modules/payment/routes/admin-payment.routes.ts` - Admin routes

---

## Next Steps (Optional)

1. **Email Notifications**: Add expiry reminders
2. **Auto-renewal**: Set up scheduled tasks
3. **Usage Alerts**: Notify when approaching limits
4. **Advanced Analytics**: Dashboard for revenue trends
5. **Dunning**: Retry failed payments automatically

---

## Support

For issues or questions, refer to:
- `SUBSCRIPTION_IMPLEMENTATION_SUMMARY.md` - Detailed implementation docs
- Backend logs: Check terminal where `npm run dev` is running
- Frontend logs: Check browser console

---

**Status**: ✅ Complete and Ready for Testing

Last Updated: 2026-02-28
