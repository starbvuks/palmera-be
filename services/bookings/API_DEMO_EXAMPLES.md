# Palmera Bookings API Demo Examples

This document provides practical examples for using the Palmera Bookings API endpoints.

## Base URL
```
https://097aqk2gwf.execute-api.us-east-1.amazonaws.com
```

## Authentication
Most endpoints require Bearer token authentication. Include the token in the Authorization header:
```bash
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 1. Create Booking

### Create a new property booking
```bash
curl -X POST https://097aqk2gwf.execute-api.us-east-1.amazonaws.com/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "property_id": "prop-123e4567-e89b-12d3-a456-426614174000",
    "host_id": "host-123e4567-e89b-12d3-a456-426614174000",
    "guest_id": "guest-123e4567-e89b-12d3-a456-426614174000",
    "bookingDetails": {
      "check_in": "2024-02-15",
      "check_out": "2024-02-18",
      "guests": 2
    },
    "totalAmount": 450.00
  }'
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "message": "Booking created successfully",
    "bookingData": {
      "_id": "booking-123e4567-e89b-12d3-a456-426614174000",
      "property_id": "prop-123e4567-e89b-12d3-a456-426614174000",
      "host_id": "host-123e4567-e89b-12d3-a456-426614174000",
      "guest_id": "guest-123e4567-e89b-12d3-a456-426614174000",
      "bookingDetails": {
        "check_in": "2024-02-15",
        "check_out": "2024-02-18",
        "guests": 2,
        "status": "pending"
      },
      "totalAmount": 450.00,
      "metadata": {
        "created_at": "2024-01-15T10:30:00.000Z",
        "updated_at": "2024-01-15T10:30:00.000Z"
      }
    }
  }
}
```

### Error Responses

**Validation Error (400):**
```bash
curl -X POST https://097aqk2gwf.execute-api.us-east-1.amazonaws.com/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "property_id": "prop-123e4567-e89b-12d3-a456-426614174000",
    "host_id": "host-123e4567-e89b-12d3-a456-426614174000"
  }'
```

**Response (400):**
```json
{
  "success": false,
  "error": "Validation error: guest_id is required"
}
```

**Property Not Available (409):**
```bash
curl -X POST https://097aqk2gwf.execute-api.us-east-1.amazonaws.com/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "property_id": "prop-123e4567-e89b-12d3-a456-426614174000",
    "host_id": "host-123e4567-e89b-12d3-a456-426614174000",
    "guest_id": "guest-123e4567-e89b-12d3-a456-426614174000",
    "bookingDetails": {
      "check_in": "2024-02-15",
      "check_out": "2024-02-18",
      "guests": 2
    }
  }'
```

**Response (409):**
```json
{
  "success": false,
  "error": "Property is not available for the selected date: 2024-02-15"
}
```

**Invalid Date Format (400):**
```bash
curl -X POST https://097aqk2gwf.execute-api.us-east-1.amazonaws.com/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "property_id": "prop-123e4567-e89b-12d3-a456-426614174000",
    "host_id": "host-123e4567-e89b-12d3-a456-426614174000",
    "guest_id": "guest-123e4567-e89b-12d3-a456-426614174000",
    "bookingDetails": {
      "check_in": "invalid-date",
      "check_out": "2024-02-18",
      "guests": 2
    }
  }'
```

**Response (400):**
```json
{
  "success": false,
  "error": "Invalid date format for check-in or check-out"
}
```

---

## 2. Get User Bookings

### Retrieve all bookings for a user
```bash
curl -X GET "https://097aqk2gwf.execute-api.us-east-1.amazonaws.com/bookings?userId=guest-123e4567-e89b-12d3-a456-426614174000" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "bookings": [
      {
        "_id": "booking-123e4567-e89b-12d3-a456-426614174000",
        "property_id": "prop-123e4567-e89b-12d3-a456-426614174000",
        "host_id": "host-123e4567-e89b-12d3-a456-426614174000",
        "guest_id": "guest-123e4567-e89b-12d3-a456-426614174000",
        "bookingDetails": {
          "check_in": "2024-02-15",
          "check_out": "2024-02-18",
          "guests": 2,
          "status": "confirmed"
        },
        "totalAmount": 450.00,
        "payment": {
          "paymentIntentId": "pi_1234567890abcdef",
          "amount": 45000,
          "currency": "usd",
          "status": "succeeded",
          "createdAt": "2024-01-15T10:30:00.000Z"
        },
        "metadata": {
          "created_at": "2024-01-15T10:30:00.000Z",
          "updated_at": "2024-01-15T10:30:00.000Z"
        }
      }
    ],
    "count": 1,
    "message": "User bookings retrieved successfully"
  }
}
```

### Error Responses

**No Bookings Found (404):**
```bash
curl -X GET "https://097aqk2gwf.execute-api.us-east-1.amazonaws.com/bookings?userId=user-nonexistent" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (404):**
```json
{
  "success": false,
  "error": "No bookings found for this user"
}
```

**Invalid User ID (400):**
```bash
curl -X GET "https://097aqk2gwf.execute-api.us-east-1.amazonaws.com/bookings?userId=" \
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

## 3. Get Booking Details

### Retrieve specific booking details
```bash
curl -X GET https://097aqk2gwf.execute-api.us-east-1.amazonaws.com/bookings/booking-123e4567-e89b-12d3-a456-426614174000 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "booking": {
      "_id": "booking-123e4567-e89b-12d3-a456-426614174000",
      "property_id": "prop-123e4567-e89b-12d3-a456-426614174000",
      "host_id": "host-123e4567-e89b-12d3-a456-426614174000",
      "guest_id": "guest-123e4567-e89b-12d3-a456-426614174000",
      "bookingDetails": {
        "check_in": "2024-02-15",
        "check_out": "2024-02-18",
        "guests": 2,
        "status": "confirmed"
      },
      "totalAmount": 450.00,
      "payment": {
        "paymentIntentId": "pi_1234567890abcdef",
        "amount": 45000,
        "currency": "usd",
        "status": "succeeded",
        "createdAt": "2024-01-15T10:30:00.000Z"
      },
      "metadata": {
        "created_at": "2024-01-15T10:30:00.000Z",
        "updated_at": "2024-01-15T10:30:00.000Z"
      }
    },
    "message": "Booking retrieved successfully"
  }
}
```

### Error Responses

**Booking Not Found (404):**
```bash
curl -X GET https://097aqk2gwf.execute-api.us-east-1.amazonaws.com/bookings/nonexistent-booking \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (404):**
```json
{
  "success": false,
  "error": "Booking not found"
}
```

---

## 4. Cancel Booking

### Cancel an existing booking
```bash
curl -X DELETE https://097aqk2gwf.execute-api.us-east-1.amazonaws.com/bookings/booking-123e4567-e89b-12d3-a456-426614174000 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "reason": "Change of plans"
  }'
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Booking cancelled successfully",
    "bookingId": "booking-123e4567-e89b-12d3-a456-426614174000"
  }
}
```

### Error Responses

**Booking Already Cancelled (409):**
```bash
curl -X DELETE https://097aqk2gwf.execute-api.us-east-1.amazonaws.com/bookings/booking-123e4567-e89b-12d3-a456-426614174000 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "reason": "Change of plans"
  }'
```

**Response (409):**
```json
{
  "success": false,
  "error": "Booking is already cancelled"
}
```

**Missing Reason (400):**
```bash
curl -X DELETE https://097aqk2gwf.execute-api.us-east-1.amazonaws.com/bookings/booking-123e4567-e89b-12d3-a456-426614174000 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{}'
```

**Response (400):**
```json
{
  "success": false,
  "error": "Validation error: reason is required"
}
```

---

## 5. Create Payment Intent

### Create a Stripe payment intent for a booking
```bash
curl -X POST https://097aqk2gwf.execute-api.us-east-1.amazonaws.com/bookings/payment-intent \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "bookingId": "booking-123e4567-e89b-12d3-a456-426614174000",
    "amount": 45000,
    "currency": "usd"
  }'
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Payment intent created successfully",
    "clientSecret": "pi_1234567890abcdef_secret_1234567890abcdef",
    "paymentIntentId": "pi_1234567890abcdef",
    "amount": 45000,
    "currency": "usd"
  }
}
```

### Error Responses

**Payment Intent Already Exists (409):**
```bash
curl -X POST https://097aqk2gwf.execute-api.us-east-1.amazonaws.com/bookings/payment-intent \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "bookingId": "booking-123e4567-e89b-12d3-a456-426614174000",
    "amount": 45000,
    "currency": "usd"
  }'
```

**Response (409):**
```json
{
  "success": false,
  "error": "Payment intent already exists for this booking"
}
```

**Unauthorized (403):**
```bash
curl -X POST https://097aqk2gwf.execute-api.us-east-1.amazonaws.com/bookings/payment-intent \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer INVALID_TOKEN" \
  -d '{
    "bookingId": "booking-123e4567-e89b-12d3-a456-426614174000",
    "amount": 45000,
    "currency": "usd"
  }'
```

**Response (403):**
```json
{
  "success": false,
  "error": "Unauthorized to make payment for this booking"
}
```

---

## 6. Get Host Bookings

### Retrieve all bookings for a host
```bash
curl -X GET https://097aqk2gwf.execute-api.us-east-1.amazonaws.com/bookings/host/host-123e4567-e89b-12d3-a456-426614174000 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "bookings": [
      {
        "_id": "booking-123e4567-e89b-12d3-a456-426614174000",
        "property_id": "prop-123e4567-e89b-12d3-a456-426614174000",
        "host_id": "host-123e4567-e89b-12d3-a456-426614174000",
        "guest_id": "guest-123e4567-e89b-12d3-a456-426614174000",
        "bookingDetails": {
          "check_in": "2024-02-15",
          "check_out": "2024-02-18",
          "guests": 2,
          "status": "confirmed"
        },
        "totalAmount": 450.00,
        "metadata": {
          "created_at": "2024-01-15T10:30:00.000Z",
          "updated_at": "2024-01-15T10:30:00.000Z"
        }
      }
    ],
    "count": 1
  }
}
```

---

## 7. Search Properties

### Search available properties for booking
```bash
curl -X GET "https://097aqk2gwf.execute-api.us-east-1.amazonaws.com/bookings/search?location=New%20York&checkIn=2024-02-15&checkOut=2024-02-18&guests=2&priceMin=50&priceMax=200" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "properties": [
      {
        "_id": "prop-123e4567-e89b-12d3-a456-426614174000",
        "title": "Cozy Downtown Apartment",
        "description": "Beautiful apartment in the heart of downtown",
        "price": 150.00,
        "location": {
          "address": "123 Main St, New York, NY",
          "coordinates": {
            "lat": 40.7128,
            "lng": -74.0060
          }
        },
        "host_id": "host-123e4567-e89b-12d3-a456-426614174000",
        "availability": {
          "availability_calendar": ["2024-02-15", "2024-02-16", "2024-02-17"]
        },
        "status": "active",
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "count": 1
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
- `base_url`: `https://097aqk2gwf.execute-api.us-east-1.amazonaws.com`
- `auth_token`: Your JWT token

### Collection Setup
1. Create a new collection called "Palmera Bookings API"
2. Set the Authorization type to "Bearer Token" at the collection level
3. Use `{{auth_token}}` as the token value
4. Set the base URL to `{{base_url}}`

### Request Examples

**Create Booking:**
- Method: POST
- URL: `{{base_url}}/bookings`
- Headers: `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "property_id": "prop-123e4567-e89b-12d3-a456-426614174000",
  "host_id": "host-123e4567-e89b-12d3-a456-426614174000",
  "guest_id": "guest-123e4567-e89b-12d3-a456-426614174000",
  "bookingDetails": {
    "check_in": "2024-02-15",
    "check_out": "2024-02-18",
    "guests": 2
  },
  "totalAmount": 450.00
}
```

**Get User Bookings:**
- Method: GET
- URL: `{{base_url}}/bookings?userId=guest-123e4567-e89b-12d3-a456-426614174000`

**Get Booking Details:**
- Method: GET
- URL: `{{base_url}}/bookings/booking-123e4567-e89b-12d3-a456-426614174000`

**Cancel Booking:**
- Method: DELETE
- URL: `{{base_url}}/bookings/booking-123e4567-e89b-12d3-a456-426614174000`
- Body (raw JSON):
```json
{
  "reason": "Change of plans"
}
```

**Create Payment Intent:**
- Method: POST
- URL: `{{base_url}}/bookings/payment-intent`
- Body (raw JSON):
```json
{
  "bookingId": "booking-123e4567-e89b-12d3-a456-426614174000",
  "amount": 45000,
  "currency": "usd"
}
```

---

## Rate Limiting
- 100 requests per minute per user
- 1000 requests per hour per user

## Best Practices
1. Always validate dates before creating bookings
2. Check property availability before booking
3. Handle payment failures gracefully
4. Implement retry logic for failed requests
5. Use proper error handling in client applications
6. Validate all input data before sending requests 