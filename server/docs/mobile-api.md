# Mobile API Documentation

This document outlines the API endpoints available for the native mobile applications (iOS and Android) for technicians.

## Base URL

All API endpoints are relative to: `/api/mobile/v1`

## Authentication

### Login
- **Endpoint**: `POST /auth/login`
- **Description**: Authenticates a user and returns a JWT token
- **Request Body**:
  ```json
  {
    "email": "string",
    "password": "string",
    "deviceId": "string",
    "deviceType": "ios|android"
  }
  ```
- **Response**:
  ```json
  {
    "accessToken": "string",
    "refreshToken": "string",
    "user": {
      "id": "number",
      "name": "string",
      "email": "string",
      "role": "string",
      "companyId": "number"
    }
  }
  ```

### Refresh Token
- **Endpoint**: `POST /auth/refresh`
- **Description**: Gets a new access token using a refresh token
- **Request Body**:
  ```json
  {
    "refreshToken": "string"
  }
  ```
- **Response**:
  ```json
  {
    "accessToken": "string"
  }
  ```

### Logout
- **Endpoint**: `POST /auth/logout`
- **Description**: Invalidates the current token
- **Headers**: 
  - Authorization: Bearer {token}
- **Response**: 204 No Content

## Check-ins

### Create Check-in
- **Endpoint**: `POST /check-ins`
- **Description**: Creates a new check-in
- **Headers**: 
  - Authorization: Bearer {token}
- **Request Body**:
  ```json
  {
    "jobType": "string",
    "customerName": "string",
    "customerEmail": "string",
    "customerPhone": "string",
    "address": "string",
    "city": "string",
    "state": "string",
    "zipCode": "string",
    "notes": "string",
    "latitude": "string",
    "longitude": "string",
    "photoIds": ["string"]
  }
  ```
- **Response**:
  ```json
  {
    "id": "number",
    "jobType": "string",
    "customerName": "string",
    "createdAt": "string",
    "status": "string"
  }
  ```

### Get Check-in History
- **Endpoint**: `GET /check-ins`
- **Description**: Gets a list of check-ins for the technician
- **Headers**: 
  - Authorization: Bearer {token}
- **Query Parameters**:
  - page: number (default: 1)
  - limit: number (default: 20)
  - startDate: string (ISO date format)
  - endDate: string (ISO date format)
- **Response**:
  ```json
  {
    "items": [
      {
        "id": "number",
        "jobType": "string",
        "customerName": "string",
        "address": "string",
        "createdAt": "string",
        "status": "string",
        "thumbnail": "string"
      }
    ],
    "total": "number",
    "page": "number",
    "limit": "number"
  }
  ```

### Get Check-in Details
- **Endpoint**: `GET /check-ins/{id}`
- **Description**: Gets detailed information about a specific check-in
- **Headers**: 
  - Authorization: Bearer {token}
- **Response**:
  ```json
  {
    "id": "number",
    "jobType": "string",
    "customerName": "string",
    "customerEmail": "string",
    "customerPhone": "string",
    "address": "string",
    "city": "string",
    "state": "string",
    "zipCode": "string",
    "notes": "string",
    "latitude": "string",
    "longitude": "string",
    "createdAt": "string",
    "status": "string",
    "photos": [
      {
        "id": "string",
        "url": "string",
        "thumbnailUrl": "string",
        "type": "before|after|other"
      }
    ]
  }
  ```

## Photo Upload

### Upload Photo
- **Endpoint**: `POST /photos`
- **Description**: Uploads a photo and returns a photo ID
- **Headers**: 
  - Authorization: Bearer {token}
- **Request**: multipart/form-data
  - file: The photo file
  - type: "before|after|other" (photo category)
- **Response**:
  ```json
  {
    "id": "string",
    "url": "string",
    "thumbnailUrl": "string"
  }
  ```

## Offline Synchronization

### Sync Data
- **Endpoint**: `POST /sync`
- **Description**: Synchronizes local data with the server
- **Headers**: 
  - Authorization: Bearer {token}
- **Request Body**:
  ```json
  {
    "checkIns": [
      {
        "localId": "string",
        "jobType": "string",
        "customerName": "string",
        "customerEmail": "string",
        "customerPhone": "string",
        "address": "string",
        "city": "string",
        "state": "string",
        "zipCode": "string",
        "notes": "string",
        "latitude": "string",
        "longitude": "string",
        "createdAt": "string",
        "photos": [
          {
            "localId": "string",
            "base64Data": "string",
            "type": "before|after|other"
          }
        ]
      }
    ]
  }
  ```
- **Response**:
  ```json
  {
    "syncedItems": [
      {
        "localId": "string",
        "serverId": "number",
        "status": "synced|error",
        "errorMessage": "string"
      }
    ]
  }
  ```

## Notifications

### Register Device for Push Notifications
- **Endpoint**: `POST /notifications/register`
- **Description**: Registers a device for push notifications
- **Headers**: 
  - Authorization: Bearer {token}
- **Request Body**:
  ```json
  {
    "deviceToken": "string",
    "deviceType": "ios|android"
  }
  ```
- **Response**: 204 No Content

### Get Notification History
- **Endpoint**: `GET /notifications`
- **Description**: Gets notification history for the user
- **Headers**: 
  - Authorization: Bearer {token}
- **Query Parameters**:
  - page: number (default: 1)
  - limit: number (default: 20)
- **Response**:
  ```json
  {
    "items": [
      {
        "id": "number",
        "title": "string",
        "message": "string",
        "type": "string",
        "read": "boolean",
        "createdAt": "string",
        "data": {
          "checkInId": "number",
          "customerId": "number"
        }
      }
    ],
    "total": "number",
    "page": "number",
    "limit": "number"
  }
  ```

## Profile

### Get Technician Profile
- **Endpoint**: `GET /profile`
- **Description**: Gets the technician's profile information
- **Headers**: 
  - Authorization: Bearer {token}
- **Response**:
  ```json
  {
    "id": "number",
    "name": "string",
    "email": "string",
    "phone": "string",
    "specialty": "string",
    "company": {
      "id": "number",
      "name": "string"
    },
    "stats": {
      "totalCheckIns": "number",
      "thisMonth": "number",
      "rating": "number"
    }
  }
  ```

### Update Profile
- **Endpoint**: `PUT /profile`
- **Description**: Updates the technician's profile
- **Headers**: 
  - Authorization: Bearer {token}
- **Request Body**:
  ```json
  {
    "name": "string",
    "phone": "string",
    "password": "string",
    "currentPassword": "string"
  }
  ```
- **Response**:
  ```json
  {
    "id": "number",
    "name": "string",
    "email": "string",
    "phone": "string",
    "specialty": "string"
  }
  ```

## Error Responses

All endpoints may return the following error responses:

- **400 Bad Request**: Invalid input
- **401 Unauthorized**: Authentication required or invalid token
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **500 Server Error**: Server-side error

Error response format:
```json
{
  "message": "string",
  "code": "string",
  "details": "object"
}
```