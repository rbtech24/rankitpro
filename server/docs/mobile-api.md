# Rank It Pro Mobile API Documentation

This document outlines the API endpoints available for the Rank It Pro native mobile applications.

**Base URL**: `/api/mobile/v1`

**Authentication**: JWT-based with refresh tokens

## Authentication Endpoints

### Login

```
POST /auth/login
```

**Request Body**:
```json
{
  "email": "technician@example.com",
  "password": "password123",
  "deviceId": "device-uuid-123",
  "deviceType": "ios" // or "android"
}
```

**Response** (200 OK):
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 123,
    "name": "John Technician",
    "email": "technician@example.com",
    "role": "technician",
    "companyId": 456
  }
}
```

### Refresh Token

```
POST /auth/refresh
```

**Request Body**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response** (200 OK):
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Logout

```
POST /auth/logout
```

**Headers**:
```
Authorization: Bearer <access_token>
```

**Response** (204 No Content)

### Get Profile

```
GET /profile
```

**Headers**:
```
Authorization: Bearer <access_token>
```

**Response** (200 OK):
```json
{
  "id": 123,
  "name": "John Technician",
  "email": "technician@example.com",
  "phone": "555-123-4567",
  "specialty": "Plumbing",
  "company": {
    "id": 456,
    "name": "ABC Services"
  },
  "stats": {
    "totalCheckIns": 253,
    "thisMonth": 18,
    "rating": 4.8
  }
}
```

## Check-In Endpoints

### Get All Check-Ins

```
GET /check-ins
```

**Query Parameters**:
- `status` - Filter by status ('completed', 'pending')
- `startDate` - Filter for check-ins after this date (ISO format)
- `endDate` - Filter for check-ins before this date (ISO format)
- `page` - Page number for pagination (default: 1)
- `limit` - Number of items per page (default: 20)

**Headers**:
```
Authorization: Bearer <access_token>
```

**Response** (200 OK):
```json
{
  "total": 253,
  "page": 1,
  "limit": 20,
  "totalPages": 13,
  "items": [
    {
      "id": 789,
      "jobType": "Repair",
      "customerName": "Jane Smith",
      "address": "123 Main St",
      "createdAt": "2025-05-18T15:30:00Z",
      "photos": [
        {
          "url": "/uploads/checkins/checkin-1621345678-123456789.jpg"
        }
      ],
      "notes": "Fixed leaking faucet"
    },
    // More check-ins...
  ]
}
```

### Get Check-In Details

```
GET /check-ins/:id
```

**Headers**:
```
Authorization: Bearer <access_token>
```

**Response** (200 OK):
```json
{
  "id": 789,
  "jobType": "Repair",
  "customerName": "Jane Smith",
  "customerEmail": "jane@example.com",
  "customerPhone": "555-987-6543",
  "address": "123 Main St",
  "city": "Anytown",
  "state": "CA",
  "zipCode": "12345",
  "latitude": "37.7749",
  "longitude": "-122.4194",
  "notes": "Fixed leaking faucet in main bathroom. Replaced washer and O-ring.",
  "workPerformed": "Replaced faucet washer and O-ring",
  "materialsUsed": "1x washer kit, 2x O-rings",
  "isBillable": true,
  "followUpRequired": false,
  "createdAt": "2025-05-18T15:30:00Z",
  "completedAt": "2025-05-18T16:45:00Z",
  "photos": [
    {
      "url": "/uploads/checkins/checkin-1621345678-123456789.jpg"
    },
    {
      "url": "/uploads/checkins/checkin-1621345678-987654321.jpg"
    }
  ]
}
```

### Create Check-In

```
POST /check-ins
```

**Headers**:
```
Authorization: Bearer <access_token>
```

**Request Body**:
```json
{
  "jobType": "Installation",
  "notes": "Installed new water heater",
  "customerName": "Bob Johnson",
  "customerEmail": "bob@example.com",
  "customerPhone": "555-234-5678",
  "workPerformed": "Installed 50 gallon water heater",
  "materialsUsed": "1x 50gal water heater, copper pipes, solder",
  "location": {
    "latitude": 37.7749,
    "longitude": -122.4194,
    "addressText": "456 Oak St, Anytown, CA 12345"
  },
  "isBillable": true,
  "followUpRequired": false,
  "offlineId": "local-123456789" // For offline sync
}
```

**Response** (201 Created):
```json
{
  "id": 790,
  "jobType": "Installation",
  "customerName": "Bob Johnson",
  "customerEmail": "bob@example.com",
  "customerPhone": "555-234-5678",
  "workPerformed": "Installed 50 gallon water heater",
  "materialsUsed": "1x 50gal water heater, copper pipes, solder",
  "address": "456 Oak St, Anytown, CA 12345",
  "latitude": "37.7749",
  "longitude": "-122.4194",
  "isBillable": true,
  "followUpRequired": false,
  "createdAt": "2025-05-19T09:15:00Z",
  "photos": [],
  "message": "Check-in created successfully. Use the upload endpoint to add photos."
}
```

### Upload Photos

```
POST /check-ins/:id/photos
```

**Headers**:
```
Authorization: Bearer <access_token>
```

**Form Data**:
```
photos: [File1, File2, ...]
```

**Response** (200 OK):
```json
{
  "message": "Photos uploaded successfully",
  "photos": [
    {
      "url": "/uploads/checkins/checkin-1621345678-123456789.jpg"
    },
    {
      "url": "/uploads/checkins/checkin-1621345678-987654321.jpg"
    }
  ]
}
```

### Update Check-In

```
PUT /check-ins/:id
```

**Headers**:
```
Authorization: Bearer <access_token>
```

**Request Body**:
```json
{
  "notes": "Updated notes about the job",
  "followUpRequired": true
}
```

**Response** (200 OK):
```json
{
  "id": 790,
  "jobType": "Installation",
  "notes": "Updated notes about the job",
  "followUpRequired": true,
  // Other check-in fields...
}
```

### Mark Check-In as Completed

```
PATCH /check-ins/:id/complete
```

**Headers**:
```
Authorization: Bearer <access_token>
```

**Response** (200 OK):
```json
{
  "id": 790,
  "completedAt": "2025-05-19T10:30:00Z",
  // Other check-in fields...
}
```

### Delete Photo from Check-In

```
DELETE /check-ins/:id/photos/:photoName
```

**Headers**:
```
Authorization: Bearer <access_token>
```

**Response** (200 OK):
```json
{
  "message": "Photo deleted successfully",
  "remainingPhotos": [
    {
      "url": "/uploads/checkins/checkin-1621345678-987654321.jpg"
    }
  ]
}
```

### Delete Check-In

```
DELETE /check-ins/:id
```

**Headers**:
```
Authorization: Bearer <access_token>
```

**Response** (204 No Content)

### Bulk Sync Check-Ins

```
POST /check-ins/sync
```

**Headers**:
```
Authorization: Bearer <access_token>
```

**Request Body**:
```json
{
  "checkIns": [
    {
      "offlineId": "local-123456789",
      "jobType": "Maintenance",
      "customerName": "Alice Williams",
      "notes": "Regular HVAC maintenance",
      "location": {
        "latitude": 37.7749,
        "longitude": -122.4194,
        "addressText": "789 Pine St, Anytown, CA 12345"
      }
    },
    {
      "id": 791, // Existing check-in to update
      "notes": "Updated notes from offline"
    }
  ]
}
```

**Response** (200 OK):
```json
{
  "sync": {
    "total": 2,
    "success": 2,
    "errors": 0
  },
  "results": {
    "success": [
      {
        "id": 792,
        "offlineId": "local-123456789",
        "action": "created"
      },
      {
        "id": 791,
        "offlineId": null,
        "action": "updated"
      }
    ],
    "errors": []
  }
}
```

## Schedule Endpoints

### Get Today's Schedule

```
GET /schedule/today
```

**Headers**:
```
Authorization: Bearer <access_token>
```

**Response** (200 OK):
```json
{
  "date": "2025-05-19",
  "items": [
    {
      "id": 123,
      "title": "HVAC Installation",
      "description": "Install new HVAC system",
      "startTime": "2025-05-19T09:00:00Z",
      "endTime": "2025-05-19T12:00:00Z",
      "location": "123 Main St, Anytown, CA 12345",
      "customerName": "John Doe",
      "customerPhone": "555-123-4567",
      "status": "scheduled",
      "priority": "high"
    },
    // More schedule items...
  ]
}
```

### Get Schedule for Date Range

```
GET /schedule
```

**Query Parameters**:
- `startDate` - Start date for the range (ISO format)
- `endDate` - End date for the range (ISO format)

**Headers**:
```
Authorization: Bearer <access_token>
```

**Response** (200 OK):
```json
{
  "startDate": "2025-05-19",
  "endDate": "2025-05-26",
  "schedule": {
    "2025-05-19": [
      {
        "id": 123,
        "title": "HVAC Installation",
        "startTime": "2025-05-19T09:00:00Z"
        // Other schedule item fields...
      }
    ],
    "2025-05-20": [
      // Items for this date...
    ]
    // More dates...
  }
}
```

### Get Schedule Item Details

```
GET /schedule/:id
```

**Headers**:
```
Authorization: Bearer <access_token>
```

**Response** (200 OK):
```json
{
  "id": 123,
  "title": "HVAC Installation",
  "description": "Install new HVAC system for the Smith family",
  "startTime": "2025-05-19T09:00:00Z",
  "endTime": "2025-05-19T12:00:00Z",
  "location": "123 Main St, Anytown, CA 12345",
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "555-123-4567",
  "jobType": "Installation",
  "status": "scheduled",
  "priority": "high",
  "notes": "Customer has requested a quiet system"
}
```

### Create Schedule Item

```
POST /schedule
```

**Headers**:
```
Authorization: Bearer <access_token>
```

**Request Body**:
```json
{
  "title": "Plumbing Repair",
  "description": "Fix leaking bathroom sink",
  "startTime": "2025-05-21T14:00:00Z",
  "endTime": "2025-05-21T16:00:00Z",
  "location": "456 Oak St, Anytown, CA 12345",
  "customerName": "Jane Smith",
  "customerPhone": "555-987-6543",
  "jobType": "Repair",
  "priority": "medium"
}
```

**Response** (201 Created):
```json
{
  "id": 124,
  "title": "Plumbing Repair",
  "description": "Fix leaking bathroom sink",
  "startTime": "2025-05-21T14:00:00Z",
  "endTime": "2025-05-21T16:00:00Z",
  "location": "456 Oak St, Anytown, CA 12345",
  "customerName": "Jane Smith",
  "customerPhone": "555-987-6543",
  "jobType": "Repair",
  "status": "scheduled",
  "priority": "medium",
  "createdAt": "2025-05-19T10:15:00Z"
}
```

### Update Schedule Item

```
PUT /schedule/:id
```

**Headers**:
```
Authorization: Bearer <access_token>
```

**Request Body**:
```json
{
  "description": "Updated description",
  "priority": "high"
}
```

**Response** (200 OK):
```json
{
  "id": 124,
  "description": "Updated description",
  "priority": "high",
  // Other schedule item fields...
}
```

### Update Schedule Item Status

```
PATCH /schedule/:id/status
```

**Headers**:
```
Authorization: Bearer <access_token>
```

**Request Body**:
```json
{
  "status": "in_progress"
}
```

**Response** (200 OK):
```json
{
  "id": 124,
  "status": "in_progress",
  // Other schedule item fields...
}
```

### Delete Schedule Item

```
DELETE /schedule/:id
```

**Headers**:
```
Authorization: Bearer <access_token>
```

**Response** (204 No Content)

## Customer Management Endpoints

### Get All Customers

```
GET /customers
```

**Query Parameters**:
- `search` - Search term for filtering (searches name, email, phone, address)
- `sort` - Sort by ('name' or 'recent')
- `page` - Page number for pagination (default: 1)
- `limit` - Number of items per page (default: 20)

**Headers**:
```
Authorization: Bearer <access_token>
```

**Response** (200 OK):
```json
{
  "total": 157,
  "page": 1,
  "limit": 20,
  "items": [
    {
      "id": 456,
      "name": "Jane Smith",
      "email": "jane@example.com",
      "phone": "555-987-6543",
      "address": "456 Oak St",
      "city": "Anytown",
      "state": "CA",
      "zipCode": "12345",
      "createdAt": "2025-01-15T12:30:00Z",
      "updatedAt": "2025-05-10T09:45:00Z",
      "checkInCount": 5
    },
    // More customers...
  ]
}
```

### Get Customer Details

```
GET /customers/:id
```

**Headers**:
```
Authorization: Bearer <access_token>
```

**Response** (200 OK):
```json
{
  "id": 456,
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "555-987-6543",
  "address": "456 Oak St",
  "city": "Anytown",
  "state": "CA",
  "zipCode": "12345",
  "notes": "Prefers afternoon appointments",
  "tags": ["residential", "repeat-customer"],
  "createdAt": "2025-01-15T12:30:00Z",
  "updatedAt": "2025-05-10T09:45:00Z",
  "checkIns": [
    {
      "id": 789,
      "jobType": "Repair",
      "date": "2025-05-18T15:30:00Z",
      "technicianId": 123,
      "notes": "Fixed leaking faucet"
    }
    // More check-ins...
  ],
  "reviews": [
    {
      "id": 321,
      "rating": 5,
      "feedback": "Great service, very professional!",
      "date": "2025-05-18T18:45:00Z",
      "technicianId": 123
    }
    // More reviews...
  ]
}
```

### Create Customer

```
POST /customers
```

**Headers**:
```
Authorization: Bearer <access_token>
```

**Request Body**:
```json
{
  "name": "Bob Johnson",
  "email": "bob@example.com",
  "phone": "555-234-5678",
  "address": "789 Pine St",
  "city": "Anytown",
  "state": "CA",
  "zipCode": "12345",
  "notes": "New customer, referred by Jane Smith",
  "tags": ["commercial", "new-customer"]
}
```

**Response** (201 Created):
```json
{
  "id": 457,
  "name": "Bob Johnson",
  "email": "bob@example.com",
  "phone": "555-234-5678",
  "address": "789 Pine St",
  "city": "Anytown",
  "state": "CA",
  "zipCode": "12345",
  "notes": "New customer, referred by Jane Smith",
  "tags": ["commercial", "new-customer"],
  "createdAt": "2025-05-19T11:20:00Z",
  "updatedAt": "2025-05-19T11:20:00Z"
}
```

### Update Customer

```
PUT /customers/:id
```

**Headers**:
```
Authorization: Bearer <access_token>
```

**Request Body**:
```json
{
  "phone": "555-876-5432",
  "notes": "Updated notes about this customer"
}
```

**Response** (200 OK):
```json
{
  "id": 457,
  "phone": "555-876-5432",
  "notes": "Updated notes about this customer",
  // Other customer fields...
}
```

### Search Customers

```
GET /customers/search/:query
```

**Headers**:
```
Authorization: Bearer <access_token>
```

**Response** (200 OK):
```json
[
  {
    "id": 456,
    "name": "Jane Smith",
    "email": "jane@example.com",
    "phone": "555-987-6543"
    // Other customer fields...
  },
  // More matching customers...
]
```

### Get Customer History

```
GET /customers/:id/history
```

**Headers**:
```
Authorization: Bearer <access_token>
```

**Response** (200 OK):
```json
{
  "customerId": 456,
  "customerName": "Jane Smith",
  "history": [
    {
      "id": 789,
      "type": "check-in",
      "date": "2025-05-18T15:30:00Z",
      "jobType": "Repair",
      "technician": "John Technician",
      "technicianId": 123,
      "notes": "Fixed leaking faucet",
      "location": "456 Oak St, Anytown, CA 12345"
    },
    // More history items...
  ]
}
```

## Notification Endpoints

### Get All Notifications

```
GET /notifications
```

**Query Parameters**:
- `unreadOnly` - Show only unread notifications (true/false)
- `type` - Filter by notification type ('info', 'success', 'warning', 'error')
- `page` - Page number for pagination (default: 1)
- `limit` - Number of items per page (default: 20)

**Headers**:
```
Authorization: Bearer <access_token>
```

**Response** (200 OK):
```json
{
  "total": 15,
  "unread": 3,
  "page": 1,
  "limit": 20,
  "items": [
    {
      "id": 12345,
      "title": "New Schedule Item",
      "message": "You have a new job scheduled for tomorrow at 10:00 AM.",
      "type": "info",
      "priority": "high",
      "data": {
        "scheduleItemId": 123,
        "jobType": "Maintenance",
        "location": "123 Main St",
        "time": "10:00 AM"
      },
      "read": false,
      "createdAt": "2025-05-18T16:30:00Z"
    },
    // More notifications...
  ]
}
```

### Get Notification Details

```
GET /notifications/:id
```

**Headers**:
```
Authorization: Bearer <access_token>
```

**Response** (200 OK):
```json
{
  "id": 12345,
  "title": "New Schedule Item",
  "message": "You have a new job scheduled for tomorrow at 10:00 AM.",
  "type": "info",
  "priority": "high",
  "data": {
    "scheduleItemId": 123,
    "jobType": "Maintenance",
    "location": "123 Main St",
    "time": "10:00 AM"
  },
  "read": false,
  "createdAt": "2025-05-18T16:30:00Z"
}
```

### Mark Notification as Read

```
PATCH /notifications/:id/read
```

**Headers**:
```
Authorization: Bearer <access_token>
```

**Response** (200 OK):
```json
{
  "id": 12345,
  "read": true,
  // Other notification fields...
}
```

### Mark All Notifications as Read

```
POST /notifications/mark-all-read
```

**Headers**:
```
Authorization: Bearer <access_token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

### Delete Notification

```
DELETE /notifications/:id
```

**Headers**:
```
Authorization: Bearer <access_token>
```

**Response** (204 No Content)

### Get Unread Count

```
GET /notifications/unread/count
```

**Headers**:
```
Authorization: Bearer <access_token>
```

**Response** (200 OK):
```json
{
  "count": 3
}
```

### Register Device for Push Notifications

```
POST /notifications/register-device
```

**Headers**:
```
Authorization: Bearer <access_token>
```

**Request Body**:
```json
{
  "token": "device-push-token-123456789",
  "platform": "ios" // or "android"
}
```

**Response** (200 OK):
```json
{
  "success": true
}
```

## Settings Endpoints

### Get Settings

```
GET /settings
```

**Headers**:
```
Authorization: Bearer <access_token>
```

**Response** (200 OK):
```json
{
  "theme": "dark",
  "notificationsEnabled": true,
  "soundEnabled": true,
  "vibrationEnabled": true,
  "autoLocationCapture": true,
  "photoQuality": "high",
  "photosPerCheckIn": 5,
  "listViewMode": "detailed",
  "dateFormat": "MM/DD/YYYY",
  "timeFormat": "12h",
  "autoSync": true,
  "syncOnWifiOnly": true,
  "backgroundSync": true,
  "customSignature": "John Smith",
  "defaultNotes": "Technician: John Smith"
}
```

### Update Settings

```
PUT /settings
```

**Headers**:
```
Authorization: Bearer <access_token>
```

**Request Body**:
```json
{
  "theme": "light",
  "photoQuality": "medium",
  "syncOnWifiOnly": false
}
```

**Response** (200 OK):
```json
{
  "theme": "light",
  "photoQuality": "medium",
  "syncOnWifiOnly": false,
  // Other settings fields...
}
```

### Reset Settings

```
POST /settings/reset
```

**Headers**:
```
Authorization: Bearer <access_token>
```

**Response** (200 OK):
```json
{
  "theme": "system",
  "notificationsEnabled": true,
  // Other default settings...
}
```

### Get Job Type Presets

```
GET /settings/job-types
```

**Headers**:
```
Authorization: Bearer <access_token>
```

**Response** (200 OK):
```json
[
  {
    "id": 1,
    "name": "Installation",
    "color": "#4caf50",
    "icon": "wrench"
  },
  {
    "id": 2,
    "name": "Repair",
    "color": "#f44336",
    "icon": "tools"
  },
  // More job types...
]
```

### Get Sync Status

```
GET /settings/sync-status
```

**Headers**:
```
Authorization: Bearer <access_token>
```

**Response** (200 OK):
```json
{
  "lastSync": "2025-05-19T11:30:00Z",
  "status": "success",
  "pendingItems": 0,
  "syncHistory": [
    {
      "id": 1,
      "timestamp": "2025-05-19T11:30:00Z",
      "status": "success",
      "itemsProcessed": 5
    },
    // More sync history items...
  ]
}
```

## Error Responses

All endpoints may return the following error responses:

- **400 Bad Request** - Invalid request or validation error
- **401 Unauthorized** - Missing or invalid authentication
- **403 Forbidden** - Permission denied
- **404 Not Found** - Resource not found
- **500 Server Error** - Internal server error

Example error response:
```json
{
  "message": "Invalid check-in ID"
}
```