# Palmera Admin API - Demo Examples

This document provides comprehensive examples for all admin endpoints, including successful requests, error scenarios, and proper error handling.

## Table of Contents
1. [Get Users](#get-users)
2. [Update User](#update-user)
3. [Get Properties for Moderation](#get-properties-for-moderation)
4. [Update Property](#update-property)
5. [Delete Property](#delete-property)

---

## Get Users

### Endpoint: `GET /admin/users`

#### ✅ Successful Request

**Request:**
```bash
curl -X GET "http://localhost:3000/admin/users?role=host&status=active&page=1&limit=10" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example"
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "_id": "550e8400-e29b-41d4-a716-446655440000",
        "personalInfo": {
          "email": "john.doe@example.com",
          "firstName": "John",
          "lastName": "Doe",
          "phone": "+1234567890"
        },
        "roles": {
          "isHost": true,
          "isSuperhost": false,
          "isAdmin": false
        },
        "accountStatus": {
          "status": "active",
          "createdAt": "2024-01-15T10:30:00.000Z",
          "updatedAt": "2024-01-15T10:30:00.000Z"
        },
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
}
```

#### ❌ Error Scenarios

**1. Missing Authentication (401):**
```bash
curl -X GET "http://localhost:3000/admin/users"
```

**Response:**
```json
{
  "success": false,
  "error": "Authentication required"
}
```

**2. Non-Admin User (403):**
```json
{
  "success": false,
  "error": "Admin access required"
}
```

**3. Invalid Query Parameters (400):**
```bash
curl -X GET "http://localhost:3000/admin/users?role=invalid&page=0" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example"
```

**Response:**
```json
{
  "success": false,
  "error": "Validation error: Invalid role value"
}
```

**4. Admin User Not Found (404):**
```json
{
  "success": false,
  "error": "Admin user not found"
}
```

---

## Update User

### Endpoint: `PUT /admin/user/{id}`

#### ✅ Successful Request

**Request:**
```bash
curl -X PUT "http://localhost:3000/admin/user/550e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example" \
  -H "Content-Type: application/json" \
  -d '{
    "roles": {
      "isHost": true,
      "isSuperhost": false,
      "isAdmin": false
    },
    "accountStatus": {
      "status": "active"
    }
  }'
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "User updated by admin successfully",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "modifiedCount": 1
  }
}
```

#### ❌ Error Scenarios

**1. Missing Authentication (401):**
```bash
curl -X PUT "http://localhost:3000/admin/user/550e8400-e29b-41d4-a716-446655440000" \
  -H "Content-Type: application/json" \
  -d '{"roles": {"isHost": true}}'
```

**Response:**
```json
{
  "success": false,
  "error": "Authentication required"
}
```

**2. Non-Admin User (403):**
```json
{
  "success": false,
  "error": "Admin access required"
}
```

**3. User Not Found (404):**
```bash
curl -X PUT "http://localhost:3000/admin/user/nonexistent-id" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example" \
  -H "Content-Type: application/json" \
  -d '{"roles": {"isHost": true}}'
```

**Response:**
```json
{
  "success": false,
  "error": "User not found"
}
```

**4. Invalid JSON (400):**
```bash
curl -X PUT "http://localhost:3000/admin/user/550e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example" \
  -H "Content-Type: application/json" \
  -d '{"invalid": json}'
```

**Response:**
```json
{
  "success": false,
  "error": "Invalid JSON in request body"
}
```

**5. Cannot Modify Own Admin Status (403):**
```json
{
  "success": false,
  "error": "Cannot modify your own admin status"
}
```

---

## Get Properties for Moderation

### Endpoint: `GET /admin/properties`

#### ✅ Successful Request

**Request:**
```bash
curl -X GET "http://localhost:3000/admin/properties?status=pending&property_type=Entire%20place&min_price=50&max_price=200&page=1&limit=10" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example"
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "properties": [
      {
        "_id": "550e8400-e29b-41d4-a716-446655440000",
        "basicInfo": {
          "title": "Cozy Downtown Apartment",
          "property_type": "Entire place",
          "status": "pending"
        },
        "location": {
          "address": "123 Main St, New York, NY"
        },
        "pricing": {
          "price_per_night": 150
        },
        "amenities": {
          "wifi": true,
          "kitchen": true,
          "parking": false
        },
        "hostId": "550e8400-e29b-41d4-a716-446655440001",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 15,
      "pages": 2
    }
  }
}
```

#### ❌ Error Scenarios

**1. Missing Authentication (401):**
```bash
curl -X GET "http://localhost:3000/admin/properties"
```

**Response:**
```json
{
  "success": false,
  "error": "Authentication required"
}
```

**2. Non-Admin User (403):**
```json
{
  "success": false,
  "error": "Admin access required"
}
```

**3. Invalid Date Range (400):**
```bash
curl -X GET "http://localhost:3000/admin/properties?availability_start=2024-12-31&availability_end=2024-01-01" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example"
```

**Response:**
```json
{
  "success": false,
  "error": "Availability start date must be before end date"
}
```

**4. Invalid Property Type (400):**
```bash
curl -X GET "http://localhost:3000/admin/properties?property_type=Invalid" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example"
```

**Response:**
```json
{
  "success": false,
  "error": "Validation error: Invalid property type"
}
```

---

## Update Property

### Endpoint: `PUT /admin/property/{id}`

#### ✅ Successful Request

**Request:**
```bash
curl -X PUT "http://localhost:3000/admin/property/550e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example" \
  -H "Content-Type: application/json" \
  -d '{
    "basicInfo": {
      "title": "Updated Property Title",
      "status": "active"
    },
    "pricing": {
      "price_per_night": 200
    }
  }'
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Property updated by admin successfully",
    "propertyId": "550e8400-e29b-41d4-a716-446655440000",
    "modifiedCount": 1
  }
}
```

#### ❌ Error Scenarios

**1. Missing Authentication (401):**
```bash
curl -X PUT "http://localhost:3000/admin/property/550e8400-e29b-41d4-a716-446655440000" \
  -H "Content-Type: application/json" \
  -d '{"basicInfo": {"status": "active"}}'
```

**Response:**
```json
{
  "success": false,
  "error": "Authentication required"
}
```

**2. Non-Admin User (403):**
```json
{
  "success": false,
  "error": "Admin access required"
}
```

**3. Property Not Found (404):**
```bash
curl -X PUT "http://localhost:3000/admin/property/nonexistent-id" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example" \
  -H "Content-Type: application/json" \
  -d '{"basicInfo": {"status": "active"}}'
```

**Response:**
```json
{
  "success": false,
  "error": "Property not found"
}
```

**4. Invalid Property Data (400):**
```bash
curl -X PUT "http://localhost:3000/admin/property/550e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example" \
  -H "Content-Type: application/json" \
  -d '{
    "pricing": {
      "price_per_night": -50
    }
  }'
```

**Response:**
```json
{
  "success": false,
  "error": "Validation error: Price per night must be greater than 0"
}
```

---

## Delete Property

### Endpoint: `DELETE /admin/property/{id}`

#### ✅ Successful Request

**Request:**
```bash
curl -X DELETE "http://localhost:3000/admin/property/550e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example"
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Property deleted by admin successfully",
    "propertyId": "550e8400-e29b-41d4-a716-446655440000",
    "deletedCount": 1
  }
}
```

#### ❌ Error Scenarios

**1. Missing Authentication (401):**
```bash
curl -X DELETE "http://localhost:3000/admin/property/550e8400-e29b-41d4-a716-446655440000"
```

**Response:**
```json
{
  "success": false,
  "error": "Authentication required"
}
```

**2. Non-Admin User (403):**
```json
{
  "success": false,
  "error": "Admin access required"
}
```

**3. Property Not Found (404):**
```bash
curl -X DELETE "http://localhost:3000/admin/property/nonexistent-id" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example"
```

**Response:**
```json
{
  "success": false,
  "error": "Property not found"
}
```

**4. Property Has Active Bookings (409):**
```bash
curl -X DELETE "http://localhost:3000/admin/property/550e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example"
```

**Response:**
```json
{
  "success": false,
  "error": "Cannot delete property with active bookings"
}
```

---

## Query Parameters Reference

### Get Users Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `role` | string | Filter by user role | `admin`, `host`, `guest`, `superhost` |
| `status` | string | Filter by account status | `active`, `suspended`, `deleted` |
| `registered_from` | date | Filter users registered from this date | `2024-01-01` |
| `registered_to` | date | Filter users registered until this date | `2024-12-31` |
| `page` | integer | Page number for pagination | `1` |
| `limit` | integer | Number of items per page (max 100) | `20` |

### Get Properties Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `location` | string | Filter by location (partial match) | `New York` |
| `min_price` | number | Minimum price per night | `50` |
| `max_price` | number | Maximum price per night | `200` |
| `availability_start` | date | Availability start date | `2024-06-01` |
| `availability_end` | date | Availability end date | `2024-06-15` |
| `amenities` | string | Comma-separated amenities | `wifi,kitchen,parking` |
| `property_type` | string | Type of property | `Entire place`, `Private room`, `Shared room` |
| `status` | string | Property status | `active`, `pending`, `inactive` |
| `page` | integer | Page number for pagination | `1` |
| `limit` | integer | Number of items per page (max 100) | `20` |

## Error Code Summary

| HTTP Status | Error Type | Description |
|-------------|------------|-------------|
| 400 | Bad Request | Validation errors, invalid JSON, invalid parameters |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Admin access required, cannot modify own admin status |
| 404 | Not Found | User/property not found, admin user not found |
| 409 | Conflict | Cannot delete property with active bookings |
| 500 | Internal Server Error | Server errors, database operation failures |
| 503 | Service Unavailable | Database connection failed |

## Testing Tips

1. **Use Postman or similar tool** for easier testing
2. **Save admin tokens** from login responses for authenticated endpoints
3. **Test with different user roles** to verify admin-only access
4. **Test pagination** with different page and limit values
5. **Test filtering** with various combinations of query parameters
6. **Verify error handling** with invalid data and permissions
7. **Check response headers** for CORS and content-type information
8. **Test with real data** to ensure proper functionality

## Security Notes

- All admin endpoints require admin privileges
- Admin users cannot modify their own admin status
- Properties with active bookings cannot be deleted
- Sensitive user data (like passwords) is never returned
- All operations are logged with admin user ID for audit trails 