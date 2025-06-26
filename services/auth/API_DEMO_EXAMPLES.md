# Palmera Auth API - Demo Examples

This document provides comprehensive examples for all authentication endpoints, including successful requests, error scenarios, and proper error handling.

## Table of Contents
1. [User Registration (Signup)](#user-registration-signup)
2. [User Login](#user-login)
3. [Google OAuth](#google-oauth)
4. [OTP Send](#otp-send)
5. [OTP Verify](#otp-verify)
6. [Token Refresh](#token-refresh)
7. [User Logout](#user-logout)
8. [Delete Account](#delete-account)

---

## User Registration (Signup)

### Endpoint: `POST /auth/signup`

#### ✅ Successful Registration

**Request:**
```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "securePassword123",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890"
  }'
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "550e8400-e29b-41d4-a716-446655440000",
    "personalInfo": {
      "email": "john.doe@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "phone": "+1234567890"
    },
    "roles": {
      "isHost": false,
      "isSuperhost": false,
      "isAdmin": false
    },
    "accountStatus": {
      "status": "active"
    },
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### ❌ Error Scenarios

**1. Invalid JSON (400):**
```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid-email",
    "password": "123",
    "firstName": "",
    "lastName": "Doe",
    "phone": "1234567890"
  }'
```

**Response:**
```json
{
  "success": false,
  "error": "Validation error: Email must be a valid email address"
}
```

**2. Email Already Registered (409):**
```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "existing@example.com",
    "password": "securePassword123",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890"
  }'
```

**Response:**
```json
{
  "success": false,
  "error": "Email address is already registered"
}
```

**3. Phone Already Registered (409):**
```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "new@example.com",
    "password": "securePassword123",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890"
  }'
```

**Response:**
```json
{
  "success": false,
  "error": "Phone number is already registered"
}
```

**4. Database Connection Failed (503):**
```json
{
  "success": false,
  "error": "Database connection failed"
}
```

---

## User Login

### Endpoint: `POST /auth/login`

#### ✅ Successful Login

**Request:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "securePassword123"
  }'
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "550e8400-e29b-41d4-a716-446655440000",
      "personalInfo": {
        "email": "john.doe@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "phone": "+1234567890"
      },
      "roles": {
        "isHost": false,
        "isSuperhost": false,
        "isAdmin": false
      }
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJpYXQiOjE3MDUzMjQwMDAsImV4cCI6MTcwNTQxMDQwMH0.example",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJpYXQiOjE3MDUzMjQwMDAsImV4cCI6MTcwNTkyODgwMH0.example"
  }
}
```

#### ❌ Error Scenarios

**1. Invalid Credentials (401):**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "wrongpassword"
  }'
```

**Response:**
```json
{
  "success": false,
  "error": "Invalid email or password"
}
```

**2. Account Suspended (403):**
```json
{
  "success": false,
  "error": "Account has been suspended. Please contact support."
}
```

**3. Account Deactivated (403):**
```json
{
  "success": false,
  "error": "Account has been deactivated. Please contact support."
}
```

**4. Invalid JSON (400):**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid-email",
    "password": ""
  }'
```

**Response:**
```json
{
  "success": false,
  "error": "Validation error: Email must be a valid email address"
}
```

---

## Google OAuth

### Endpoint: `POST /auth/google`

#### ✅ Successful Google Authentication

**Request:**
```bash
curl -X POST http://localhost:3000/auth/google \
  -H "Content-Type: application/json" \
  -d '{
    "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjFlOWdkazcifQ.eyJpc3MiOiJhY2NvdW50cy5nb29nbGUuY29tIiwiYXVkIjoiMTIzNDU2Nzg5MC1hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsImF0X2hhc2giOiJleGFtcGxlIiwiYXV0aF90aW1lIjoxNzA1MzI0MDAwLCJ1c2VyX2lkIjoiMTIzNDU2Nzg5MCIsImlhdCI6MTcwNTMyNDAwMCwiZXhwIjoxNzA1MzI3NjAwLCJlbWFpbCI6ImpvaG4uZG9lQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJuYW1lIjoiSm9obiBEb2UiLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jSmpfZXhhbXBsZSJ9.example"
  }'
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "550e8400-e29b-41d4-a716-446655440000",
      "personalInfo": {
        "email": "john.doe@gmail.com",
        "firstName": "John",
        "lastName": "Doe",
        "phone": null
      },
      "profile": {
        "picture": "https://lh3.googleusercontent.com/a/ACg8ocJ_example"
      }
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example"
  }
}
```

#### ❌ Error Scenarios

**1. Expired Google Token (401):**
```json
{
  "success": false,
  "error": "Google token has expired"
}
```

**2. Invalid Google Token (401):**
```json
{
  "success": false,
  "error": "Invalid Google token"
}
```

**3. Missing Email from Google (400):**
```json
{
  "success": false,
  "error": "Email is required from Google account"
}
```

**4. Wrong Google Client Configuration (500):**
```json
{
  "success": false,
  "error": "Invalid Google client configuration"
}
```

---

## OTP Send

### Endpoint: `POST /auth/otp/send`

#### ✅ Successful OTP Send

**Request:**
```bash
curl -X POST http://localhost:3000/auth/otp/send \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+1234567890"
  }'
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "OTP sent successfully",
    "phone": "+1234567890"
  }
}
```

#### ❌ Error Scenarios

**1. Invalid Phone Number Format (400):**
```bash
curl -X POST http://localhost:3000/auth/otp/send \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "1234567890"
  }'
```

**Response:**
```json
{
  "success": false,
  "error": "Phone number validation error: Phone must match pattern /^\\+\\d{10,15}$/"
}
```

**2. Rate Limit Exceeded (429):**
```json
{
  "success": false,
  "error": "OTP already sent. Please wait 60 seconds before requesting another."
}
```

**3. Twilio Service Errors:**

**Invalid Phone Number (400):**
```json
{
  "success": false,
  "error": "Invalid phone number format"
}
```

**Phone Not Mobile (400):**
```json
{
  "success": false,
  "error": "Phone number is not mobile"
}
```

**SMS Service Unavailable (503):**
```json
{
  "success": false,
  "error": "SMS service temporarily unavailable"
}
```

**Rate Limit Exceeded (429):**
```json
{
  "success": false,
  "error": "SMS service rate limit exceeded"
}
```

---

## OTP Verify

### Endpoint: `POST /auth/otp/verify`

#### ✅ Successful OTP Verification

**Request:**
```bash
curl -X POST http://localhost:3000/auth/otp/verify \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+1234567890",
    "otp": "123456"
  }'
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "OTP verified successfully",
    "user": {
      "_id": "550e8400-e29b-41d4-a716-446655440000",
      "personalInfo": {
        "email": "john.doe@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "phone": "+1234567890"
      },
      "roles": {
        "isHost": false,
        "isSuperhost": false,
        "isAdmin": false
      }
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example"
  }
}
```

#### ❌ Error Scenarios

**1. Invalid OTP (400):**
```bash
curl -X POST http://localhost:3000/auth/otp/verify \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+1234567890",
    "otp": "000000"
  }'
```

**Response:**
```json
{
  "success": false,
  "error": "Invalid OTP. Please check and try again."
}
```

**2. OTP Expired (410):**
```json
{
  "success": false,
  "error": "OTP has expired. Please request a new OTP."
}
```

**3. No OTP Found (404):**
```json
{
  "success": false,
  "error": "No OTP found for this phone number. Please request a new OTP."
}
```

**4. User Not Found (404):**
```json
{
  "success": false,
  "error": "User not found. Please sign up first."
}
```

---

## Token Refresh

### Endpoint: `POST /auth/refresh`

#### ✅ Successful Token Refresh

**Request:**
```bash
curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example"
  }'
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example",
    "expiresIn": 3600
  }
}
```

#### ❌ Error Scenarios

**1. Expired Refresh Token (401):**
```json
{
  "success": false,
  "error": "Refresh token has expired"
}
```

**2. Invalid Refresh Token (401):**
```json
{
  "success": false,
  "error": "Invalid refresh token"
}
```

**3. Token Not Yet Valid (401):**
```json
{
  "success": false,
  "error": "Refresh token not yet valid"
}
```

**4. User Not Found (404):**
```json
{
  "success": false,
  "error": "User not found"
}
```

---

## User Logout

### Endpoint: `POST /auth/logout`

#### ✅ Successful Logout

**Request:**
```bash
curl -X POST http://localhost:3000/auth/logout \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example"
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully",
    "tokensRemoved": 1
  }
}
```

#### ❌ Error Scenarios

**1. Missing Authorization Header (401):**
```bash
curl -X POST http://localhost:3000/auth/logout
```

**Response:**
```json
{
  "success": false,
  "error": "Authorization header is required"
}
```

**2. Invalid Authorization Format (401):**
```bash
curl -X POST http://localhost:3000/auth/logout \
  -H "Authorization: InvalidFormat token"
```

**Response:**
```json
{
  "success": false,
  "error": "Invalid authorization header format. Use Bearer token"
}
```

---

## Delete Account

### Endpoint: `DELETE /auth/delete-account`

#### ✅ Successful Account Deletion

**Request:**
```bash
curl -X DELETE http://localhost:3000/auth/delete-account \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example"
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Account deleted successfully",
    "userDeleted": true,
    "tokensRemoved": 3
  }
}
```

#### ❌ Error Scenarios

**1. Authentication Required (401):**
```json
{
  "success": false,
  "error": "Authentication required"
}
```

**2. Admin Account Protection (403):**
```json
{
  "success": false,
  "error": "Admin accounts cannot be deleted"
}
```

**3. User Not Found (404):**
```json
{
  "success": false,
  "error": "User not found"
}
```

**4. Failed to Delete Account (500):**
```json
{
  "success": false,
  "error": "Failed to delete account. Please try again."
}
```

---

## Error Code Summary

| HTTP Status | Error Type | Description |
|-------------|------------|-------------|
| 400 | Bad Request | Validation errors, invalid JSON, invalid OTP |
| 401 | Unauthorized | Invalid credentials, expired tokens, missing auth |
| 403 | Forbidden | Account suspended/deactivated, admin protection |
| 404 | Not Found | User not found, OTP not found |
| 409 | Conflict | Email/phone already registered |
| 410 | Gone | OTP expired |
| 429 | Too Many Requests | Rate limiting, OTP spam protection |
| 500 | Internal Server Error | Server errors, authentication service errors |
| 503 | Service Unavailable | Database connection failed, SMS service errors |

## Testing Tips

1. **Use Postman or similar tool** for easier testing
2. **Save tokens** from login responses for authenticated endpoints
3. **Test rate limiting** by sending multiple OTP requests quickly
4. **Test error scenarios** with invalid data to ensure proper error handling
5. **Check response headers** for CORS and content-type information
6. **Use different phone numbers** for OTP testing to avoid conflicts
7. **Test with real Google tokens** for OAuth functionality 