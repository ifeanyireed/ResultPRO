# Multi-School Management System - Implementation Guide

## Overview

The Multi-School Management System is a comprehensive enterprise feature that allows super admins to manage and monitor all schools in the network from a single dashboard. This feature is exclusively available to Enterprise subscribers and super admin users.

## Access

- **Route**: `/enterprise/multi-school`
- **Required Role**: SUPER_ADMIN
- **Required Subscription**: Enterprise plan subscriber
- **Protection**: ProtectedSuperAdminRoute wrapper

## Backend API Endpoints

All endpoints are prefixed with `/api/admin/schools` and require authentication via `authMiddleware`.

### 1. Network Overview Statistics
**Endpoint**: `GET /api/admin/schools/overview`

Returns comprehensive network-wide statistics including:
- Total schools and active schools count
- Total students and teachers across network
- Active subscriptions breakdown
- Enterprise plan adoption
- Total revenue from subscriptions
- Average metrics per school

**Response**:
```json
{
  "success": true,
  "data": {
    "totalSchools": 25,
    "activeSchools": 22,
    "inactiveSchools": 3,
    "totalStudents": 15000,
    "totalTeachers": 450,
    "activeSubscriptions": 18,
    "enterpriseSubscriptions": 5,
    "totalRevenue": 2500000,
    "averageStudentsPerSchool": 682,
    "averageTeachersPerSchool": 20
  }
}
```

### 2. Schools List with Filtering
**Endpoint**: `GET /api/admin/schools/list`

Retrieves paginated list of schools with filtering capabilities.

**Query Parameters**:
- `status` (string): Filter by school status (ACTIVE, PENDING_VERIFICATION, etc.)
- `subscriptionStatus` (string): Filter by subscription status (ACTIVE, EXPIRED, CANCELLED)
- `search` (string): Search schools by name
- `limit` (number): Results per page (default: 50)
- `offset` (number): Pagination offset (default: 0)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "school_id_123",
      "name": "Excellence Academy",
      "status": "ACTIVE",
      "studentCount": 450,
      "staffCount": 25,
      "subscription": {
        "planName": "Enterprise",
        "status": "ACTIVE",
        "startDate": "2024-01-15T00:00:00Z",
        "endDate": "2025-01-15T00:00:00Z"
      },
      "createdAt": "2023-06-10T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 25,
    "limit": 50,
    "offset": 0
  }
}
```

### 3. Network Analytics
**Endpoint**: `GET /api/admin/schools/analytics`

Retrieves consolidated analytics across all schools.

**Query Parameters**:
- `months` (number): Lookback period in months (default: 6)
- `planId` (string): Filter by specific plan ID

**Response**:
```json
{
  "success": true,
  "data": {
    "resultsByPlan": [
      {
        "planId": "plan_123",
        "_count": 15
      }
    ],
    "studentProgressByPlan": [
      {
        "id": "school_123",
        "name": "School Name"
      }
    ],
    "topPerformingSchools": [
      {
        "schoolId": "school_123",
        "_count": 450
      }
    ]
  }
}
```

### 4. Financial Dashboard
**Endpoint**: `GET /api/admin/schools/financial`

Retrieves financial data for revenue tracking and payment monitoring.

**Query Parameters**:
- `months` (number): Lookback period in months (default: 12)
- `planId` (string): Filter by specific plan ID

**Response**:
```json
{
  "success": true,
  "data": {
    "revenueByPlan": [
      {
        "planId": "plan_123",
        "_sum": { "totalAmount": 500000 },
        "_count": 10
      }
    ],
    "revenueBySchool": [
      {
        "schoolId": "school_123",
        "_sum": { "totalAmount": 125000 }
      }
    ],
    "invoiceStats": [
      {
        "status": "PAID",
        "_count": 85
      }
    ],
    "paymentIssues": [
      {
        "invoiceNumber": "INV-ABC123-00001",
        "schoolName": "Excellence Academy",
        "totalAmount": 50000,
        "dueDate": "2025-02-15T00:00:00Z",
        "daysOverdue": 5
      }
    ]
  }
}
```

### 5. Network Staff Management
**Endpoint**: `GET /api/admin/schools/staff`

Retrieves staff across all schools with filtering.

**Query Parameters**:
- `planId` (string): Filter staff by specific plan
- `limit` (number): Results per page (default: 50)
- `offset` (number): Pagination offset (default: 0)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "user_123",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@school.edu",
      "role": "TEACHER",
      "schoolName": "Excellence Academy",
      "createdAt": "2024-01-15T00:00:00Z"
    }
  ],
  "pagination": {
    "total": 450,
    "limit": 50,
    "offset": 0
  }
}
```

### 6. Network Alerts & Notifications
**Endpoint**: `GET /api/admin/schools/alerts`

Retrieves system alerts for critical issues across the network.

**Alert Types**:
- `SUBSCRIPTION_EXPIRING`: School subscription expires within 7 days (WARNING)
- `PAYMENT_OVERDUE`: Invoice is overdue (CRITICAL)
- `USAGE_LIMIT`: School approaching or exceeding student limits (WARNING/CRITICAL)

**Response**:
```json
{
  "success": true,
  "data": {
    "totalAlerts": 8,
    "critical": 2,
    "warnings": 6,
    "alerts": [
      {
        "id": "critical-123",
        "type": "SUBSCRIPTION_EXPIRING",
        "severity": "WARNING",
        "schoolName": "Excellence Academy",
        "message": "Subscription expires in 5 days",
        "dueDate": "2025-03-05T00:00:00Z"
      }
    ]
  }
}
```

### 7. Bulk Actions on Schools
**Endpoint**: `POST /api/admin/schools/:schoolId/bulk-action`

Perform administrative actions on schools.

**Body Parameters**:
```json
{
  "action": "SYNC_SETTINGS" | "DOWNGRADE_PLAN" | "SUSPEND_SCHOOL",
  "data": {
    // Action-specific data
  }
}
```

**Supported Actions**:
1. `SYNC_SETTINGS`: Update school settings (requires `data` with settings)
2. `DOWNGRADE_PLAN`: Downgrade school to free plan
3. `SUSPEND_SCHOOL`: Suspend school operations

**Response**:
```json
{
  "success": true,
  "data": {
    "message": "Action completed successfully"
  }
}
```

## Frontend Component Structure

### MultiSchoolDashboard (Main Component)
- **Location**: `src/pages/MultiSchoolDashboard.tsx`
- **Size**: 450+ lines
- **Features**:
  - Tabbed interface with 5 main sections
  - Real-time data fetching with parallel API calls
  - Loading states and error handling
  - Search and filter capabilities
  - Export functionality

### Tab Sections

#### 1. Overview Tab
Displays network statistics with:
- KPI cards (Total Schools, Students, Revenue, etc.)
- Health metrics with progress bars
- Subscription adoption rates
- Visual indicators for network status

#### 2. Schools Tab
Features:
- Searchable schools list
- Filter by status and subscription
- Pagination support
- Quick action buttons
- Export to CSV functionality
- Displays school status, student count, staff count, plan name

#### 3. Analytics Tab (Coming Soon)
Will include:
- Consolidated performance metrics
- Results distribution by plan
- Top performing schools
- Schools needing support
- Trend analysis over time

#### 4. Financial Tab (Coming Soon)
Will include:
- Revenue tracking by plan and school
- Invoice management
- Payment issue identification
- Financial forecasting
- Revenue trend charts

#### 5. Staff Tab (Coming Soon)
Will include:
- Network-wide staff directory
- Staff management tools
- Role-based filtering
- Staff performance metrics
- Bulk staff operations

## Frontend State Management

```typescript
interface NetworkOverview {
  totalSchools: number;
  activeSchools: number;
  inactiveSchools: number;
  totalStudents: number;
  totalTeachers: number;
  activeSubscriptions: number;
  enterpriseSubscriptions: number;
  totalRevenue: number;
  averageStudentsPerSchool: number;
  averageTeachersPerSchool: number;
}

interface School {
  id: string;
  name: string;
  status: string;
  studentCount: number;
  staffCount: number;
  subscription: {
    planName: string;
    status: string;
    startDate: Date;
    endDate: Date;
  } | null;
  createdAt: Date;
}

interface Alert {
  id: string;
  type: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  schoolName: string;
  message: string;
  dueDate?: Date;
}
```

## Integration Points

### Authentication & Authorization
- All endpoints protected by `authMiddleware`
- Requires SUPER_ADMIN role for access to full features
- Frontend uses `ProtectedSuperAdminRoute` wrapper

### Data Sources
- **School Data**: `prisma.school` model
- **Subscription Data**: `prisma.subscription` model
- **Invoice Data**: `prisma.invoice` model
- **Staff Data**: `prisma.schoolAdminUser` model
- **Student Data**: `prisma.student` model

### Real-time Features
- Parallel API calls on component mount (Promise.all)
- 10-second refresh interval can be configured
- Loading states for better UX
- Error boundaries with toast notifications

## Security Considerations

1. **Role-Based Access**: Only SUPER_ADMIN users can access
2. **School Isolation**: Data queries are open system-wide (super admin access)
3. **Input Validation**: All query parameters validated before use
4. **Error Handling**: Sensitive errors logged but not exposed to client
5. **Bulk Actions**: Destructive actions (downgrade, suspend) require super admin role

## Performance Optimization

1. **Pagination**: Schools list returns 50 schools per page by default
2. **Query Optimization**: Uses `select` and `include` to fetch only needed fields
3. **Grouping**: Analytics data grouped by plan for efficient aggregation
4. **Caching**: Can be implemented via React Query (already integrated in project)
5. **Lazy Loading**: Additional tabs load data only when activated

## Future Enhancements

1. **Real-time Updates**: WebSocket integration for live alerts
2. **Advanced Filtering**: Multi-select filters, date range filters
3. **Custom Reports**: Report builder with export options
4. **Automated Actions**: Auto-downgrade schools at subscription end
5. **Analytics Dashboard**: Graphical representation of trends
6. **Staff Management UI**: Complete staff directory with bulk operations
7. **Email Notifications**: Alert super admins to critical issues
8. **Audit Logging**: Track all admin actions for compliance

## Testing

### Manual Testing Checklist
- [ ] Access `/enterprise/multi-school` with super admin account
- [ ] Verify overview statistics load correctly
- [ ] Test schools list pagination
- [ ] Search schools by name
- [ ] Filter by status
- [ ] Check alert panel displays issues
- [ ] Verify export functionality
- [ ] Test error handling (disconnect API, invalid filter)

### API Testing with cURL

```bash
# Get Overview
curl -X GET http://localhost:5000/api/admin/schools/overview \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get Schools List
curl -X GET "http://localhost:5000/api/admin/schools/list?limit=10&offset=0" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get Network Alerts
curl -X GET http://localhost:5000/api/admin/schools/alerts \
  -H "Authorization: Bearer YOUR_TOKEN"

# Downgrade School
curl -X POST http://localhost:5000/api/admin/schools/school_id_123/bulk-action \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action":"DOWNGRADE_PLAN"}'
```

## Troubleshooting

### APIs Returning 404
- Verify backend is running on port 5000
- Check routing is registered in `backend/src/app.ts`
- Ensure `authMiddleware` is properly configured

### Missing Data
- Verify schools and subscriptions exist in database
- Check subscription status is 'ACTIVE' for current subscriptions
- Ensure student counts are updated in database

### Performance Issues
- Reduce limit parameter for large datasets
- Implement pagination for schools list
- Consider database indexes on frequently filtered columns

## File Structure

```
Backend:
- backend/src/modules/super-admin/controllers/admin-schools.controller.ts (600+ lines)
- backend/src/modules/super-admin/routes/admin-schools.routes.ts (30 lines)
- backend/src/app.ts (updated with new routes)

Frontend:
- src/pages/MultiSchoolDashboard.tsx (450+ lines)
- src/App.tsx (updated with new route)
```

## Support & Maintenance

For issues or questions:
1. Check error logs in backend console
2. Verify database connectivity
3. Ensure all migrations are applied
4. Check network requests in browser DevTools
5. Review API response structure matches expected schema
