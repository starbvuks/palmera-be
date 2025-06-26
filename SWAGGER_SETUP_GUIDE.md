# Palmera Backend Swagger Documentation Setup Guide

This guide provides comprehensive instructions for setting up, maintaining, and deploying Swagger documentation for the Palmera backend microservices.

## Overview

The Palmera backend consists of 7 microservices, each with its own Swagger documentation that has been unified into a single comprehensive API documentation file.

## Microservices Status

| Service | Status | Swagger File | API Demo Examples | Error Handling |
|---------|--------|--------------|-------------------|----------------|
| **Auth** | ✅ Complete | ✅ Unified | ✅ Complete | ✅ Enhanced |
| **Users** | ✅ Complete | ✅ Unified | ✅ Complete | ✅ Enhanced |
| **Properties** | ✅ Complete | ✅ Unified | ✅ Complete | ✅ Enhanced |
| **Bookings** | ✅ Complete | ✅ Unified | ✅ Complete | ✅ Enhanced |
| **Messaging** | ✅ Complete | ✅ Unified | ✅ Complete | ✅ Enhanced |
| **Notifications** | ✅ Complete | ✅ Unified | ✅ Complete | ✅ Enhanced |
| **Admin** | ✅ Complete | ✅ Unified | ✅ Complete | ✅ Enhanced |

## File Structure

```
palmera-be/
├── swagger-unified.yaml          # Complete unified API documentation
├── SWAGGER_SETUP_GUIDE.md        # This guide
├── swagger-server.js             # Local Swagger UI server
└── services/
    ├── auth/
    │   ├── API_DEMO_EXAMPLES.md  # Auth API examples
    │   └── src/handlers/         # Enhanced error handling
    ├── users/
    │   ├── API_DEMO_EXAMPLES.md  # Users API examples
    │   └── src/handlers/         # Enhanced error handling
    ├── properties/
    │   ├── API_DEMO_EXAMPLES.md  # Properties API examples
    │   └── src/handlers/         # Enhanced error handling
    ├── bookings/
    │   ├── API_DEMO_EXAMPLES.md  # Bookings API examples
    │   └── src/handlers/         # Enhanced error handling
    ├── messaging/
    │   ├── API_DEMO_EXAMPLES.md  # Messaging API examples
    │   └── src/handlers/         # Enhanced error handling
    ├── notifications/
    │   ├── API_DEMO_EXAMPLES.md  # Notifications API examples
    │   └── src/handlers/         # Enhanced error handling
    └── admin/
        ├── API_DEMO_EXAMPLES.md  # Admin API examples
        └── src/handlers/         # Enhanced error handling
```

## Deployment URLs

The unified Swagger documentation includes the following deployed service URLs:

- **Auth Service**: `https://m71ar6e3f9.execute-api.us-east-1.amazonaws.com`
- **Users Service**: `https://ct4rgp2633.execute-api.us-east-1.amazonaws.com`
- **Properties Service**: `https://fk0ojke7ka.execute-api.us-east-1.amazonaws.com`
- **Bookings Service**: `https://097aqk2gwf.execute-api.us-east-1.amazonaws.com`
- **Messaging Service**: `https://am22amgo33.execute-api.us-east-1.amazonaws.com`
- **Notifications Service**: `https://z421qustb7.execute-api.us-east-1.amazonaws.com`
- **Admin Service**: `https://8u9wyib7j4.execute-api.us-east-1.amazonaws.com`

## Enhanced Error Handling

All handlers across all services now include:

### 1. Input Validation
- Request body validation
- Path parameter validation
- Query parameter validation
- JSON parsing error handling

### 2. Database Operations
- Connection error handling (503 Service Unavailable)
- Query error handling (500 Internal Server Error)
- Duplicate key error handling (409 Conflict)

### 3. File Operations
- File upload validation
- S3 upload error handling
- File type validation
- File size validation

### 4. Business Logic
- Resource existence validation
- Authorization checks
- Data integrity validation

### 5. Response Format
Consistent error response format:
```json
{
  "success": false,
  "error": "Detailed error message"
}
```

## API Documentation Features

### 1. Comprehensive Endpoint Coverage
- All CRUD operations
- Search and filtering endpoints
- File upload/download endpoints
- Authentication endpoints
- Admin-only endpoints

### 2. Detailed Request/Response Schemas
- Complete property definitions
- Validation rules and constraints
- Example request bodies
- Expected response formats

### 3. Authentication Requirements
- Bearer token authentication
- Role-based access control
- Admin-only endpoints clearly marked

### 4. Error Response Documentation
- HTTP status codes
- Error message formats
- Common error scenarios

## Setup Instructions

### 1. Local Development

#### Install Dependencies
```bash
cd palmera-be
npm install swagger-ui-express yamljs
```

#### Start Local Swagger Server
```bash
node swagger-server.js
```

#### Access Local Documentation
Open your browser and navigate to:
```
http://localhost:3000
```

### 2. Production Deployment

#### Option A: AWS API Gateway
1. Upload `swagger-unified.yaml` to AWS API Gateway
2. Configure CORS settings
3. Set up custom domain (optional)

#### Option B: Static Hosting
1. Deploy the Swagger UI files to a static hosting service
2. Update the server URLs in the YAML file
3. Configure CORS headers

#### Option C: Documentation Platform
1. Import the YAML file to platforms like:
   - Swagger Hub
   - ReadMe.io
   - Postman
   - Stoplight

### 3. Frontend Integration

#### For Frontend Team
1. **Base URLs**: Use the deployment URLs listed above
2. **Authentication**: Include Bearer token in Authorization header
3. **Error Handling**: Implement consistent error response handling
4. **File Uploads**: Use multipart/form-data for file uploads
5. **Pagination**: Implement pagination for list endpoints

#### Example Frontend Integration
```javascript
// API client configuration
const API_BASE_URLS = {
  auth: 'https://m71ar6e3f9.execute-api.us-east-1.amazonaws.com',
  users: 'https://ct4rgp2633.execute-api.us-east-1.amazonaws.com',
  properties: 'https://fk0ojke7ka.execute-api.us-east-1.amazonaws.com',
  bookings: 'https://097aqk2gwf.execute-api.us-east-1.amazonaws.com',
  messaging: 'https://am22amgo33.execute-api.us-east-1.amazonaws.com',
  notifications: 'https://z421qustb7.execute-api.us-east-1.amazonaws.com',
  admin: 'https://8u9wyib7j4.execute-api.us-east-1.amazonaws.com'
};

// Example API call
const createProperty = async (propertyData) => {
  try {
    const response = await fetch(`${API_BASE_URLS.properties}/properties`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(propertyData)
    });
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error);
    }
    
    return result.data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};
```

## Maintenance

### 1. Adding New Endpoints
1. Update the handler with enhanced error handling
2. Add endpoint documentation to `swagger-unified.yaml`
3. Create API demo examples
4. Update this guide

### 2. Updating Existing Endpoints
1. Modify the handler implementation
2. Update the Swagger documentation
3. Update API demo examples
4. Test with the provided examples

### 3. Version Control
- Keep individual service Swagger files for reference
- Maintain the unified file as the single source of truth
- Use semantic versioning for API changes

## Testing

### 1. API Testing
Each service includes comprehensive API demo examples with:
- cURL commands
- Postman setup instructions
- Expected request/response formats
- Error scenario examples

### 2. Documentation Testing
- Validate YAML syntax
- Test all endpoints in Swagger UI
- Verify authentication requirements
- Check error response formats

### 3. Integration Testing
- Test cross-service communication
- Verify authentication flow
- Test file upload/download
- Validate error handling

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure proper CORS configuration in API Gateway
   - Check allowed origins and methods

2. **Authentication Issues**
   - Verify JWT token format
   - Check token expiration
   - Ensure proper Authorization header

3. **File Upload Issues**
   - Check file size limits
   - Verify file type restrictions
   - Ensure proper multipart/form-data format

4. **Database Connection Issues**
   - Check MongoDB connection string
   - Verify network connectivity
   - Check AWS VPC configuration

### Support

For issues or questions:
1. Check the API demo examples first
2. Review the error handling documentation
3. Test with the provided cURL commands
4. Contact the backend team with specific error details

## Conclusion

The Palmera backend now has comprehensive, production-ready API documentation with:
- ✅ Complete endpoint coverage across all 7 services
- ✅ Enhanced error handling with specific HTTP status codes
- ✅ Detailed request/response schemas
- ✅ Authentication and authorization documentation
- ✅ Practical API demo examples
- ✅ Unified documentation for easy frontend integration

The frontend team can now confidently integrate with all backend services using the provided documentation and examples. 