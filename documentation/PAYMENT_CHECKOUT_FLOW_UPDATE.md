# Payment Checkout Flow Update - Feb 28, 2026

## Overview
Fixed the "Proceed to Payment" button in Step 6 (SchoolSetupWizard) to properly launch the Paystack checkout flow and display the active subscription after payment completion.

## Changes Made

### Frontend Changes

#### 1. [src/pages/onboarding/steps/Step6PaymentPlans.tsx](src/pages/onboarding/steps/Step6PaymentPlans.tsx)

**Active Subscription Display**
- Enhanced the subscription info card with a more prominent design
- Shows "Active Subscription" status with:
  - Subscription type (Pro, Enterprise, Free)
  - Valid until date
  - Success message confirming payment processed
- Added green checkmark icon for better visual feedback

**Button Logic**
- Button text changes based on subscription status:
  - If user has active subscription: Shows "Next: Add Students"
  - If user has no subscription yet: Shows "Proceed to Payment"
- Button behavior:
  - If subscription exists: Proceeds to Step 7 immediately
  - If no subscription: Triggers payment flow
- Button disabled state updated to: `disabled={isProcessing || (!selectedPlanId && !currentSubscription)}`

**Subscription Auto-Detection**
- On component mount, fetches current subscription from `/api/onboarding/status`
- Auto-selects appropriate plan based on subscription tier:
  - Pro → `pro-year`
  - Enterprise → `enterprise-year`
  - Free → `free`
- Displays subscription details if already subscribed

#### 2. [src/pages/PaymentComplete.tsx](src/pages/PaymentComplete.tsx)

**Post-Payment Flow**
- Changed redirect destination from `/school-admin/overview` to `/onboarding?step=6`
- User is returned to Step 6 after successful payment verification
- Step 6 detects the new subscription and displays:
  - Active subscription badge
  - Valid subscription period
  - Updated button text to "Next: Add Students"

### Backend Changes

#### 3. [backend/src/modules/payment/services/payment.service.ts](backend/src/modules/payment/services/payment.service.ts)

**Payment Verification (verifyPayment method)**
- Creates subscription with status `ACTIVE` after payment verification
- Updates school record with:
  - `subscriptionTier`: Plan name (Pro, Enterprise, Free)
  - `subscriptionStartDate`: Current date
  - `subscriptionEndDate`: Calculated based on billing period
    - Year billing: +1 year
    - Term billing: +4 months
- Creates invoice record via subscription service

**Database Updates**
- Subscription table: Creates/updates with status 'ACTIVE'
- School table: Updates subscription fields marked as "subscribed"

#### 4. [backend/src/modules/onboarding/repositories/onboarding.repository.ts](backend/src/modules/onboarding/repositories/onboarding.repository.ts)

**Status Response**
- Already includes subscription info in getStatus response:
  - `subscriptionTier`
  - `subscriptionStartDate`
  - `subscriptionEndDate`

## Flow Diagram

```
Step 6: Payment Plans
    ↓
User selects plan + clicks "Proceed to Payment"
    ↓
If no subscription yet:
    → Calls POST /api/onboarding/step/6
    → Then calls POST /api/payment/initialize
    → Redirects to Paystack checkout
    → After payment → Paystack redirects to /payment-complete?reference=...
    ↓
Payment verification via GET /api/payment/verify/{reference}
    ↓
Backend updates:
    - Creates/updates Subscription (status: ACTIVE)
    - Updates School (subscriptionTier, dates)
    - Creates Invoice
    ↓
Frontend receives success, redirects to /onboarding?step=6
    ↓
Step 6 fetches /api/onboarding/status
    ↓
Detects subscriptionTier, displays:
    - "Active Subscription" badge
    - Subscription type & validity period
    - Button: "Next: Add Students"
```

## User Experience

### Before Payment
1. User sees plan cards in Step 6
2. Selects a plan
3. Clicks "Proceed to Payment"
4. Taken to Paystack checkout

### After Payment
1. Payment processed successfully
2. Redirected back to Step 6
3. Sees prominent green "Active Subscription" badge showing:
   - Subscription type
   - Valid until date
4. Can click "Next: Add Students" to proceed to Step 7

## Database State After Payment

```
schools table:
  - subscriptionTier: "Pro" (or "Enterprise", "Free")
  - subscriptionStartDate: 2026-02-28 (current date)
  - subscriptionEndDate: 2027-02-28 (if annual) or 2026-06-28 (if term)

subscriptions table:
  - schoolId: <unique id>
  - planId: <plan id>
  - status: "ACTIVE"
  - startDate: 2026-02-28
  - endDate: 2027-02-28 (or 2026-06-28)
  - isAutoRenew: true

payments table:
  - status: "success"
  - paystackReference: <paystack ref>
  - verifiedAt: 2026-02-28

invoices table:
  - schoolId: <school id>
  - status: "GENERATED"
```

## Testing Checklist

- [ ] User can select a plan in Step 6
- [ ] Button shows "Proceed to Payment" when no subscription
- [ ] Payment initialization works and redirects to Paystack
- [ ] Payment completion page shows success
- [ ] User is redirected back to Step 6
- [ ] Step 6 displays "Active Subscription" badge
- [ ] Subscription details show correct type and dates
- [ ] Button text changes to "Next: Add Students"
- [ ] Clicking button proceeds to Step 7
- [ ] Database records are created correctly
- [ ] User appears as "subscribed" in admin dashboard

## API Endpoints Used

1. `GET /api/onboarding/status` - Fetch subscription status
2. `POST /api/onboarding/step/6` - Record plan selection
3. `POST /api/payment/initialize` - Initialize Paystack payment
4. `GET /api/payment/verify/{reference}` - Verify payment after callback

## Notes

- Subscription status is tracked in the `Subscription` model with status field (ACTIVE, EXPIRED, CANCELLED)
- School profile also stores subscription details for quick access
- User can always check/update their subscription in Step 6 if they return to onboarding
