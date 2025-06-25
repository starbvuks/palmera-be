# Palmera Notifications API Demo Examples

This document provides practical examples for using the Palmera Notifications API endpoints.

## Base URL
```
https://z421qustb7.execute-api.us-east-1.amazonaws.com
```

## Authentication
Most endpoints require Bearer token authentication. Include the token in the Authorization header:
```bash
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 1. Create Notification

### Create a new notification for a user
```bash
curl -X POST https://z421qustb7.execute-api.us-east-1.amazonaws.com/notifications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "userId": "user-123e4567-e89b-12d3-a456-426614174000",
    "type": "booking",
    "title": "Booking Confirmed",
    "message": "Your booking for Cozy Downtown Apartment has been confirmed!",
    "priority": "high",
    "metadata": {
      "bookingId": "booking-123e4567-e89b-12d3-a456-426614174000",
      "propertyId": "prop-123e4567-e89b-12d3-a456-426614174000"
    }
  }'
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "message": "Notification created successfully",
    "NotificationData": {
      "_id": "notif-123e4567-e89b-12d3-a456-426614174000",
      "userId": "user-123e4567-e89b-12d3-a456-426614174000",
      "type": "booking",
      "title": "Booking Confirmed",
      "message": "Your booking for Cozy Downtown Apartment has been confirmed!",
      "isSystemNotification": false,
      "read": false,
      "priority": "high",
      "metadata": {
        "bookingId": "booking-123e4567-e89b-12d3-a456-426614174000",
        "propertyId": "prop-123e4567-e89b-12d3-a456-426614174000"
      },
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

### Create a system-wide notification
```bash
curl -X POST https://z421qustb7.execute-api.us-east-1.amazonaws.com/notifications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "userId": "system",
    "type": "system",
    "title": "System Maintenance",
    "message": "Scheduled maintenance will occur on January 20th from 2-4 AM EST.",
    "isSystemNotification": true,
    "priority": "medium"
  }'
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "message": "Notification created successfully",
    "NotificationData": {
      "_id": "notif-987fcdeb-51a2-43d1-b789-123456789abc",
      "userId": "system",
      "type": "system",
      "title": "System Maintenance",
      "message": "Scheduled maintenance will occur on January 20th from 2-4 AM EST.",
      "isSystemNotification": true,
      "read": false,
      "priority": "medium",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

### Error Responses

**Validation Error (400):**
```bash
curl -X POST https://z421qustb7.execute-api.us-east-1.amazonaws.com/notifications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "userId": "user-123e4567-e89b-12d3-a456-426614174000",
    "title": "Booking Confirmed"
  }'
```

**Response (400):**
```json
{
  "success": false,
  "error": "Validation error: message is required"
}
```

**Invalid JSON (400):**
```bash
curl -X POST https://z421qustb7.execute-api.us-east-1.amazonaws.com/notifications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d 'invalid json'
```

**Response (400):**
```json
{
  "success": false,
  "error": "Invalid JSON in request body"
}
```

---

## 2. Get User Notifications

### Retrieve all notifications for a user (query parameter)
```bash
curl -X GET "https://z421qustb7.execute-api.us-east-1.amazonaws.com/notifications?userId=user-123e4567-e89b-12d3-a456-426614174000" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Retrieve all notifications for a user (path parameter)
```bash
curl -X GET https://z421qustb7.execute-api.us-east-1.amazonaws.com/notifications/user/user-123e4567-e89b-12d3-a456-426614174000 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "_id": "notif-123e4567-e89b-12d3-a456-426614174000",
        "userId": "user-123e4567-e89b-12d3-a456-426614174000",
        "type": "booking",
        "title": "Booking Confirmed",
        "message": "Your booking for Cozy Downtown Apartment has been confirmed!",
        "isSystemNotification": false,
        "read": false,
        "priority": "high",
        "metadata": {
          "bookingId": "booking-123e4567-e89b-12d3-a456-426614174000",
          "propertyId": "prop-123e4567-e89b-12d3-a456-426614174000"
        },
        "createdAt": "2024-01-15T10:30:00.000Z"
      },
      {
        "_id": "notif-987fcdeb-51a2-43d1-b789-123456789abc",
        "userId": "system",
        "type": "system",
        "title": "System Maintenance",
        "message": "Scheduled maintenance will occur on January 20th from 2-4 AM EST.",
        "isSystemNotification": true,
        "read": false,
        "priority": "medium",
        "createdAt": "2024-01-15T09:00:00.000Z"
      }
    ],
    "count": 2,
    "message": "User notifications retrieved successfully"
  }
}
```

### Error Responses

**No Notifications Found (404):**
```bash
curl -X GET "https://z421qustb7.execute-api.us-east-1.amazonaws.com/notifications?userId=user-nonexistent" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (404):**
```json
{
  "success": false,
  "error": "No notifications found for this user"
}
```

**Invalid User ID (400):**
```bash
curl -X GET "https://z421qustb7.execute-api.us-east-1.amazonaws.com/notifications?userId=" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (400):**
```json
{
  "success": false,
  "error": "User ID is required"
}
```

---

## 3. Get Notification Details

### Retrieve specific notification details
```bash
curl -X GET https://z421qustb7.execute-api.us-east-1.amazonaws.com/notifications/notif-123e4567-e89b-12d3-a456-426614174000 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "notification": {
      "_id": "notif-123e4567-e89b-12d3-a456-426614174000",
      "userId": "user-123e4567-e89b-12d3-a456-426614174000",
      "type": "booking",
      "title": "Booking Confirmed",
      "message": "Your booking for Cozy Downtown Apartment has been confirmed!",
      "isSystemNotification": false,
      "read": false,
      "priority": "high",
      "metadata": {
        "bookingId": "booking-123e4567-e89b-12d3-a456-426614174000",
        "propertyId": "prop-123e4567-e89b-12d3-a456-426614174000"
      },
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    "message": "Notification retrieved successfully"
  }
}
```

### Error Responses

**Notification Not Found (404):**
```bash
curl -X GET https://z421qustb7.execute-api.us-east-1.amazonaws.com/notifications/nonexistent-notif \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (404):**
```json
{
  "success": false,
  "error": "Notification not found"
}
```

---

## 4. Update Notification

### Mark notification as read
```bash
curl -X PUT https://z421qustb7.execute-api.us-east-1.amazonaws.com/notifications/notif-123e4567-e89b-12d3-a456-426614174000 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "read": true
  }'
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Notification updated successfully",
    "notification": {
      "_id": "notif-123e4567-e89b-12d3-a456-426614174000",
      "userId": "user-123e4567-e89b-12d3-a456-426614174000",
      "type": "booking",
      "title": "Booking Confirmed",
      "message": "Your booking for Cozy Downtown Apartment has been confirmed!",
      "isSystemNotification": false,
      "read": true,
      "priority": "high",
      "metadata": {
        "bookingId": "booking-123e4567-e89b-12d3-a456-426614174000",
        "propertyId": "prop-123e4567-e89b-12d3-a456-426614174000"
      },
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T11:00:00.000Z"
    }
  }
}
```

### Update notification priority
```bash
curl -X PUT https://z421qustb7.execute-api.us-east-1.amazonaws.com/notifications/notif-123e4567-e89b-12d3-a456-426614174000 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "priority": "urgent"
  }'
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Notification updated successfully",
    "notification": {
      "_id": "notif-123e4567-e89b-12d3-a456-426614174000",
      "userId": "user-123e4567-e89b-12d3-a456-426614174000",
      "type": "booking",
      "title": "Booking Confirmed",
      "message": "Your booking for Cozy Downtown Apartment has been confirmed!",
      "isSystemNotification": false,
      "read": true,
      "priority": "urgent",
      "metadata": {
        "bookingId": "booking-123e4567-e89b-12d3-a456-426614174000",
        "propertyId": "prop-123e4567-e89b-12d3-a456-426614174000"
      },
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T11:15:00.000Z"
    }
  }
}
```

---

## 5. Delete Notification

### Delete a specific notification
```bash
curl -X DELETE https://z421qustb7.execute-api.us-east-1.amazonaws.com/notifications/notif-123e4567-e89b-12d3-a456-426614174000 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Notification deleted successfully",
    "notificationId": "notif-123e4567-e89b-12d3-a456-426614174000"
  }
}
```

### Error Responses

**Notification Not Found (404):**
```bash
curl -X DELETE https://z421qustb7.execute-api.us-east-1.amazonaws.com/notifications/nonexistent-notif \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (404):**
```json
{
  "success": false,
  "error": "Notification not found"
}
```

---

## 6. Mark Multiple Notifications as Read

### Mark multiple notifications as read
```bash
curl -X POST https://z421qustb7.execute-api.us-east-1.amazonaws.com/notifications/bulk/read \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "userId": "user-123e4567-e89b-12d3-a456-426614174000",
    "notificationIds": [
      "notif-123e4567-e89b-12d3-a456-426614174000",
      "notif-987fcdeb-51a2-43d1-b789-123456789abc"
    ]
  }'
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Notifications marked as read successfully",
    "updatedCount": 2
  }
}
```

---

## Common Error Responses

### Database Connection Failed (503)
```json
{
  "success": false,
  "error": "Database connection failed"
}
```

### Internal Server Error (500)
```json
{
  "success": false,
  "error": "Internal server error"
}
```

### Invalid JSON (400)
```json
{
  "success": false,
  "error": "Invalid JSON in request body"
}
```

---

## Testing with Postman

### Environment Variables
Set up these environment variables in Postman:
- `base_url`: `https://z421qustb7.execute-api.us-east-1.amazonaws.com`
- `auth_token`: Your JWT token

### Collection Setup
1. Create a new collection called "Palmera Notifications API"
2. Set the Authorization type to "Bearer Token" at the collection level
3. Use `{{auth_token}}` as the token value
4. Set the base URL to `{{base_url}}`

### Request Examples

**Create Notification:**
- Method: POST
- URL: `{{base_url}}/notifications`
- Headers: `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "userId": "user-123e4567-e89b-12d3-a456-426614174000",
  "type": "booking",
  "title": "Booking Confirmed",
  "message": "Your booking has been confirmed!",
  "priority": "high",
  "metadata": {
    "bookingId": "booking-123e4567-e89b-12d3-a456-426614174000"
  }
}
```

**Get User Notifications:**
- Method: GET
- URL: `{{base_url}}/notifications/user/user-123e4567-e89b-12d3-a456-426614174000`

**Get Notification Details:**
- Method: GET
- URL: `{{base_url}}/notifications/notif-123e4567-e89b-12d3-a456-426614174000`

**Update Notification:**
- Method: PUT
- URL: `{{base_url}}/notifications/notif-123e4567-e89b-12d3-a456-426614174000`
- Body (raw JSON):
```json
{
  "read": true
}
```

**Delete Notification:**
- Method: DELETE
- URL: `{{base_url}}/notifications/notif-123e4567-e89b-12d3-a456-426614174000`

**Mark Multiple as Read:**
- Method: POST
- URL: `{{base_url}}/notifications/bulk/read`
- Body (raw JSON):
```json
{
  "userId": "user-123e4567-e89b-12d3-a456-426614174000",
  "notificationIds": [
    "notif-123e4567-e89b-12d3-a456-426614174000",
    "notif-987fcdeb-51a2-43d1-b789-123456789abc"
  ]
}
```

---

## Rate Limiting
- 100 requests per minute per user
- 1000 requests per hour per user

## Best Practices
1. Use appropriate notification types for better categorization
2. Set priority levels based on notification importance
3. Include relevant metadata for context
4. Implement read/unread status tracking
5. Use system notifications sparingly
6. Handle notification deletion carefully
7. Implement bulk operations for better performance 