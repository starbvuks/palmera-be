# Properties API Demo Examples

This document provides practical examples for testing the Properties API endpoints using curl commands and Postman.

## Base URL
- **Production**: `https://api.palmera.com/properties`
- **Development**: `https://dev-api.palmera.com/properties`

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```bash
Authorization: Bearer <your-jwt-token>
```

## 1. Create Property

### cURL Example
```bash
curl -X POST https://api.palmera.com/properties \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -d '{
    "host_id": "user123",
    "basicInfo": {
      "title": "Cozy Downtown Apartment",
      "description": "Beautiful 2-bedroom apartment in the heart of downtown with amazing city views",
      "property_type": "Entire place",
      "status": "pending"
    },
    "location": {
      "address": "123 Main Street",
      "city": "New York",
      "state": "NY",
      "country": "USA",
      "coordinates": {
        "lat": 40.7128,
        "lng": -74.0060
      }
    },
    "pricing": {
      "price_per_night": 150,
      "currency": "USD"
    },
    "amenities": {
      "wifi": true,
      "parking": true,
      "kitchen": true,
      "air_conditioning": true,
      "washer": true,
      "dryer": true
    }
  }'
```

### Postman Setup
1. **Method**: POST
2. **URL**: `https://api.palmera.com/properties`
3. **Headers**:
   - `Content-Type: application/json`
   - `Authorization: Bearer <your-jwt-token>`
4. **Body** (raw JSON):
```json
{
  "host_id": "user123",
  "basicInfo": {
    "title": "Cozy Downtown Apartment",
    "description": "Beautiful 2-bedroom apartment in the heart of downtown with amazing city views",
    "property_type": "Entire place",
    "status": "pending"
  },
  "location": {
    "address": "123 Main Street",
    "city": "New York",
    "state": "NY",
    "country": "USA",
    "coordinates": {
      "lat": 40.7128,
      "lng": -74.0060
    }
  },
  "pricing": {
    "price_per_night": 150,
    "currency": "USD"
  },
  "amenities": {
    "wifi": true,
    "parking": true,
    "kitchen": true,
    "air_conditioning": true,
    "washer": true,
    "dryer": true
  }
}
```

## 2. Search Properties

### cURL Example
```bash
curl -X GET "https://api.palmera.com/properties/search?location=New%20York&min_price=100&max_price=200&property_type=Entire%20place&amenities=wifi,parking" \
  -H "Content-Type: application/json"
```

### Postman Setup
1. **Method**: GET
2. **URL**: `https://api.palmera.com/properties/search`
3. **Query Parameters**:
   - `location`: New York
   - `min_price`: 100
   - `max_price`: 200
   - `property_type`: Entire place
   - `amenities`: wifi,parking
   - `availability_start`: 2024-01-15
   - `availability_end`: 2024-01-20

## 3. Get Property by ID

### cURL Example
```bash
curl -X GET https://api.palmera.com/properties/property123 \
  -H "Content-Type: application/json"
```

### Postman Setup
1. **Method**: GET
2. **URL**: `https://api.palmera.com/properties/property123`

## 4. Update Property

### cURL Example
```bash
curl -X PUT https://api.palmera.com/properties/property123 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -d '{
    "basicInfo": {
      "title": "Updated Cozy Downtown Apartment",
      "description": "Updated description for the apartment",
      "status": "active"
    },
    "pricing": {
      "price_per_night": 175
    },
    "amenities": {
      "wifi": true,
      "parking": true,
      "kitchen": true,
      "air_conditioning": true,
      "washer": true,
      "dryer": true,
      "gym": true
    }
  }'
```

### Postman Setup
1. **Method**: PUT
2. **URL**: `https://api.palmera.com/properties/property123`
3. **Headers**:
   - `Content-Type: application/json`
   - `Authorization: Bearer <your-jwt-token>`
4. **Body** (raw JSON):
```json
{
  "basicInfo": {
    "title": "Updated Cozy Downtown Apartment",
    "description": "Updated description for the apartment",
    "status": "active"
  },
  "pricing": {
    "price_per_night": 175
  },
  "amenities": {
    "wifi": true,
    "parking": true,
    "kitchen": true,
    "air_conditioning": true,
    "washer": true,
    "dryer": true,
    "gym": true
  }
}
```

## 5. Delete Property

### cURL Example
```bash
curl -X DELETE https://api.palmera.com/properties/property123 \
  -H "Authorization: Bearer <your-jwt-token>"
```

### Postman Setup
1. **Method**: DELETE
2. **URL**: `https://api.palmera.com/properties/property123`
3. **Headers**:
   - `Authorization: Bearer <your-jwt-token>`

## 6. Get User Properties

### cURL Example
```bash
curl -X GET https://api.palmera.com/properties/user/user123 \
  -H "Content-Type: application/json"
```

### Postman Setup
1. **Method**: GET
2. **URL**: `https://api.palmera.com/properties/user/user123`

## 7. Upload Property Images

### cURL Example
```bash
curl -X POST https://api.palmera.com/properties/property123/images \
  -H "Authorization: Bearer <your-jwt-token>" \
  -F "files=@/path/to/image1.jpg" \
  -F "files=@/path/to/image2.png"
```

### Postman Setup
1. **Method**: POST
2. **URL**: `https://api.palmera.com/properties/property123/images`
3. **Headers**:
   - `Authorization: Bearer <your-jwt-token>`
4. **Body** (form-data):
   - Key: `files`, Type: File, Value: Select image files (JPEG/PNG)

## 8. Delete Property Images

### cURL Example
```bash
curl -X DELETE https://api.palmera.com/properties/property123/images \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -d '{
    "Images": [
      "https://example-bucket.s3.amazonaws.com/property-Images/property123/image1.jpg",
      "https://example-bucket.s3.amazonaws.com/property-Images/property123/image2.png"
    ]
  }'
```

### Postman Setup
1. **Method**: DELETE
2. **URL**: `https://api.palmera.com/properties/property123/images`
3. **Headers**:
   - `Content-Type: application/json`
   - `Authorization: Bearer <your-jwt-token>`
4. **Body** (raw JSON):
```json
{
  "Images": [
    "https://example-bucket.s3.amazonaws.com/property-Images/property123/image1.jpg",
    "https://example-bucket.s3.amazonaws.com/property-Images/property123/image2.png"
  ]
}
```

## 9. Upload Property Documents

### cURL Example
```bash
curl -X POST https://api.palmera.com/properties/property123/documents \
  -H "Authorization: Bearer <your-jwt-token>" \
  -F "files=@/path/to/document1.pdf" \
  -F "files=@/path/to/document2.pdf"
```

### Postman Setup
1. **Method**: POST
2. **URL**: `https://api.palmera.com/properties/property123/documents`
3. **Headers**:
   - `Authorization: Bearer <your-jwt-token>`
4. **Body** (form-data):
   - Key: `files`, Type: File, Value: Select PDF files

## 10. Delete Property Document

### cURL Example
```bash
curl -X DELETE https://api.palmera.com/properties/property123/documents/doc456 \
  -H "Authorization: Bearer <your-jwt-token>"
```

### Postman Setup
1. **Method**: DELETE
2. **URL**: `https://api.palmera.com/properties/property123/documents/doc456`
3. **Headers**:
   - `Authorization: Bearer <your-jwt-token>`

## Expected Responses

### Success Response (200/201)
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data varies by endpoint
  }
}
```

### Error Response (400/401/404/500)
```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

## Common Error Scenarios

1. **400 Bad Request**: Invalid input data, missing required fields
2. **401 Unauthorized**: Missing or invalid JWT token
3. **404 Not Found**: Property, user, or document not found
4. **500 Internal Server Error**: Server-side error

## Testing Tips

1. **Start with public endpoints** (GET /properties/search, GET /properties/{id}) before testing protected endpoints
2. **Use valid JWT tokens** for authenticated endpoints
3. **Test file uploads** with actual image/PDF files
4. **Verify response formats** match the expected schemas
5. **Test error scenarios** by providing invalid data
6. **Check file size limits** for upload endpoints (typically 10MB per file)

## Environment Variables Required

For file upload functionality, ensure these environment variables are set:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `AWS_S3_BUCKET_NAME` 