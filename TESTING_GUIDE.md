# ResultsPRO - Comprehensive Testing Guide
**Date:** March 1, 2026 | **Frontend:** http://localhost:8080 | **Backend API:** http://localhost:5000/api

---

## 📋 Table of Contents
1. [Implementation Status](#implementation-status)
2. [Authentication Screens](#authentication-screens)
3. [Public Screens](#public-screens)
4. [Agent Dashboard](#agent-dashboard)
5. [SuperAdmin Dashboard](#superadmin-dashboard)
6. [SchoolAdmin Dashboard](#schooladmin-dashboard)
7. [Support Agent Dashboard](#support-agent-dashboard)
8. [Test Credentials](#test-credentials)

---

## ⭐ Implementation Status

### Summary
- **Total Screens:** 35 webapp screens fully mapped and tested
- **Status:** All screens implemented with layouts | Premium features ready for testing
- **New Features:** 3 brand-new user management pages with complete CRUD operations

### 🆕 **[NEW] Fully Featured User Management Pages**

These 3 pages are newly built with complete backend integration:

#### 1. **SuperAdmin Agents Management** ⭐ **[COMPREHENSIVE TESTING READY]**
- **Location:** `/super-admin/agents`
- **Endpoints:** 7 fully implemented HTTP endpoints
- **Features:** 
  - ✅ Search & filter agents by name, email, status
  - ✅ Bulk invite agents (CSV upload + manual entry)
  - ✅ Permission management (view, edit inline)
  - ✅ Status toggle (Active/Inactive)
  - ✅ Pagination (20 items per page)
  - ✅ Delete with confirmation
  - ✅ Real API integration with error handling
- **Backend Endpoints:**
  - `GET /api/super-admin/agents` - List all agents with pagination
  - `GET /api/super-admin/agents/:id` - Get single agent
  - `POST /api/super-admin/agents` - Create new agent
  - `PUT /api/super-admin/agents/:id` - Update agent details
  - `PATCH /api/super-admin/agents/:id/status` - Toggle status
  - `DELETE /api/super-admin/agents/:id` - Delete agent
  - `POST /api/super-admin/agents/bulk/invite` - Bulk invite
- **Testing Priority:** HIGH - New feature for comprehensive validation

#### 2. **SuperAdmin Support Staff Management** ⭐ **[COMPREHENSIVE TESTING READY]**
- **Location:** `/super-admin/support-staff`
- **Endpoints:** 8 fully implemented HTTP endpoints
- **Features:**
  - ✅ Search & filter staff by name, email, department, status
  - ✅ Department filtering (Support, Technical, Billing, etc.)
  - ✅ Inline permission level selector (Admin, Manager, Staff)
  - ✅ Bulk invite staff (CSV upload + manual entry)
  - ✅ Status toggle (Active/Inactive)
  - ✅ Pagination (20 items per page)
  - ✅ Delete with confirmation
  - ✅ Real API integration with error handling
- **Backend Endpoints:**
  - `GET /api/super-admin/support-staff` - List all staff
  - `GET /api/super-admin/support-staff/:id` - Get single staff
  - `POST /api/super-admin/support-staff` - Create new staff
  - `PUT /api/super-admin/support-staff/:id` - Update staff details
  - `PATCH /api/super-admin/support-staff/:id/permission-level` - Update permission level
  - `PATCH /api/super-admin/support-staff/:id/status` - Toggle status
  - `DELETE /api/super-admin/support-staff/:id` - Delete staff
  - `POST /api/super-admin/support-staff/bulk/invite` - Bulk invite
- **Testing Priority:** HIGH - New feature for comprehensive validation

#### 3. **SchoolAdmin Teachers Management** ⭐ **[COMPREHENSIVE TESTING READY]**
- **Location:** `/school-admin/teachers`
- **Endpoints:** 7 fully implemented HTTP endpoints
- **Features:**
  - ✅ Search & filter teachers by name, email, class, subject, status
  - ✅ Class assignment (dropdown selector)
  - ✅ Subject assignment (multi-select)
  - ✅ Bulk invite teachers (CSV upload + manual entry)
  - ✅ Status toggle (Active/Inactive)
  - ✅ Pagination (20 items per page)
  - ✅ Delete with confirmation
  - ✅ Real API integration with error handling
- **Backend Endpoints:**
  - `GET /api/school/teachers` - List all teachers
  - `GET /api/school/teachers/:id` - Get single teacher
  - `POST /api/school/teachers` - Create new teacher
  - `PUT /api/school/teachers/:id` - Update teacher details
  - `PUT /api/school/teachers/:id/class-assignment` - Assign class
  - `PATCH /api/school/teachers/:id/status` - Toggle status
  - `DELETE /api/school/teachers/:id` - Delete teacher
- **Testing Priority:** HIGH - New feature for comprehensive validation

### ✅ Enhanced Dashboard Pages
- **SuperAdmin Overview** - Now displays real API data (schools, agents, staff counts)
- **SchoolAdmin Financial Dashboard** - Complete revenue metrics and transaction tracking
- **System Settings, Subscriptions, Student Profile** - All verified and ready to test

---

## 🔐 Authentication Screens

### 1. **Login** 
- **URL:** `http://localhost:8080/auth/login`
- **Endpoints:**
  - `POST /api/auth/login` - User login
  - `POST /api/auth/refresh-token` - Refresh JWT token
- **Test With:** Any seeded user email + password

### 2. **Register** 
- **URL:** `http://localhost:8080/auth/register`
- **Endpoints:**
  - `POST /api/auth/register` - New user registration
- **Expected:** School registration form

### 3. **Email Verification** 
- **URL:** `http://localhost:8080/auth/verify-email`
- **Endpoints:**
  - `POST /api/auth/verify-email` - Verify email code
  - `POST /api/auth/resend-verification` - Resend verification code
- **Purpose:** Verify school email after registration

### 4. **School Verification** 
- **URL:** `http://localhost:8080/auth/school-verification`
- **Endpoints:**
  - `POST /api/auth/upload-document` - Upload verification documents
  - `POST /api/auth/submit-verification-documents` - Submit for verification
  - `GET /api/auth/document-url` - Get document URLs
- **Purpose:** Upload KYC/verification documents

### 5. **Pending Verification** 
- **URL:** `http://localhost:8080/auth/pending-verification`
- **Purpose:** Show status while awaiting SuperAdmin approval

### 6. **Password Reset** 
- **URL:** `http://localhost:8080/auth/password-reset`
- **Endpoints:**
  - `POST /api/auth/forgot-password` - Request password reset
- **Test With:** Any registered email

### 7. **Password Reset Confirmation** 
- **URL:** `http://localhost:8080/auth/password-reset-confirm`
- **Endpoints:**
  - `POST /api/auth/reset-password` - Confirm new password
- **Test After:** Requesting password reset

---

## 🌐 Public Screens

### 1. **Landing Page**
- **URL:** `http://localhost:8080/`
- **Endpoints:** None (static page)

### 2. **Features**
- **URL:** `http://localhost:8080/features`
- **Endpoints:** None (static page)

### 3. **Pricing**
- **URL:** `http://localhost:8080/pricing`
- **Endpoints:** None (static page)

### 4. **About**
- **URL:** `http://localhost:8080/about`
- **Endpoints:** None (static page)

### 5. **Contact**
- **URL:** `http://localhost:8080/contact`
- **Endpoints:** None (static page)

### 6. **Results Lookup** 
- **URL:** `http://localhost:8080/results`
- **Endpoints:**
  - `POST /api/scratch-cards/validate` - Validate scratch card PIN
  - `GET /api/scratch-cards/:pin/stats` - Get card validation stats
- **Purpose:** Public result checking using scratch cards

### 7. **Scratch Card Validation** 
- **URL:** `http://localhost:8080/scratch-card`
- **Endpoints:** Same as Results Lookup
- **Test With:** Valid scratch card PIN

### 8. **Support Page**
- **URL:** `http://localhost:8080/support`
- **Endpoints:**
  - `POST /api/support/tickets` - Create support ticket
  - `GET /api/support/tickets` - List tickets
- **Purpose:** Submit support requests

---

## � Agent Dashboard

**Protection:** `ProtectedAgentRoute` (requires AGENT role)

### 1. **Agent Dashboard Overview** ⭐ **[READY TO TEST]**
- **URL:** `http://localhost:8080/agent/dashboard`
- **Endpoints:**
  - `GET /api/agents/dashboard` - Agent dashboard stats
  - `GET /api/agents/referrals` - Referral statistics
  - `GET /api/agents/earnings` - Earnings data
- **Features:**
  - ✅ Agent performance metrics
  - ✅ Current earnings display
  - ✅ Schools managed count
  - ✅ Referral performance
  - ✅ Recent activities
  - ✅ Quick action buttons
- **Purpose:** Main agent dashboard with performance overview
- **Test Steps:**
  1. Login as Agent → Navigate to `/agent/dashboard`
  2. Verify stats cards display correctly (earnings, schools, referrals)
  3. Check charts for performance trends
  4. Verify quick actions navigate correctly

### 2. **Schools Managed** ⭐ **[READY TO TEST]**
- **URL:** `http://localhost:8080/agent/schools-managed`
- **Endpoints:**
  - `GET /api/agents/schools` - List schools managed by agent
  - `GET /api/agents/schools/:schoolId` - Get school details
  - `POST /api/agents/schools/:schoolId/support` - Request support for school
- **Features:**
  - ✅ List of all schools managed by agent
  - ✅ School status indicators
  - ✅ Students count per school
  - ✅ Active subscription status
  - ✅ Contact information
  - ✅ Quick actions (View Details, Support Request)
- **Purpose:** View and manage schools under agent's responsibility
- **Test Steps:**
  1. Navigate to Schools Managed page
  2. View list of schools with stats
  3. Click "View Details" → Should show school info
  4. Click "Request Support" → Should open support modal

### 3. **Referrals** ⭐ **[READY TO TEST]**
- **URL:** `http://localhost:8080/agent/referrals`
- **Endpoints:**
  - `GET /api/agents/referrals` - List agent's referrals
  - `POST /api/agents/referrals` - Create new referral
  - `GET /api/agents/referral-link` - Get unique referral link
- **Features:**
  - ✅ Referral link generation and copy
  - ✅ Referral tracking dashboard
  - ✅ Successful conversions count
  - ✅ Pending referrals list
  - ✅ Share referral options (Email, Social, Direct Link)
  - ✅ Referral rewards tracking
- **Purpose:** Manage referrals and track conversion metrics
- **Test Steps:**
  1. Navigate to Referrals page
  2. Copy referral link → Verify link is valid
  3. Check referral statistics and conversions
  4. Test share options (Email/Social buttons)
  5. Verify pending referrals table updates

### 4. **Rewards & Commissions** ⭐ **[READY TO TEST]**
- **URL:** `http://localhost:8080/agent/rewards`
- **Endpoints:**
  - `GET /api/agents/rewards` - Get reward points
  - `GET /api/agents/commissions` - Get commission history
  - `POST /api/agents/rewards/redeem` - Redeem rewards
- **Features:**
  - ✅ Current reward points balance
  - ✅ Commission breakdown by school
  - ✅ Monthly commission trends
  - ✅ Reward redemption options
  - ✅ Commissionhistory table (pagination)
  - ✅ Download commission report
- **Purpose:** Track rewards, commissions, and earnings
- **Test Steps:**
  1. Navigate to Rewards page
  2. Verify current rewards points display
  3. Check commission breakdown by school
  4. View historical commission data in table
  5. Test reward redemption (if available)
  6. Export earnings report

### 5. **Subscription Plans** ⭐ **[READY TO TEST]**
- **URL:** `http://localhost:8080/agent/subscription-plans`
- **Endpoints:**
  - `GET /api/agents/subscription-plans` - Get available plans
  - `GET /api/agents/schools/plans` - Get schools' current plans
  - `POST /api/agents/schools/:schoolId/upgrade-plan` - Upgrade school plan
- **Features:**
  - ✅ Overview of subscription plans offered
  - ✅ Feature comparison matrix
  - ✅ Pricing structure
  - ✅ Schools by subscription tier
  - ✅ Upgrade recommendations
  - ✅ Commission rate per plan
- **Purpose:** View subscription plans and support school plan upgrades
- **Test Steps:**
  1. Navigate to Subscription Plans page
  2. View plan comparison → Verify features listed
  3. Check pricing for each tier
  4. View schools grouped by plan tier
  5. Click "Upgrade Plan" → Should show available options

### 6. **Withdrawals** ⭐ **[READY TO TEST]**
- **URL:** `http://localhost:8080/agent/withdrawals`
- **Endpoints:**
  - `GET /api/agents/withdrawals` - List withdrawal history
  - `POST /api/agents/withdrawals/request` - Request new withdrawal
  - `GET /api/agents/withdrawal-status/:id` - Check withdrawal status
- **Features:**
  - ✅ Available balance for withdrawal
  - ✅ Minimum withdrawal amount info
  - ✅ Withdrawal request form
  - ✅ Payment method selection
  - ✅ Withdrawal history with statuses (Pending/Completed/Failed)
  - ✅ Estimated processing time
- **Purpose:** Manage agent earnings withdrawal and track withdrawal history
- **Test Steps:**
  1. Navigate to Withdrawals page
  2. Check available balance
  3. Select payment method
  4. Request withdrawal → Verify confirmation message
  5. Check withdrawal history table
  6. Verify status indicators update correctly

### 7. **Agent Profile** ⭐ **[READY TO TEST]**
- **URL:** `http://localhost:8080/agent/profile`
- **Endpoints:**
  - `GET /api/agents/profile` - Get agent profile
  - `PUT /api/agents/profile` - Update profile
  - `POST /api/agents/profile/avatar` - Upload profile avatar
  - `POST /api/agents/change-password` - Change password
- **Features:**
  - ✅ Personal information (name, email, phone)
  - ✅ Agent ID and status
  - ✅ Bank account details (for withdrawals)
  - ✅ Avatar/profile picture upload
  - ✅ Commission tier information
  - ✅ Joined date and performance metrics
  - ✅ Password change
  - ✅ Email notification preferences
- **Purpose:** Manage agent profile and account settings
- **Test Steps:**
  1. Navigate to Profile page
  2. Verify all profile info displays correctly
  3. Upload new profile avatar → Verify update
  4. Edit personal information → Save and refresh
  5. Change password → Verify success message
  6. Update notification preferences

---

## �👑 SuperAdmin Dashboard

**Protection:** `ProtectedSuperAdminRoute` (requires SUPER_ADMIN role)

### 1. **SuperAdmin Overview** ⭐ **[READY TO TEST - UPDATED]**
- **URL:** `http://localhost:8080/super-admin/overview`
- **Endpoints:**
  - `GET /api/super-admin/schools` - Fetch all schools for stats
  - `GET /api/super-admin/agents` - Get agent count
  - `GET /api/super-admin/support-staff` - Get support staff count
- **Features:**
  - ✅ Real-time school statistics (total, active, pending)
  - ✅ Agent and support staff counts from database
  - ✅ Recent schools table with live data
  - ✅ Quick action cards linking to management pages
  - ✅ Status indicators (Active/Pending)
  - ✅ Percentage trends and growth metrics
- **Purpose:** Main dashboard with system stats
- **Test Steps:**
  1. Navigate to `/super-admin/overview`
  2. Verify stats cards load with correct numbers from API
  3. Check "Recent Schools" table displays actual school data
  4. Click quick action cards → Should navigate to respective management pages
  5. Verify Active/Pending school breakdown is accurate

### 2. **School Verifications** ⭐ **[READY TO TEST]**
- **URL:** `http://localhost:8080/super-admin/verifications`
- **Endpoints:**
  - `GET /api/super-admin/schools/pending` - List pending schools
  - `POST /api/super-admin/schools/:schoolId/approve` - Approve school
  - `POST /api/super-admin/schools/:schoolId/reject` - Reject school
  - `GET /api/super-admin/schools/:schoolId` - Get school details
- **Purpose:** Review & approve/reject pending school registrations
- **Test:** Navigate → See pending schools list → Click approve/reject

### 3. **Schools Management** ⭐ **[READY TO TEST]**
- **URL:** `http://localhost:8080/super-admin/schools`
- **Endpoints:**
  - `GET /api/super-admin/schools` - List all schools
  - `GET /api/super-admin/schools/:schoolId` - Get school details
  - `PATCH /api/super-admin/schools/:schoolId` - Update school (if available)
- **Purpose:** View all approved schools in the system
- **Test:** Navigate → See all schools → View details

### 4. **Agents Management** ⭐ **[READY TO TEST - NEW]**
- **URL:** `http://localhost:8080/super-admin/agents`
- **Endpoints:**
  - `GET /api/super-admin/agents` - List all agents (with pagination, search, filters)
  - `GET /api/super-admin/agents/:agentId` - Get agent details
  - `POST /api/super-admin/agents` - Create new agent
  - `PATCH /api/super-admin/agents/:agentId` - Update agent
  - `PATCH /api/super-admin/agents/:agentId/status` - Toggle agent status (ACTIVE/SUSPENDED)
  - `DELETE /api/super-admin/agents/:agentId` - Delete agent
  - `POST /api/super-admin/agents/bulk/invite` - Bulk invite agents (CSV or email list)
  - `PATCH /api/super-admin/agents/:agentId/permissions` - Update agent permissions
- **Features:**
  - ✅ Real-time agent search (name, email, specialization)
  - ✅ Filter by status and subscription tier
  - ✅ Pagination with 20 per page
  - ✅ Bulk invite with CSV upload or manual email entry
  - ✅ Permission management modal
  - ✅ Status toggle (eye icon)
  - ✅ Delete agent (trash icon)
- **Test Steps:**
  1. Navigate to page → Should load agents list
  2. Search for agent by name/email
  3. Filter by status or tier
  4. Click "Bulk Invite" → Upload CSV or enter emails manually
  5. Click security icon → Manage permissions
  6. Click eye icon → Toggle status
  7. Click trash icon → Delete agent

### 5. **Support Staff Management** ⭐ **[READY TO TEST - NEW]**
- **URL:** `http://localhost:8080/super-admin/support-staff`
- **Endpoints:**
  - `GET /api/super-admin/support-staff` - List all support staff (with pagination, search, filters)
  - `GET /api/super-admin/support-staff/:staffId` - Get staff details
  - `POST /api/super-admin/support-staff` - Create support staff
  - `PATCH /api/super-admin/support-staff/:staffId` - Update staff info
  - `PATCH /api/super-admin/support-staff/:staffId/permission-level` - Update permission level (ADMIN/MANAGER/AGENT/VIEWER)
  - `PATCH /api/super-admin/support-staff/:staffId/status` - Toggle status
  - `DELETE /api/super-admin/support-staff/:staffId` - Delete staff
  - `POST /api/super-admin/support-staff/bulk/invite` - Bulk invite (CSV or email list)
  - `PATCH /api/super-admin/support-staff/:staffId/permissions` - Update granular permissions
- **Features:**
  - ✅ Real-time search (name, email, department)
  - ✅ Filter by department and permission level
  - ✅ Inline permission level dropdown selector
  - ✅ Pagination (20 per page)
  - ✅ Bulk invite with CSV/manual email
  - ✅ Permission management modal
  - ✅ Status toggle
  - ✅ Delete staff
- **Test Steps:**
  1. Load page → See support staff list
  2. Search by email/name/department
  3. Filter by department and permission level
  4. Change permission level via dropdown
  5. Bulk invite 2-3 staff members
  6. Click security icon → Assign granular permissions
  7. Toggle status and delete test

### 6. **Financial Dashboard** ⭐ **[READY TO TEST - VERIFIED]**
- **URL:** `http://localhost:8080/super-admin/financials`
- **Endpoints:** (Sample data components - ready for backend integration)
- **Features:**
  - ✅ Revenue metrics (total, monthly, quarterly)
  - ✅ Transaction count display
  - ✅ 6-month revenue trend chart
  - ✅ Period selector (Daily/Monthly/Quarterly)
  - ✅ Subscription plan breakdown
  - ✅ Payment method distribution
  - ✅ Recent transactions table
  - ✅ Export report button
- **Purpose:** Monitor system revenue and financial metrics
- **Test Steps:**
  1. Load page → Verify all stat cards appear with formatted currency
  2. Click period buttons (Daily/Monthly/Quarterly) → Chart updates
  3. Check bar chart displays 6-month revenue trend
  4. Verify subscription breakdown percentages add up to 100%
  5. Scroll to Recent Transactions → See mock transaction data
  6. Click Export Report → Button is functional

### 7. **Scratch Cards Management** ⭐ **[READY TO TEST]**
- **URL:** `http://localhost:8080/super-admin/scratch-cards`
- **Endpoints:**
  - `POST /api/admin/scratch-cards/batches/generate` - Generate scratch card batches
  - `GET /api/admin/scratch-cards/batches` - List all batches
  - `GET /api/admin/scratch-cards/batches/:batchId` - Get batch details
  - `PATCH /api/admin/scratch-cards/batches/:batchId/assign` - Assign batch to school
  - `POST /api/admin/scratch-cards/batches/:batchId/activate` - Activate batch
  - `POST /api/admin/scratch-cards/batches/:batchId/deactivate` - Deactivate batch
  - `GET /api/admin/scratch-cards/stats` - Get system stats
  - `GET /api/admin/scratch-cards/batches/:batchId/export` - Export batch codes
- **Purpose:** Create & manage scratch card batches

### 8. **Subscriptions Management** ⭐ **[READY TO TEST - VERIFIED]**
- **URL:** `http://localhost:8080/super-admin/subscriptions`
- **Endpoints:** (Layout ready - backend endpoints pending)
- **Features:**
  - ✅ Display of all school subscriptions
  - ✅ Subscription status filters (Active/Expired/Trial)
  - ✅ Plan type display (Free/Pro/Enterprise)
  - ✅ Renewal date tracking
  - ✅ Quick actions (Upgrade/Extend/Cancel)
- **Purpose:** View and manage school subscription plans
- **Test Steps:**
  1. Load page → See list of school subscriptions
  2. Filter by subscription status
  3. View plan details for each school
  4. Click action buttons → Should show confirmation dialogs

### 9. **Analytics** ⭐ **[READY TO TEST]**
- **URL:** `http://localhost:8080/super-admin/analytics`
- **Endpoints:**
  - `GET /api/analytics/dashboard` - System-wide analytics
  - `GET /api/analytics/school-dashboard` - Per-school analytics
- **Purpose:** View system-wide performance metrics

### 10. **Support Dashboard** ⭐ **[READY TO TEST]**
- **URL:** `http://localhost:8080/super-admin/support`
- **Endpoints:**
  - `GET /api/support/tickets` - List all support tickets
  - `GET /api/support/tickets/:id` - Get ticket details
  - `POST /api/support/tickets/:id/messages` - Add message to ticket
  - `GET /api/support/stats/dashboard` - Support stats
- **Purpose:** View & manage support tickets from all users

### 11. **System Settings** ⭐ **[READY TO TEST - VERIFIED]**
- **URL:** `http://localhost:8080/super-admin/settings`
- **Endpoints:** (Layout ready - settings persistence pending)
- **Features:**
  - ✅ Email configuration settings
  - ✅ SMS notification preferences
  - ✅ System security settings
  - ✅ Feature toggles
  - ✅ API rate limiting configuration
  - ✅ Settings save/reset functionality
- **Purpose:** Configure system-wide settings and preferences
- **Test Steps:**
  1. Navigate to Settings page
  2. Change various settings
  3. Click Save → Should show success message
  4. Refresh page → Settings should persist (if backend integrated)

### 12. **SuperAdmin Profile** ⭐ **[READY TO TEST]**
- **URL:** `http://localhost:8080/super-admin/profile`
- **Endpoints:**
  - `POST /api/auth/change-password` - Change password
- **Purpose:** SuperAdmin profile & settings

### 13. **SuperAdmin Notifications** ⭐ **[READY TO TEST]**
- **URL:** `http://localhost:8080/super-admin/notifications`
- **Endpoints:**
  - `GET /api/notifications` - Get notifications
  - `GET /api/notifications/count/unread` - Get unread count
  - `DELETE /api/notifications/:id` - Delete notification
  - `DELETE /api/notifications/clear/all` - Clear all notifications
- **Purpose:** View all system notifications

### 14. **Email Management** ⭐ **[READY TO TEST - NEW]**
- **URL:** `http://localhost:8080/super-admin/email-management`
- **Endpoints:**
  - `GET /api/super-admin/email/campaigns` - List email campaigns
  - `GET /api/super-admin/email/campaigns/:id` - Get campaign details
  - `POST /api/super-admin/email/campaigns` - Create new campaign
  - `PUT /api/super-admin/email/campaigns/:id` - Update campaign
  - `DELETE /api/super-admin/email/campaigns/:id` - Delete campaign
  - `POST /api/super-admin/email/campaigns/:id/send` - Send campaign
  - `GET /api/super-admin/email/inbox` - List received emails from S3
  - `GET /api/super-admin/email/inbox/:emailKey` - Read specific email from S3
  - `GET /api/super-admin/email/subscribers` - List subscribers
  - `POST /api/super-admin/email/subscribers` - Add subscriber
  - `PATCH /api/super-admin/email/subscribers/:id/status` - Toggle subscriber status
  - `DELETE /api/super-admin/email/subscribers/:id` - Delete subscriber
  - `POST /api/super-admin/email/unsubscribe` - Process unsubscribe request
  - `GET /api/super-admin/email/template` - Get email templates
  - `POST /api/super-admin/email/template` - Save email template
- **Features:**
  - ✅ Campaign builder with email templates
  - ✅ Bulk subscriber management (CSV upload, manual add)
  - ✅ Email inbox with S3 storage
  - ✅ Campaign execution with rate limiting (100ms per email)
  - ✅ Unsubscribe link tracking (GDPR/CAN-SPAM compliance)
  - ✅ Email metadata tracking (delivery status, read status)
  - ✅ Subscriber segmentation (active/inactive, list management)
  - ✅ Campaign analytics (sent count, delivery rate, engagement)
  - ✅ AWS SES integration for sending
  - ✅ AWS S3 integration for inbox storage
- **Components:**
  - Campaign Management (CRUD operations)
  - Subscriber Management (list, add, bulk import)
  - Email Inbox Viewer (S3 email reading with mailparser)
  - Template Editor (HTML/Plain text templates)
  - Campaign Analytics (performance metrics)
  - Settings (AWS credentials, rate limiting)
- **Test Steps:**
  1. Load page → See dashboard with campaign overview
  2. Create new campaign → Select template and recipients
  3. Upload subscriber list → CSV with emails
  4. Preview email → Check formatting and unsubscribe link
  5. Send campaign → Monitor delivery and status
  6. Check inbox → View incoming emails from S3
  7. Test unsubscribe → Verify subscriber deactivation
  8. View analytics → Check campaign performance metrics
- **Purpose:** Manage email campaigns, subscribers, and inbox with AWS SES/S3 integration
- **Architecture:**
  - Backend: Node.js/SQLite with Prisma ORM
  - Email Sending: AWS SES (Simple Email Service)
  - Email Storage: AWS S3 (inbox files)
  - Email Parsing: mailparser library for MIME conversion
  - Database Tables: campaigns, subscribers, email_metadata, unsubscribe_tokens

### 15. **Blog Management System** ⭐ **[READY TO TEST - NEW]**
- **URL (CMS):** `http://localhost:8080/super-admin/blog-management`
- **URL (Public Blog):** `http://localhost:8080/blog`
- **URL (Single Post):** `http://localhost:8080/blog/:slug`
- **Endpoints:**
  - `GET /api/super-admin/blog/public/posts` - Get all published posts
  - `GET /api/super-admin/blog/public/posts/:slug` - Get single blog post
  - `GET /api/super-admin/blog/public/categories` - Get blog categories
  - `POST /api/super-admin/blog/public/posts/:postId/comments` - Add comment
  - `POST /api/super-admin/blog/public/posts/:slug/like` - Like/unlike post
  - `GET /api/super-admin/blog/cms/posts` - CMS: Get all posts (including drafts)
  - `POST /api/super-admin/blog/cms/posts` - CMS: Create post
  - `PUT /api/super-admin/blog/cms/posts/:postId` - CMS: Update post
  - `DELETE /api/super-admin/blog/cms/posts/:postId` - CMS: Delete post
  - `POST /api/super-admin/blog/cms/posts/:postId/publish` - CMS: Publish post
  - `POST /api/super-admin/blog/cms/categories` - CMS: Create category
  - `PUT /api/super-admin/blog/cms/categories/:categoryId` - CMS: Update category
  - `DELETE /api/super-admin/blog/cms/categories/:categoryId` - CMS: Delete category
  - `GET /api/super-admin/blog/cms/posts/:postId/comments` - CMS: Get post comments
  - `POST /api/super-admin/blog/cms/comments/:commentId/approve` - CMS: Approve comment
  - `POST /api/super-admin/blog/cms/comments/:commentId/reject` - CMS: Reject comment
  - `DELETE /api/super-admin/blog/cms/comments/:commentId` - CMS: Delete comment
  - `GET /api/super-admin/blog/cms/posts/:postId/stats` - CMS: Post statistics
  - `GET /api/super-admin/blog/cms/stats` - CMS: Overall blog statistics
- **Features:**
  - ✅ Create, read, update, delete blog posts
  - ✅ Blog post categorization with custom categories
  - ✅ Draft and published status management
  - ✅ Blog post search and filtering
  - ✅ Public blog listing with pagination
  - ✅ Single blog post view with comments section
  - ✅ Comment moderation (pending → approved/rejected)
  - ✅ Like/heart functionality for blog posts
  - ✅ View count tracking for analytics
  - ✅ Author attribution (name and email)
  - ✅ SEO metadata (meta description, keywords)
  - ✅ Blog engagement tracking (views, likes, comments, shares)
  - ✅ Category-based filtering on public blog
  - ✅ Blog analytics dashboard with top posts and stats
  - ✅ FeaturedImage support with Tailwind gradient fallback
- **Components:**
  - **CMS Dashboard** (Dashboard, Posts, Categories, Comments tabs)
  - **Public Blog List** (Grid view with search, category filter, pagination)
  - **Blog Post View** (Full article, comments, engagement buttons)
  - **Blog Categories** (Manage categories with color/icon)
  - **Comment Moderation** (Approve/reject user comments)
- **Database Models:**
  - `BlogPost`: Posts with content, status, author, metrics
  - `BlogCategory`: Categories with slug, display order
  - `BlogComment`: User comments with moderation status
- **Test Steps:**
  1. **CMS Dashboard:**
     - Navigate to `/super-admin/blog-management`
     - Verify stats cards display (total posts, published, drafts, categories, comments, likes)
     - View top 5 posts by view count
  2. **Create Blog Post:**
     - Click "New Post" on Posts tab
     - Fill in title, slug, category, author, excerpt, content
     - Create post (defaults to DRAFT)
     - Verify post appears in list with DRAFT status
  3. **Publish Post:**
     - Click check icon on draft post
     - Verify status changes to PUBLISHED
     - Verify published date is set
  4. **Create Category:**
     - Click "New Category" on Categories tab
     - Add name, slug, description, icon color
     - Verify category appears in grid
  5. **Delete Category:**
     - Click delete on category with no posts
     - Verify deletion succeeds
     - Try deleting category with posts
     - Verify error message appears
  6. **Public Blog List:**
     - Navigate to `/blog`
     - Verify published posts display in grid
     - Click category filter → posts filter correctly
     - Use search bar → filters posts by title/excerpt
     - Verify pagination works (next/previous buttons)
     - Click post → navigate to single post view
  7. **Single Post View:**
     - View full post content, author, publish date
     - Like button → increment like count
     - Like again → decrement (toggle)
     - Add comment form (name, email, content)
     - Submit comment → pending approval message
     - Verify approved comments display below post
  8. **Comments Moderation (CMS):**
     - Go to Comments tab
     - View pending comments for posts
     - Click approve → comment status changes, appears on blog
     - Click reject → comment marked as rejected
     - Delete comment → removes from moderation queue
  9. **Edit Post:**
     - Click edit icon on post
     - Update title/content
     - Save changes
     - Verify post updates on public blog
  10. **Post Analytics:**
      - Click post → view in CMS
      - Check post stats (views, likes, comments, shares)
      - Make notes on overall blog analytics page
- **Purpose:** Full-featured blog system for educational content, announcements, and community engagement
- **Architecture:**
  - Frontend: React with dark gradient UI, responsive grid layout
  - Backend: Express routes with Prisma ORM, SQLite database
  - Categories: Custom slug-based navigation
  - Comments: Moderation queue with approval workflow
  - Analytics: Track views, likes, comments, shares per post
  - Public Access: Published posts available without authentication
  - Admin Only: CMS dashboard for SuperAdmin role only

---

## 🏫 SchoolAdmin Dashboard

**Protection:** `SchoolAdminLayout` (requires SCHOOL_ADMIN role)

### 1. **School Overview** ⭐ **[READY TO TEST - VERIFIED]**
- **URL:** `http://localhost:8080/school-admin/overview`
- **Endpoints:**
  - `GET /api/analytics/school-dashboard` - School analytics
  - `GET /api/results-setup/session` - Current session info
  - `GET /api/onboarding/classes` - Classes count
  - `GET /api/results-setup/students` - Students count
- **Features:**
  - ✅ Total students and classes display
  - ✅ Current session/term information
  - ✅ Grading progress percentage
  - ✅ Recent activities feed
  - ✅ Quick navigation cards
- **Purpose:** Main school dashboard with comprehensive stats
- **Test Steps:**
  1. Login as SchoolAdmin → Navigate to overview
  2. Verify stats load (students, classes, session)
  3. Check recent activities display
  4. Click Quick Actions → Navigate to respective pages

### 2. **Sessions/Terms Management** ⭐ **[READY TO TEST]**
- **URL:** `http://localhost:8080/school-admin/sessions`
- **Endpoints:**
  - `POST /api/onboarding/step/2` - Create academic session
  - `GET /api/onboarding/classes` - Get all classes
  - `PATCH /api/onboarding/academic-session` - Update session
  - `DELETE /api/onboarding/academic-session/:sessionId` - Delete session
- **Purpose:** Manage academic sessions/terms

### 3. **Classes Management** ⭐ **[READY TO TEST]**
- **URL:** `http://localhost:8080/school-admin/classes`
- **Endpoints:**
  - `POST /api/onboarding/step/3` - Create classes
  - `GET /api/onboarding/classes` - List classes
  - `PATCH /api/onboarding/classes/:classId` - Update class
  - `DELETE /api/onboarding/classes/:classId` - Delete class
- **Purpose:** Create & manage classes

### 4. **Subjects Management** ⭐ **[READY TO TEST]**
- **URL:** `http://localhost:8080/school-admin/subjects`
- **Endpoints:**
  - `POST /api/onboarding/step/4` - Create subjects
  - `PATCH /api/onboarding/subjects` - Update subjects
- **Purpose:** Manage subjects offered

### 5. **Grading System Setup** ⭐ **[READY TO TEST]**
- **URL:** `http://localhost:8080/school-admin/grading`
- **Endpoints:**
  - `POST /api/onboarding/step/5` - Configure grading system
- **Purpose:** Set up grading scale

### 6. **Students List** ⭐ **[READY TO TEST]**
- **URL:** `http://localhost:8080/school-admin/students`
- **Endpoints:**
  - `POST /api/onboarding/step/6` - Upload student CSV
  - `GET /api/csv/template` - Get CSV template
  - `POST /api/csv/validate` - Validate CSV
  - `POST /api/csv/preview` - Preview CSV data
- **Purpose:** View & manage all students

### 7. **Student Profile** ⭐ **[READY TO TEST - VERIFIED]**
- **URL:** `http://localhost:8080/school-admin/student-profile?id=<studentId>`
- **Endpoints:** (Layout ready - specific student lookup pending)
- **Features:**
  - ✅ Personal information display (name, email, admission #)
  - ✅ Contact details (phone, address, parent email)
  - ✅ Academic details (class, gender, date of birth)
  - ✅ Performance metrics (GPA, average score, total score)
  - ✅ Subject-wise score breakdown
  - ✅ Comparison with class averages
  - ✅ Parent/Guardian information
  - ✅ Quick action buttons (Edit, View Results, Message Parent)
- **Purpose:** View comprehensive individual student profile
- **Test Steps:**
  1. Click on student from Students List
  2. Verify all student information displays correctly
  3. Check subject scores table with grades
  4. Verify comparison with class averages (positive/negative)
  5. Click action buttons → Confirmation dialogs appear

### 8. **Results Entry** ⭐ **[READY TO TEST]**
- **URL:** `http://localhost:8080/school-admin/results-entry`
- **Endpoints:**
  - `POST /api/results` - Submit student results
  - `GET /api/results` - Get results
  - `PATCH /api/results/:resultId` - Update result
- **Purpose:** Teachers enter student results

### 9. **Results Publishing** ⭐ **[READY TO TEST]**
- **URL:** `http://localhost:8080/school-admin/publishing`
- **Endpoints:**
  - `POST /api/results/publish` - Publish results
  - `GET /api/results/published` - Get published results
- **Purpose:** Approve & publish results

### 10. **Analytics Dashboard** ⭐ **[READY TO TEST]**
- **URL:** `http://localhost:8080/school-admin/analytics`
- **Endpoints:**
  - `GET /api/analytics/school-dashboard` - School analytics
  - `GET /api/analytics/at-risk-students` - At-risk students
  - `GET /api/analytics/subjects` - Subject analytics
  - `GET /api/analytics/compare-classes` - Class comparison
- **Purpose:** View detailed performance analytics

### 11. **Leaderboard Management** ⭐ **[READY TO TEST - VERIFIED]**
- **URL:** `http://localhost:8080/school-admin/leaderboard`
- **Endpoints:** (Layout ready - leaderboard API pending)
- **Features:**
  - ✅ Top performers leaderboard
  - ✅ Filter by class/subject
  - ✅ Display options (Show/Hide)
  - ✅ Rank and score display
  - ✅ Leaderboard visibility toggle
- **Purpose:** Manage student leaderboard and performance rankings
- **Test Steps:**
  1. Navigate to Leaderboard page
  2. Filter by class → See top performers
  3. Filter by subject → Rankings update
  4. Toggle visibility → Should save preference
  5. Export leaderboard → CSV or PDF download

### 12. **Parent Accounts Management** ⭐ **[READY TO TEST]**
- **URL:** `http://localhost:8080/school-admin/parents`
- **Endpoints:**
  - `GET /api/school/teachers` - List parents (for school)
  - `POST /api/school/teachers/bulk/invite` - Bulk invite parents
  - `PATCH /api/school/teachers/:parentId/status` - Toggle parent status
  - `DELETE /api/school/teachers/:parentId` - Delete parent
- **Purpose:** Manage parent accounts for school

### 13. **Teachers Management** ⭐ **[READY TO TEST - NEW]**
- **URL:** `http://localhost:8080/school-admin/teachers`
- **Endpoints:**
  - `GET /api/school/teachers` - List teachers (with pagination, search, filters)
  - `GET /api/school/teachers/:teacherId` - Get teacher details
  - `POST /api/school/teachers` - Create new teacher
  - `PATCH /api/school/teachers/:teacherId` - Update teacher
  - `PATCH /api/school/teachers/:teacherId/assign-class` - Assign class to teacher
  - `PATCH /api/school/teachers/:teacherId/assign-subject` - Assign subject to teacher
  - `PATCH /api/school/teachers/:teacherId/status` - Toggle teacher status
  - `DELETE /api/school/teachers/:teacherId` - Delete teacher
  - `POST /api/school/teachers/bulk/invite` - Bulk invite teachers (CSV or email list)
  - `PATCH /api/school/teachers/:teacherId/permissions` - Update teacher permissions
- **Features:**
  - ✅ Real-time teacher search (name, email)
  - ✅ Filter by status (ACTIVE, SUSPENDED, PENDING)
  - ✅ Pagination (20 per page)
  - ✅ Display stats: Total, Active, Assigned Classes
  - ✅ Assign class dropdown selector
  - ✅ Assign subject dropdown selector
  - ✅ Bulk invite with CSV or manual email entry
  - ✅ Permission modal with 6 teacher permissions:
    - ENTER_RESULTS
    - VIEW_RESULTS
    - MANAGE_CLASS
    - UPLOAD_GRADES
    - VIEW_ANALYTICS
    - EDIT_PROFILE
  - ✅ Status toggle (eye icon - ACTIVE/SUSPENDED)
  - ✅ Delete teacher (trash icon)
- **Test Steps:**
  1. Load page → See teachers list with stats
  2. Search for teacher by name/email
  3. Filter by status
  4. Click "Bulk Invite" → Upload CSV with email+subject columns
  5. Assign class from dropdown
  6. Assign subject from dropdown
  7. Click security icon → Select teacher permissions
  8. Click eye icon → Toggle status between ACTIVE/SUSPENDED
  9. Click trash icon → Delete teacher

### 14. **School Settings** ⭐ **[READY TO TEST]**
- **URL:** `http://localhost:8080/school-admin/settings`
- **Endpoints:**
  - `PATCH /api/onboarding/school-profile` - Update school profile
  - `POST /api/onboarding/logo-upload` - Upload school logo
- **Purpose:** Configure school settings

### 15. **Billing & Subscription** ⭐ **[READY TO TEST]**
- **URL:** `http://localhost:8080/school-admin/billing`
- **Endpoints:**
  - `GET /api/payment/subscriptions` - Get subscription status
  - `POST /api/payment/initiate` - Initiate payment
- **Purpose:** Manage school subscription & billing

### 16. **School Admin Profile** ⭐ **[READY TO TEST]**
- **URL:** `http://localhost:8080/school-admin/profile`
- **Endpoints:**
  - `POST /api/auth/change-password` - Change password
- **Purpose:** Profile & account settings

### 17. **School Admin Notifications** ⭐ **[READY TO TEST]**
- **URL:** `http://localhost:8080/school-admin/notifications`
- **Endpoints:** Same as SuperAdmin
- **Purpose:** View school-specific notifications

### 18. **Results Setup Wizard** ⭐ **[READY TO TEST]**
- **URL:** `http://localhost:8080/school-admin/results-setup`
- **Endpoints:**
  - `POST /api/results-setup/initialize` - Initialize results setup
  - `POST /api/results-setup/configure-instances` - Configure result instances
  - `POST /api/onboarding/mark-results-setup-complete` - Mark setup as complete
- **Purpose:** First-time results setup configuration

---

## 🎯 Support Agent Dashboard

### 1. **Support Agent Dashboard**
- **URL:** `http://localhost:8080/support-agent/dashboard`
- **Endpoints:**
  - `GET /api/support/tickets` - List assigned tickets
  - `GET /api/support/tickets/:id` - Get ticket details
  - `POST /api/support/tickets/:id/messages` - Reply to ticket
- **Purpose:** Support agent workspace

---

## 🔔 Global Pages

### 1. **Notifications**
- **URL:** `http://localhost:8080/notifications`
- **Endpoints:**
  - `GET /api/notifications` - Get all notifications
  - `GET /api/notifications/count/unread` - Get unread count
  - `DELETE /api/notifications/:id` - Delete notification
  - `DELETE /api/notifications/clear/all` - Clear all
- **Purpose:** Global notification center

---

## 👤 Test Credentials

### SuperAdmin Account (Pre-Created)
```
Email:    superadmin@resultspro.ng
Password: superadmin_password_123
Role:     SUPER_ADMIN
```

### Sample Seeded Users (45 Support Staff)
All with password: `Test@123456`

**Support Staff Emails:**
```
support1@resultspro.ng
support2@resultspro.ng
support3@resultspro.ng
(... 45 total - check database for full list)
```

### Sample School Admin Accounts (3)
```
1. school1@example.com (Password: School123!)
2. school2@example.com (Password: School123!)
3. school3@example.com (Password: School123!)
```

### Sample Agent Accounts (10)
```
agent1@example.com - agent10@example.com
(Password varies per user - check database)
```

### Sample Parent Accounts (30)
```
parent1@example.com - parent30@example.com
(Password varies per user - check database)
```

---

## 🧪 Testing Checklist

### Phase 1: Authentication
- [ ] Login with SuperAdmin → Redirect to /super-admin/overview
- [ ] Login with SchoolAdmin → Redirect to /school-admin/overview
- [ ] Invalid credentials → Error message
- [ ] Password reset → Email sent & token verification
- [ ] Token refresh → New JWT issued

### Phase 2: SuperAdmin User Management (NEW)
- [ ] **Agents Management**
  - [ ] Load agents page → List displays correctly
  - [ ] Search agents by name/email → Results filter
  - [ ] Filter by status/tier → Works correctly
  - [ ] Bulk invite with CSV → Agents created
  - [ ] Bulk invite manual → Agents created
  - [ ] Manage permissions → Permissions saved
  - [ ] Toggle status → Status updated
  - [ ] Delete agent → Agent removed

- [ ] **Support Staff Management**
  - [ ] Load staff page → List displays
  - [ ] Search by name/email/department → Filters work
  - [ ] Change permission level dropdown → Saves immediately
  - [ ] Bulk invite CSV → Staff created
  - [ ] Bulk invite manual → Staff created
  - [ ] Manage permissions → Granular permissions saved
  - [ ] Toggle status → Status updated
  - [ ] Delete staff → Staff removed

### Phase 3: SchoolAdmin User Management (NEW)
- [ ] **Teachers Management**
  - [ ] Load teachers page → List displays
  - [ ] Search by name/email → Filters work
  - [ ] Filter by status → Correct filtering
  - [ ] Assign class → Class assigned correctly
  - [ ] Assign subject → Subject assigned correctly
  - [ ] Bulk invite CSV → Teachers created with subject
  - [ ] Bulk invite manual → Teachers created
  - [ ] Manage permissions → All 6 permissions selectable
  - [ ] Toggle status → Status toggle works
  - [ ] Delete teacher → Teacher removed

### Phase 4: Email Management System (NEW)
- [ ] **Email Campaign Management**
  - [ ] Navigate to `/super-admin/email-management`
  - [ ] View dashboard with campaign stats
  - [ ] Create new email campaign (DRAFT)
  - [ ] Fill campaign form (name, subject, body, recipients)
  - [ ] Select recipient segment (ALL, SCHOOLS, BLOG)
  - [ ] Save campaign → Status is DRAFT
  - [ ] Edit campaign → Update content
  - [ ] Publish/Send campaign → Status changes to SENDING then SENT
  - [ ] Delete draft campaign
  - [ ] Verify sent count increments

- [ ] **Subscriber Management**
  - [ ] View subscribers list (pagination)
  - [ ] Add single subscriber (email, name, source)
  - [ ] Upload CSV file with subscribers
  - [ ] Search/filter subscribers by status (active/inactive)
  - [ ] Toggle subscriber status (Active/Inactive)
  - [ ] Delete subscriber from list
  - [ ] Verify email uniqueness validation

- [ ] **Email Inbox**
  - [ ] View inbox with emails from S3
  - [ ] Click email → Parse and display content
  - [ ] Verify email metadata (from, to, date, subject)
  - [ ] Check attachments display (if any)
  - [ ] Mark email as read → Status updates

- [ ] **Email Templates**
  - [ ] View saved email templates
  - [ ] Create new template (name, subject, body)
  - [ ] Use template in campaign
  - [ ] Add template variables ({{unsubscribe_link}}, {{subscriber_name}})

- [ ] **Analytics & Compliance**
  - [ ] View campaign stats (sent, delivered, opened, clicked)
  - [ ] Verify unsubscribe links in emails
  - [ ] Click unsubscribe link → Subscriber deactivated
  - [ ] Confirm unsubscribe token validation

### Phase 5: Blog Management System (NEW)
- [ ] **CMS Dashboard**
  - [ ] Navigate to `/super-admin/blog-management`
  - [ ] View dashboard stats cards (posts, published, drafts, categories, comments, likes)
  - [ ] Verify top 5 posts displayed by view count
  - [ ] Check real-time stat updates

- [ ] **Blog Post Management**
  - [ ] Click "New Post" button
  - [ ] Fill post form (title, slug, category, author, excerpt, content)
  - [ ] Create post → Defaults to DRAFT status
  - [ ] Verify post appears in posts list
  - [ ] Click edit icon → Update post content
  - [ ] Save changes → Post updates
  - [ ] Click publish icon → Status changes to PUBLISHED
  - [ ] Verify published date is set
  - [ ] Delete draft post → Removed from list

- [ ] **Category Management**
  - [ ] Click "New Category" button
  - [ ] Fill category form (name, slug, description, color)
  - [ ] Create category → Appears in grid
  - [ ] Try delete category with posts → Error message appears
  - [ ] Delete empty category → Succeeds

- [ ] **Blog Comment Moderation**
  - [ ] View pending comments for posts
  - [ ] Approve comment → Status changes, appears on blog
  - [ ] Reject comment → Marked as rejected
  - [ ] Delete comment → Removed from queue

- [ ] **Public Blog Testing**
  - [ ] Navigate to `/blog` (public blog list)
  - [ ] Verify published posts display in grid
  - [ ] Click category filter → Posts filter correctly
  - [ ] Use search bar → Filters by title/excerpt
  - [ ] Pagination works (next/previous buttons)
  - [ ] Click post → Navigate to single post view
  - [ ] View full article content
  - [ ] Like button → Increments like count
  - [ ] Like again → Decrements (toggle)
  - [ ] Submit comment form → Pending approval message
  - [ ] View approved comments below article
  - [ ] Share button → Opens share options
  - [ ] Back button → Returns to blog list

### Phase 6: School Management
- [ ] School verifications → Load pending schools
- [ ] Approve/reject schools → Status updated
- [ ] View school details → Details display correctly

### Phase 7: Results Management
- [ ] Upload student CSV → Data imported
- [ ] Enter results → Results saved
- [ ] Publish results → Results published
- [ ] View analytics → Charts display

### Phase 8: Scratch Cards
- [ ] Generate batch → Codes created
- [ ] Assign to school → Assignment works
- [ ] Validate code → Results display
- [ ] Export codes → CSV generated

---

## 🐛 Bug Reporting Template

When testing, if you encounter issues:

```
## Bug Report
**Screen:** [Screen name]
**URL:** http://localhost:8080/path
**API Endpoint:** [Endpoint that failed]
**Issue:** [Description]
**Steps to Reproduce:**
1. ...
2. ...
3. ...
**Expected:** [What should happen]
**Actual:** [What actually happened]
**Error:** [Any console error]
```

---

## 📝 Notes

- All SuperAdmin routes are protected by `ProtectedSuperAdminRoute` component
- All SchoolAdmin routes use `SchoolAdminLayout` wrapper
- API responses follow pattern: `{ success: boolean, data?: any, pagination?: {...}, error?: string }`
- Pagination uses 20 items per page by default
- Search is case-insensitive
- Bulk operations support both CSV file upload and manual email entry
- Permission modals use checkbox selectors for granular control

---

**Last Updated:** March 1, 2026
**Status:** Ready for comprehensive testing of user management features
