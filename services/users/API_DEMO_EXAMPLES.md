# Palmera Users API Demo Examples

This document provides practical examples for using the Palmera Users API endpoints.

## Base URL
```
https://ct4rgp2633.execute-api.us-east-1.amazonaws.com
```

## Authentication
Most endpoints require Bearer token authentication. Include the token in the Authorization header:
```bash
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 1. Get User Profile

### Retrieve a user's complete profile
```bash
curl -X GET https://ct4rgp2633.execute-api.us-east-1.amazonaws.com/users/user-123e4567-e89b-12d3-a456-426614174000 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "user-123e4567-e89b-12d3-a456-426614174000",
      "personalInfo": {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com",
        "phone": "+1234567890",
        "dateOfBirth": "1990-01-01",
        "address": {
          "street": "123 Main St",
          "city": "New York",
          "state": "NY",
          "zipCode": "10001",
          "country": "USA"
        }
      },
      "accountStatus": {
        "status": "active",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      },
      "roles": {
        "isHost": false
      },
      "preferences": {
        "notifications": {
          "email": true,
          "push": true,
          "sms": false
        },
        "privacy": {
          "profileVisibility": "public",
          "showEmail": false,
          "showPhone": false
        },
        "language": "en",
        "currency": "USD",
        "timezone": "America/New_York"
      }
    },
    "message": "User retrieved successfully"
  }
}
```

### Error Responses

**User Not Found (404):**
```bash
curl -X GET https://ct4rgp2633.execute-api.us-east-1.amazonaws.com/users/nonexistent-user \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (404):**
```json
{
  "success": false,
  "error": "User not found"
}
```

**Invalid User ID (400):**
```bash
curl -X GET https://ct4rgp2633.execute-api.us-east-1.amazonaws.com/users/ \
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

## 2. Update User Profile

### Update user's personal information
```bash
curl -X PUT https://ct4rgp2633.execute-api.us-east-1.amazonaws.com/users/user-123e4567-e89b-12d3-a456-426614174000 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane.smith@example.com",
    "phone": "+1987654321",
    "address": {
      "street": "456 Oak Ave",
      "city": "Los Angeles",
      "state": "CA",
      "zipCode": "90210",
      "country": "USA"
    }
  }'
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "User updated successfully",
    "user": {
      "personalInfo.firstName": "Jane",
      "personalInfo.lastName": "Smith",
      "personalInfo.email": "jane.smith@example.com",
      "personalInfo.phone": "+1987654321",
      "personalInfo.address": {
        "street": "456 Oak Ave",
        "city": "Los Angeles",
        "state": "CA",
        "zipCode": "90210",
        "country": "USA"
      },
      "accountStatus.updatedAt": "2024-01-15T11:00:00.000Z"
    }
  }
}
```

### Update only specific fields
```bash
curl -X PUT https://ct4rgp2633.execute-api.us-east-1.amazonaws.com/users/user-123e4567-e89b-12d3-a456-426614174000 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "firstName": "John",
    "lastName": "Johnson"
  }'
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "User updated successfully",
    "user": {
      "personalInfo.firstName": "John",
      "personalInfo.lastName": "Johnson",
      "accountStatus.updatedAt": "2024-01-15T11:15:00.000Z"
    }
  }
}
```

### Error Responses

**Email Already in Use (409):**
```bash
curl -X PUT https://ct4rgp2633.execute-api.us-east-1.amazonaws.com/users/user-123e4567-e89b-12d3-a456-426614174000 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "email": "existing@example.com"
  }'
```

**Response (409):**
```json
{
  "success": false,
  "error": "Email or phone number is already in use"
}
```

**Invalid Email Format (400):**
```bash
curl -X PUT https://ct4rgp2633.execute-api.us-east-1.amazonaws.com/users/user-123e4567-e89b-12d3-a456-426614174000 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "email": "invalid-email"
  }'
```

**Response (400):**
```json
{
  "success": false,
  "error": "Validation error: email must be a valid email"
}
```

---

## 3. Get User Preferences

### Retrieve user preferences
```bash
curl -X GET https://ct4rgp2633.execute-api.us-east-1.amazonaws.com/users/user-123e4567-e89b-12d3-a456-426614174000/preferences \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "preferences": {
      "notifications": {
        "email": true,
        "push": true,
        "sms": false
      },
      "privacy": {
        "profileVisibility": "public",
        "showEmail": false,
        "showPhone": false
      },
      "language": "en",
      "currency": "USD",
      "timezone": "America/New_York"
    },
    "message": "User preferences retrieved successfully"
  }
}
```

---

## 4. Update User Preferences

### Update user preferences
```bash
curl -X PUT https://ct4rgp2633.execute-api.us-east-1.amazonaws.com/users/user-123e4567-e89b-12d3-a456-426614174000/preferences \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "notifications": {
      "email": true,
      "push": false,
      "sms": true
    },
    "privacy": {
      "profileVisibility": "private",
      "showEmail": true,
      "showPhone": false
    },
    "language": "es",
    "currency": "EUR",
    "timezone": "Europe/Madrid"
  }'
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "user-123e4567-e89b-12d3-a456-426614174000",
    "preferences": {
      "notifications": {
        "email": true,
        "push": false,
        "sms": true
      },
      "privacy": {
        "profileVisibility": "private",
        "showEmail": true,
        "showPhone": false
      },
      "language": "es",
      "currency": "EUR",
      "timezone": "Europe/Madrid"
    },
    "message": "User preferences updated successfully"
  }
}
```

---

## 5. Get Saved Locations

### Retrieve user's saved property locations
```bash
curl -X GET https://ct4rgp2633.execute-api.us-east-1.amazonaws.com/users/user-123e4567-e89b-12d3-a456-426614174000/saved-locations \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "savedLocations": [
      "prop-123e4567-e89b-12d3-a456-426614174000",
      "prop-987fcdeb-51a2-43d1-b789-123456789abc"
    ],
    "count": 2,
    "message": "User saved locations retrieved successfully"
  }
}
```

---

## 6. Save Locations

### Save multiple properties to favorites
```bash
curl -X POST https://ct4rgp2633.execute-api.us-east-1.amazonaws.com/users/user-123e4567-e89b-12d3-a456-426614174000/saved-locations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "favoriteProperties": [
      "prop-123e4567-e89b-12d3-a456-426614174000",
      "prop-987fcdeb-51a2-43d1-b789-123456789abc",
      "prop-456def12-3456-7890-abcd-ef1234567890"
    ]
  }'
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "User saved items updated successfully",
    "savedCount": 3
  }
}
```

### Error Responses

**Invalid Property IDs (404):**
```bash
curl -X POST https://ct4rgp2633.execute-api.us-east-1.amazonaws.com/users/user-123e4567-e89b-12d3-a456-426614174000/saved-locations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "favoriteProperties": [
      "prop-nonexistent-1",
      "prop-nonexistent-2"
    ]
  }'
```

**Response (404):**
```json
{
  "success": false,
  "error": "Properties not found: prop-nonexistent-1, prop-nonexistent-2"
}
```

**Invalid Input Format (400):**
```bash
curl -X POST https://ct4rgp2633.execute-api.us-east-1.amazonaws.com/users/user-123e4567-e89b-12d3-a456-426614174000/saved-locations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "favoriteProperties": "not-an-array"
  }'
```

**Response (400):**
```json
{
  "success": false,
  "error": "favoriteProperties must be an array of strings"
}
```

---

## 7. Delete Saved Location

### Remove a property from saved locations
```bash
curl -X DELETE https://ct4rgp2633.execute-api.us-east-1.amazonaws.com/users/user-123e4567-e89b-12d3-a456-426614174000/saved-locations/prop-123e4567-e89b-12d3-a456-426614174000 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Deleted user saved location successfully",
    "deletedLocationId": "prop-123e4567-e89b-12d3-a456-426614174000",
    "remainingCount": 1
  }
}
```

### Error Responses

**Location Not in Saved List (404):**
```bash
curl -X DELETE https://ct4rgp2633.execute-api.us-east-1.amazonaws.com/users/user-123e4567-e89b-12d3-a456-426614174000/saved-locations/nonexistent-prop \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (404):**
```json
{
  "success": false,
  "error": "Location not found in user saved locations"
}
```

---

## 8. Get Subscription Status

### Retrieve user's subscription information
```bash
curl -X GET https://ct4rgp2633.execute-api.us-east-1.amazonaws.com/users/user-123e4567-e89b-12d3-a456-426614174000/subscription \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "subscription": {
      "plan": "premium",
      "status": "active",
      "startDate": "2024-01-15T10:30:00.000Z",
      "endDate": "2025-01-15T10:30:00.000Z",
      "autoRenew": true,
      "paymentMethod": {
        "type": "card",
        "last4": "1234"
      }
    },
    "message": "User subscription retrieved successfully"
  }
}
```

---

## 9. Update Subscription

### Update user's subscription plan
```bash
curl -X PUT https://ct4rgp2633.execute-api.us-east-1.amazonaws.com/users/user-123e4567-e89b-12d3-a456-426614174000/subscription \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "plan": "pro",
    "status": "active",
    "autoRenew": true,
    "paymentMethod": {
      "type": "card",
      "last4": "5678"
    }
  }'
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "user-123e4567-e89b-12d3-a456-426614174000",
    "subscription": {
      "plan": "pro",
      "status": "active",
      "autoRenew": true,
      "paymentMethod": {
        "type": "card",
        "last4": "5678"
      }
    },
    "message": "User subscription updated successfully"
  }
}
```

---

## 10. Change User Role

### Change user role to host
```bash
curl -X PUT "https://ct4rgp2633.execute-api.us-east-1.amazonaws.com/users/user-123e4567-e89b-12d3-a456-426614174000/role?role=host" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "User role updated to host successfully",
    "newRole": "host"
  }
}
```

### Change user role to guest
```bash
curl -X PUT "https://ct4rgp2633.execute-api.us-east-1.amazonaws.com/users/user-123e4567-e89b-12d3-a456-426614174000/role?role=guest" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "User role updated to guest successfully",
    "newRole": "guest"
  }
}
```

### Error Responses

**Host Verification Pending (400):**
```bash
curl -X PUT "https://ct4rgp2633.execute-api.us-east-1.amazonaws.com/users/user-123e4567-e89b-12d3-a456-426614174000/role?role=host" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (400):**
```json
{
  "success": false,
  "error": "Host verification pending. Please complete host verification before changing to host role."
}
```

**Invalid Role (400):**
```bash
curl -X PUT "https://ct4rgp2633.execute-api.us-east-1.amazonaws.com/users/user-123e4567-e89b-12d3-a456-426614174000/role?role=admin" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (400):**
```json
{
  "success": false,
  "error": "Role must be either 'host' or 'guest'"
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

### Missing Request Body (400)
```json
{
  "success": false,
  "error": "Request body is required"
}
```

---

## Testing with Postman

### Environment Variables
Set up these environment variables in Postman:
- `base_url`: `https://ct4rgp2633.execute-api.us-east-1.amazonaws.com`
- `auth_token`: Your JWT token
- `user_id`: A valid user ID for testing

### Collection Setup
1. Create a new collection called "Palmera Users API"
2. Set the Authorization type to "Bearer Token" at the collection level
3. Use `{{auth_token}}` as the token value
4. Set the base URL to `{{base_url}}`

### Request Examples

**Get User Profile:**
- Method: GET
- URL: `{{base_url}}/users/{{user_id}}`

**Update User Profile:**
- Method: PUT
- URL: `{{base_url}}/users/{{user_id}}`
- Headers: `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com"
}
```

**Get User Preferences:**
- Method: GET
- URL: `{{base_url}}/users/{{user_id}}/preferences`

**Update User Preferences:**
- Method: PUT
- URL: `{{base_url}}/users/{{user_id}}/preferences`
- Body (raw JSON):
```json
{
  "notifications": {
    "email": true,
    "push": true,
    "sms": false
  },
  "privacy": {
    "profileVisibility": "public"
  }
}
```

**Get Saved Locations:**
- Method: GET
- URL: `{{base_url}}/users/{{user_id}}/saved-locations`

**Save Locations:**
- Method: POST
- URL: `{{base_url}}/users/{{user_id}}/saved-locations`
- Body (raw JSON):
```json
{
  "favoriteProperties": [
    "prop-123e4567-e89b-12d3-a456-426614174000"
  ]
}
```

**Delete Saved Location:**
- Method: DELETE
- URL: `{{base_url}}/users/{{user_id}}/saved-locations/prop-123e4567-e89b-12d3-a456-426614174000`

**Get Subscription:**
- Method: GET
- URL: `{{base_url}}/users/{{user_id}}/subscription`

**Update Subscription:**
- Method: PUT
- URL: `{{base_url}}/users/{{user_id}}/subscription`
- Body (raw JSON):
```json
{
  "plan": "premium",
  "status": "active"
}
```

**Change Role:**
- Method: PUT
- URL: `{{base_url}}/users/{{user_id}}/role?role=host`

---

## Rate Limiting
- 100 requests per minute per user
- 1000 requests per hour per user

## Best Practices
1. Always validate user input before sending requests
2. Handle all possible error responses in your application
3. Use appropriate HTTP methods for each operation
4. Include proper authentication headers
5. Validate user IDs before making requests
6. Handle database connection failures gracefully
7. Implement proper error logging on the client side
8. Use consistent data formats across all endpoints
9. Implement proper caching for frequently accessed data
10. Monitor API usage and implement rate limiting on the client side 