# Multi-School Management - API & Code Examples

## Quick Start API Testing

### 1. Get Network Overview

```bash
# Get comprehensive network statistics
curl -X GET http://localhost:5000/api/admin/schools/overview \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Response Example**:
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

### 2. Get Schools List with Filters

```bash
# Get first 20 active schools
curl -X GET "http://localhost:5000/api/admin/schools/list?status=ACTIVE&limit=20&offset=0" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Search schools by name
curl -X GET "http://localhost:5000/api/admin/schools/list?search=Academy" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Filter by subscription status
curl -X GET "http://localhost:5000/api/admin/schools/list?subscriptionStatus=ACTIVE" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response Example**:
```json
{
  "success": true,
  "data": [
    {
      "id": "cly85a0km0000kw0h5f3k9b1c",
      "name": "Excellence Academy",
      "status": "ACTIVE",
      "studentCount": 450,
      "staffCount": 25,
      "subscription": {
        "planName": "Enterprise",
        "status": "ACTIVE",
        "startDate": "2024-01-15T00:00:00.000Z",
        "endDate": "2025-01-15T00:00:00.000Z"
      },
      "createdAt": "2023-06-10T10:30:00.000Z"
    }
  ],
  "pagination": {
    "total": 22,
    "limit": 20,
    "offset": 0
  }
}
```

### 3. Get Network Analytics

```bash
# Get analytics for last 6 months
curl -X GET "http://localhost:5000/api/admin/schools/analytics?months=6" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get analytics filtered by plan
curl -X GET "http://localhost:5000/api/admin/schools/analytics?months=12&planId=PLAN_ID_HERE" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. Get Financial Dashboard

```bash
# Get financial data for last 12 months
curl -X GET "http://localhost:5000/api/admin/schools/financial?months=12" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response Example**:
```json
{
  "success": true,
  "data": {
    "revenueByPlan": [
      {
        "planId": "cly85a0km0000kw0h5f3k9b1c",
        "_sum": { "totalAmount": 5000000 },
        "_count": 25
      }
    ],
    "revenueBySchool": [
      {
        "schoolId": "school_123",
        "_sum": { "totalAmount": 500000 }
      }
    ],
    "invoiceStats": [
      {
        "status": "PAID",
        "_count": 85
      },
      {
        "status": "ISSUED",
        "_count": 15
      }
    ],
    "paymentIssues": [
      {
        "invoiceNumber": "INV-ABC123-00001",
        "schoolName": "Excellence Academy",
        "totalAmount": 50000,
        "dueDate": "2025-02-15T00:00:00.000Z",
        "daysOverdue": 5
      }
    ]
  }
}
```

### 5. Get Network Staff

```bash
# Get all staff across network
curl -X GET "http://localhost:5000/api/admin/schools/staff?limit=50&offset=0" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get staff filtered by plan
curl -X GET "http://localhost:5000/api/admin/schools/staff?planId=PLAN_ID&limit=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 6. Get Network Alerts

```bash
# Get all active alerts
curl -X GET http://localhost:5000/api/admin/schools/alerts \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response Example**:
```json
{
  "success": true,
  "data": {
    "totalAlerts": 8,
    "critical": 2,
    "warnings": 6,
    "alerts": [
      {
        "id": "overdue-inv123",
        "type": "PAYMENT_OVERDUE",
        "severity": "CRITICAL",
        "schoolName": "Excellence Academy",
        "message": "Invoice INV-ABC123-00001 is overdue",
        "amount": 50000,
        "dueDate": "2025-02-15T00:00:00.000Z"
      },
      {
        "id": "expiring-sub456",
        "type": "SUBSCRIPTION_EXPIRING",
        "severity": "WARNING",
        "schoolName": "Bright Stars School",
        "message": "Subscription expires in 5 days",
        "dueDate": "2025-03-05T00:00:00.000Z"
      },
      {
        "id": "limit-school789",
        "type": "USAGE_LIMIT",
        "severity": "WARNING",
        "schoolName": "Premier Academy",
        "message": "School using 85% of student limit",
        "percentage": 85
      }
    ]
  }
}
```

### 7. Perform Bulk Actions

```bash
# Downgrade a school to free plan
curl -X POST http://localhost:5000/api/admin/schools/SCHOOL_ID/bulk-action \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "DOWNGRADE_PLAN"
  }'

# Suspend a school
curl -X POST http://localhost:5000/api/admin/schools/SCHOOL_ID/bulk-action \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "SUSPEND_SCHOOL"
  }'

# Sync settings to a school
curl -X POST http://localhost:5000/api/admin/schools/SCHOOL_ID/bulk-action \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "SYNC_SETTINGS",
    "data": {
      "primaryColor": "#0066cc",
      "secondaryColor": "#00cc66"
    }
  }'
```

## Frontend Usage Examples

### React Component Integration

```typescript
// Fetch overview data
const fetchOverview = async () => {
  try {
    const response = await axios.get('/api/admin/schools/overview');
    setOverview(response.data.data);
  } catch (error) {
    console.error('Failed to fetch overview:', error);
    toast({
      title: 'Error',
      description: 'Failed to load network overview',
      variant: 'destructive'
    });
  }
};

// Fetch schools with filters
const fetchSchools = async (filter: string, search: string) => {
  try {
    const response = await axios.get('/api/admin/schools/list', {
      params: {
        status: filter,
        search: search,
        limit: 50,
        offset: 0
      }
    });
    setSchools(response.data.data);
  } catch (error) {
    console.error('Failed to fetch schools:', error);
  }
};

// Fetch alerts
const fetchAlerts = async () => {
  try {
    const response = await axios.get('/api/admin/schools/alerts');
    setAlerts(response.data.data.alerts);
  } catch (error) {
    console.error('Failed to fetch alerts:', error);
  }
};
```

### TypeScript Interfaces

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
  status: 'ACTIVE' | 'PENDING_VERIFICATION' | 'REJECTED' | 'SUSPENDED';
  studentCount: number;
  staffCount: number;
  subscription: {
    planName: string;
    status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
    startDate: Date;
    endDate: Date;
  } | null;
  createdAt: Date;
}

interface Alert {
  id: string;
  type: 'SUBSCRIPTION_EXPIRING' | 'PAYMENT_OVERDUE' | 'USAGE_LIMIT';
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  schoolName: string;
  message: string;
  dueDate?: Date;
  amount?: number;
  percentage?: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}
```

## Advanced Examples

### Pagination Implementation

```typescript
const [schools, setSchools] = useState<School[]>([]);
const [total, setTotal] = useState(0);
const [currentPage, setCurrentPage] = useState(0);
const ITEMS_PER_PAGE = 20;

const handleNextPage = async () => {
  const newOffset = (currentPage + 1) * ITEMS_PER_PAGE;
  const response = await axios.get('/api/admin/schools/list', {
    params: {
      limit: ITEMS_PER_PAGE,
      offset: newOffset
    }
  });
  setSchools(response.data.data);
  setTotal(response.data.pagination.total);
  setCurrentPage(currentPage + 1);
};
```

### Search with Debounce

```typescript
import { useCallback } from 'react';

const [searchTerm, setSearchTerm] = useState('');
const [searchResults, setSearchResults] = useState<School[]>([]);

const debouncedSearch = useCallback(
  debounce(async (term: string) => {
    if (term.length < 2) return;
    
    const response = await axios.get('/api/admin/schools/list', {
      params: { search: term }
    });
    setSearchResults(response.data.data);
  }, 300),
  []
);

const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
  const term = e.target.value;
  setSearchTerm(term);
  debouncedSearch(term);
};
```

### Real-time Alert Monitoring

```typescript
useEffect(() => {
  // Initial fetch
  fetchAlerts();

  // Refresh every 30 seconds
  const interval = setInterval(fetchAlerts, 30000);

  return () => clearInterval(interval);
}, []);

// Separate critical alerts from warnings
const criticalAlerts = alerts.filter(a => a.severity === 'CRITICAL');
const warnings = alerts.filter(a => a.severity === 'WARNING');

// Display critical alerts prominently
return (
  <>
    {criticalAlerts.length > 0 && (
      <AlertBanner type="error" count={criticalAlerts.length}>
        {criticalAlerts.map(alert => (
          <AlertItem key={alert.id} alert={alert} />
        ))}
      </AlertBanner>
    )}
  </>
);
```

### Export to CSV

```typescript
const exportSchools = async () => {
  const response = await axios.get('/api/admin/schools/list?limit=1000');
  const schools = response.data.data;

  const csv = [
    ['Name', 'Status', 'Students', 'Staff', 'Plan', 'Expires'].join(','),
    ...schools.map(s =>
      [
        s.name,
        s.status,
        s.studentCount,
        s.staffCount,
        s.subscription?.planName || 'None',
        s.subscription?.endDate || ''
      ].join(',')
    )
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `schools-${new Date().toISOString()}.csv`;
  a.click();
};
```

## Error Handling Best Practices

```typescript
const handleApiError = (error: any) => {
  if (error.response?.status === 401) {
    // Unauthorized - redirect to login
    window.location.href = '/auth/login';
  } else if (error.response?.status === 403) {
    // Forbidden - insufficient permissions
    toast({
      title: 'Access Denied',
      description: 'You do not have permission to access this feature',
      variant: 'destructive'
    });
  } else if (error.response?.status === 404) {
    // Not found - endpoint doesn't exist
    toast({
      title: 'Error',
      description: 'Resource not found',
      variant: 'destructive'
    });
  } else if (error.response?.status >= 500) {
    // Server error
    toast({
      title: 'Server Error',
      description: 'Please try again later',
      variant: 'destructive'
    });
  } else {
    // Network error
    toast({
      title: 'Network Error',
      description: error.message || 'Failed to connect to server',
      variant: 'destructive'
    });
  }
};
```

## Performance Tips

1. **Use Pagination**: Always use limit/offset for large datasets
2. **Filter Early**: Use status/plan filters at API level
3. **Cache Results**: Store fetched data in state and refresh on intervals
4. **Lazy Load Tabs**: Only fetch data when tab is activated
5. **Debounce Search**: Wait 300ms before making search request
6. **Parallel Requests**: Use Promise.all for multiple API calls

## Debugging

```typescript
// Enable debug logging
const fetchWithLogging = async (url: string, params?: any) => {
  console.time(`API Request: ${url}`);
  try {
    const response = await axios.get(url, { params });
    console.log(`Response for ${url}:`, response.data);
    console.timeEnd(`API Request: ${url}`);
    return response.data;
  } catch (error) {
    console.error(`Error for ${url}:`, error);
    console.timeEnd(`API Request: ${url}`);
    throw error;
  }
};
```
