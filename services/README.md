# Palmera API Documentation Generator

This script automatically generates comprehensive Swagger/OpenAPI 3.0 documentation for all Palmera microservices by parsing the `serverless.yml/yaml` configuration files and combining them with schema definitions from the shared models.

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Navigate to the services directory:
```bash
cd palmera-be/services
```

2. Install dependencies:
```bash
npm install
```

### Generate Documentation

Run the documentation generator:
```bash
npm run generate-docs
```

This will:
- Parse all serverless configuration files from each service
- Extract API endpoints, methods, and parameters
- Combine with schema definitions from shared models
- Generate a complete `swagger-documentation.json` file

## 📋 What Gets Documented

### Services Included
- **Auth Service**: Authentication, registration, OAuth, OTP verification
- **Users Service**: Profile management, preferences, saved locations, role switching
- **Properties Service**: Property CRUD, search, image/document uploads
- **Bookings Service**: Booking creation, management, history
- **Notifications Service**: Notification management
- **Messaging Service**: In-app messaging system
- **Admin Service**: Administrative operations

### Schema Definitions
The script includes comprehensive schema definitions for:
- User models (with preferences, host details, saved locations)
- Property models (with location, amenities, rules, stats)
- Booking models (with payment, guests, cancellation details)
- Notification and messaging models
- Error and success response schemas

## 📊 Generated Documentation Features

### Security
- JWT Bearer token authentication
- Automatic security requirements for protected endpoints

### Request/Response Schemas
- Complete request body schemas for POST/PUT operations
- Detailed response schemas with proper data types
- Error response schemas with status codes

### Path Parameters
- Automatic extraction of path parameters (e.g., `{id}`, `{userId}`)
- Proper typing for UUID identifiers

### Service Organization
- Endpoints grouped by service tags
- Descriptive summaries and descriptions
- Proper HTTP method and status code documentation

## 🔧 Usage Options

### View Documentation

1. **Swagger UI** (Recommended):
   - Import `swagger-documentation.json` into [Swagger Editor](https://editor.swagger.io/)
   - Or use Swagger UI locally

2. **Postman**:
   - Import the generated JSON file directly into Postman
   - Automatically creates a collection with all endpoints

3. **Local Swagger UI Server** (optional):
```bash
npm install -g swagger-ui-serve
swagger-ui-serve swagger-documentation.json
```

### Validate Documentation
```bash
npm run validate-docs
```

## 📁 File Structure

```
palmera-be/services/
├── generate-swagger-docs.js     # Main generator script
├── package.json                 # Dependencies and scripts
├── swagger-documentation.json   # Generated documentation (after running)
├── README.md                   # This file
├── auth/
│   └── serverless.yml
├── users/
│   └── serverless.yml
├── properties/
│   └── serverless.yaml
├── bookings/
│   └── serverless.yaml
├── notifications/
│   └── serverless.yaml
├── messaging/
│   └── serverless.yaml
└── admin/
    └── serverless.yaml
```

## 🔄 Updating Documentation

The documentation should be regenerated whenever:
- New endpoints are added to any service
- Existing endpoints are modified
- Schema definitions change
- New services are added

Simply run `npm run generate-docs` again to update the documentation.

## 📝 Customization

### Adding New Services
To include additional services, update the `services` array in `generate-swagger-docs.js`:

```javascript
const services = [
  // ... existing services
  { name: 'new-service', file: 'serverless.yml' }
];
```

### Custom Schemas
Add new schema definitions in the `components.schemas` section of the `swaggerBase` object.

### Custom Descriptions
Update the `generateSummary()` and `generateDescription()` functions to add specific descriptions for new endpoints.

## 🐛 Troubleshooting

### Common Issues

1. **"Configuration file not found"**: Ensure all serverless config files exist in their respective service directories.

2. **"Error parsing YAML"**: Check for syntax errors in serverless configuration files.

3. **Missing dependencies**: Run `npm install` to ensure all dependencies are installed.

### Debugging
The script provides detailed console output showing:
- Which services are being parsed
- Number of endpoints found per service
- Total endpoint count
- Final file location

## 🤝 Contributing

When adding new endpoints:
1. Update the serverless configuration file
2. Add appropriate summary/description mappings in the generator script
3. Update schema definitions if new data structures are introduced
4. Regenerate documentation
5. Test the generated documentation for accuracy

## 📈 Output Statistics

The generator provides a summary showing:
- Total number of endpoints documented
- Breakdown by service
- Generated file location

Example output:
```
🚀 Starting Swagger documentation generation...
📋 Parsing auth service...
   Found 8 endpoints
📋 Parsing users service...
   Found 8 endpoints
...
📊 Total endpoints found: 35
✅ Swagger documentation generated successfully!
📄 Output file: /path/to/swagger-documentation.json

📈 Summary:
   auth: 8 endpoints
   users: 8 endpoints
   properties: 10 endpoints
   bookings: 8 endpoints
   notifications: 3 endpoints
   messaging: 4 endpoints
   admin: 5 endpoints
``` 