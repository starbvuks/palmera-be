const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Service configurations
const services = [
  { name: 'auth', file: 'serverless.yml' },
  { name: 'users', file: 'serverless.yml' },
  { name: 'properties', file: 'serverless.yaml' },
  { name: 'bookings', file: 'serverless.yaml' },
  { name: 'notifications', file: 'serverless.yaml' },
  { name: 'messaging', file: 'serverless.yaml' },
  { name: 'admin', file: 'serverless.yaml' }
];

// Base Swagger configuration
const swaggerBase = {
  openapi: '3.0.0',
  info: {
    title: 'Palmera API',
    version: '1.0.0',
    description: 'Comprehensive API documentation for Palmera - Airbnb-style booking platform',
    contact: {
      name: 'Palmera API Support',
      email: 'api@palmera.com'
    }
  },
  servers: [
    {
      url: 'https://api.palmera.com',
      description: 'Production server'
    },
    {
      url: 'https://dev-api.palmera.com',
      description: 'Development server'
    }
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          _id: { type: 'string', format: 'uuid' },
          email: { type: 'string', format: 'email' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          phone: { type: 'string', pattern: '^\\+?[1-9]\\d{1,14}$' },
          profilePicture: { type: 'string', format: 'uri' },
          role: { type: 'string', enum: ['user', 'host', 'admin'] },
          authProvider: { type: 'string', enum: ['local', 'google'] },
          status: { type: 'string', enum: ['active', 'inactive', 'suspended', 'deleted'] },
          preferences: { $ref: '#/components/schemas/UserPreferences' },
          hostDetails: { $ref: '#/components/schemas/HostDetails' },
          savedLocations: { type: 'array', items: { $ref: '#/components/schemas/SavedLocation' } },
          emailVerified: { type: 'boolean' },
          phoneVerified: { type: 'boolean' },
          twoFactorEnabled: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      UserPreferences: {
        type: 'object',
        properties: {
          language: { type: 'string', enum: ['en', 'es', 'fr', 'de', 'it'] },
          currency: { type: 'string', enum: ['USD', 'EUR', 'GBP', 'JPY'] },
          notifications: { $ref: '#/components/schemas/NotificationSettings' },
          theme: { type: 'string', enum: ['light', 'dark', 'system'] }
        }
      },
      NotificationSettings: {
        type: 'object',
        properties: {
          email: { type: 'boolean' },
          sms: { type: 'boolean' },
          push: { type: 'boolean' }
        }
      },
      HostDetails: {
        type: 'object',
        properties: {
          businessName: { type: 'string' },
          businessAddress: { type: 'string' },
          taxId: { type: 'string' },
          verificationStatus: { type: 'string', enum: ['pending', 'verified', 'rejected'] },
          verificationDocuments: { type: 'array', items: { $ref: '#/components/schemas/VerificationDocument' } }
        }
      },
      VerificationDocument: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['id', 'address', 'business'] },
          url: { type: 'string', format: 'uri' },
          status: { type: 'string', enum: ['pending', 'approved', 'rejected'] },
          uploadedAt: { type: 'string', format: 'date-time' }
        }
      },
      SavedLocation: {
        type: 'object',
        properties: {
          propertyId: { type: 'string', format: 'uuid' },
          notes: { type: 'string', maxLength: 500 },
          savedAt: { type: 'string', format: 'date-time' }
        }
      },
      Property: {
        type: 'object',
        properties: {
          _id: { type: 'string', format: 'uuid' },
          hostId: { type: 'string', format: 'uuid' },
          title: { type: 'string' },
          description: { type: 'string' },
          type: { type: 'string', enum: ['house', 'apartment', 'guesthouse', 'hotel', 'villa'] },
          category: { type: 'string', enum: ['beachfront', 'mountain', 'city', 'countryside', 'luxury'] },
          status: { type: 'string', enum: ['draft', 'pending', 'active', 'inactive', 'deleted'] },
          basePrice: { type: 'number', minimum: 0 },
          cleaningFee: { type: 'number', minimum: 0 },
          serviceFee: { type: 'number', minimum: 0 },
          capacity: { $ref: '#/components/schemas/PropertyCapacity' },
          location: { $ref: '#/components/schemas/PropertyLocation' },
          amenities: { type: 'array', items: { $ref: '#/components/schemas/Amenity' } },
          images: { type: 'array', items: { $ref: '#/components/schemas/PropertyImage' } },
          rules: { $ref: '#/components/schemas/PropertyRules' },
          stats: { $ref: '#/components/schemas/PropertyStats' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      PropertyCapacity: {
        type: 'object',
        properties: {
          guests: { type: 'number', minimum: 1 },
          bedrooms: { type: 'number', minimum: 0 },
          beds: { type: 'number', minimum: 1 },
          bathrooms: { type: 'number', minimum: 1 }
        }
      },
      PropertyLocation: {
        type: 'object',
        properties: {
          coordinates: { type: 'array', items: { type: 'number' }, minItems: 2, maxItems: 2 },
          address: { $ref: '#/components/schemas/Address' },
          placeId: { type: 'string' }
        }
      },
      Address: {
        type: 'object',
        properties: {
          street: { type: 'string' },
          city: { type: 'string' },
          state: { type: 'string' },
          country: { type: 'string' },
          zipCode: { type: 'string' }
        }
      },
      Amenity: {
        type: 'object',
        properties: {
          category: { type: 'string', enum: ['basic', 'safety', 'accessibility', 'outdoor', 'entertainment', 'workspace'] },
          name: { type: 'string' },
          icon: { type: 'string' },
          description: { type: 'string' }
        }
      },
      PropertyImage: {
        type: 'object',
        properties: {
          url: { type: 'string', format: 'uri' },
          caption: { type: 'string' },
          order: { type: 'number', minimum: 0 }
        }
      },
      PropertyRules: {
        type: 'object',
        properties: {
          checkIn: { type: 'string' },
          checkOut: { type: 'string' },
          cancellation: { type: 'string', enum: ['flexible', 'moderate', 'strict'] },
          instantBook: { type: 'boolean' },
          smoking: { type: 'boolean' },
          pets: { type: 'boolean' },
          parties: { type: 'boolean' },
          additionalRules: { type: 'array', items: { type: 'string' } }
        }
      },
      PropertyStats: {
        type: 'object',
        properties: {
          averageRating: { type: 'number', minimum: 0, maximum: 5 },
          numberOfReviews: { type: 'number', minimum: 0 },
          numberOfBookings: { type: 'number', minimum: 0 },
          viewCount: { type: 'number', minimum: 0 }
        }
      },
      Booking: {
        type: 'object',
        properties: {
          _id: { type: 'string', format: 'uuid' },
          propertyId: { type: 'string', format: 'uuid' },
          guestId: { type: 'string', format: 'uuid' },
          hostId: { type: 'string', format: 'uuid' },
          status: { type: 'string', enum: ['pending', 'confirmed', 'cancelled_by_guest', 'cancelled_by_host', 'completed', 'disputed', 'refunded'] },
          dates: { $ref: '#/components/schemas/BookingDates' },
          guests: { $ref: '#/components/schemas/BookingGuests' },
          payment: { $ref: '#/components/schemas/Payment' },
          specialRequests: { type: 'string' },
          cancellation: { $ref: '#/components/schemas/Cancellation' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      BookingDates: {
        type: 'object',
        properties: {
          checkIn: { type: 'string', format: 'date' },
          checkOut: { type: 'string', format: 'date' }
        }
      },
      BookingGuests: {
        type: 'object',
        properties: {
          adults: { type: 'number', minimum: 1 },
          children: { type: 'number', minimum: 0 },
          infants: { type: 'number', minimum: 0 },
          pets: { type: 'number', minimum: 0 }
        }
      },
      Payment: {
        type: 'object',
        properties: {
          stripePaymentIntentId: { type: 'string' },
          amount: { type: 'number', minimum: 0 },
          currency: { type: 'string' },
          status: { type: 'string', enum: ['pending', 'completed', 'failed', 'refunded'] },
          breakdown: { $ref: '#/components/schemas/PaymentBreakdown' }
        }
      },
      PaymentBreakdown: {
        type: 'object',
        properties: {
          basePrice: { type: 'number', minimum: 0 },
          cleaningFee: { type: 'number', minimum: 0 },
          serviceFee: { type: 'number', minimum: 0 },
          taxes: { type: 'number', minimum: 0 },
          total: { type: 'number', minimum: 0 }
        }
      },
      Cancellation: {
        type: 'object',
        properties: {
          date: { type: 'string', format: 'date-time' },
          reason: { type: 'string' },
          cancelledBy: { type: 'string', format: 'uuid' },
          refundAmount: { type: 'number', minimum: 0 }
        }
      },
      Notification: {
        type: 'object',
        properties: {
          _id: { type: 'string', format: 'uuid' },
          userId: { type: 'string', format: 'uuid' },
          type: { type: 'string' },
          title: { type: 'string' },
          message: { type: 'string' },
          data: { type: 'object' },
          read: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      Message: {
        type: 'object',
        properties: {
          _id: { type: 'string', format: 'uuid' },
          senderId: { type: 'string', format: 'uuid' },
          conversationId: { type: 'string', format: 'uuid' },
          content: { type: 'string' },
          attachments: { type: 'array', items: { $ref: '#/components/schemas/MessageAttachment' } },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      MessageAttachment: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['image', 'document'] },
          url: { type: 'string', format: 'uri' }
        }
      },
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string' },
          message: { type: 'string' },
          statusCode: { type: 'number' }
        }
      },
      Success: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: { type: 'object' },
          message: { type: 'string' }
        }
      }
    }
  },
  paths: {}
};

// Method to parse serverless configuration and extract API endpoints
function parseServerlessConfig(serviceName, configFile) {
  const filePath = path.join(__dirname, serviceName, configFile);
  
  if (!fs.existsSync(filePath)) {
    console.warn(`Configuration file not found: ${filePath}`);
    return [];
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const config = yaml.load(content);
    
    if (!config.functions) {
      return [];
    }

    const endpoints = [];
    
    Object.entries(config.functions).forEach(([functionName, functionConfig]) => {
      if (functionConfig.events) {
        functionConfig.events.forEach(event => {
          if (event.http) {
            endpoints.push({
              path: event.http.path,
              method: event.http.method.toUpperCase(),
              functionName,
              cors: event.http.cors,
              authorizer: event.http.authorizer,
              serviceName
            });
          }
        });
      }
    });

    return endpoints;
  } catch (error) {
    console.error(`Error parsing ${filePath}:`, error);
    return [];
  }
}

// Method to generate path definitions based on service and endpoint
function generatePathDefinition(endpoint) {
  const { path, method, functionName, authorizer, serviceName } = endpoint;
  
  const definition = {
    tags: [serviceName.charAt(0).toUpperCase() + serviceName.slice(1)],
    summary: generateSummary(functionName, serviceName),
    description: generateDescription(functionName, serviceName),
    parameters: extractPathParameters(path),
    responses: {
      '200': {
        description: 'Success',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Success' }
          }
        }
      },
      '400': {
        description: 'Bad Request',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' }
          }
        }
      },
      '401': {
        description: 'Unauthorized',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' }
          }
        }
      },
      '500': {
        description: 'Internal Server Error',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' }
          }
        }
      }
    }
  };

  // Add security if authorizer exists
  if (authorizer) {
    definition.security = [{ BearerAuth: [] }];
  }

  // Add request body for POST/PUT methods
  if (['POST', 'PUT'].includes(method)) {
    definition.requestBody = generateRequestBody(functionName, serviceName);
  }

  return definition;
}

// Generate human-readable summary from function name
function generateSummary(functionName, serviceName) {
  const summaries = {
    // Auth service
    signup: 'User registration',
    login: 'User authentication',
    googleAuth: 'Google OAuth authentication',
    refreshToken: 'Refresh JWT token',
    logout: 'User logout',
    sendOtp: 'Send OTP for verification',
    verifyOtp: 'Verify OTP code',
    deleteAccount: 'Delete user account',
    
    // Users service
    getUserProfile: 'Get user profile',
    updateUserProfile: 'Update user profile',
    updateUserPreferences: 'Update user preferences',
    getUserPreferences: 'Get user preferences',
    saveUserLocation: 'Save user location',
    getUserSavedLocations: 'Get user saved locations',
    deleteUserSavedLocation: 'Delete user saved location',
    switchUserRole: 'Switch user role',
    
    // Properties service
    createProperty: 'Create new property',
    getProperty: 'Get property details',
    updateProperty: 'Update property',
    getUserProperty: 'Get user properties',
    deleteProperty: 'Delete property',
    searchProperties: 'Search properties',
    uploadPropertyDocument: 'Upload property documents',
    uploadPropertyImages: 'Upload property images',
    deletePropertyDocument: 'Delete property document',
    deletePropertyImages: 'Delete property images',
    
    // Bookings service
    createBookings: 'Create new booking',
    getBookings: 'Get booking details',
    updateBookings: 'Update booking',
    getUserBookings: 'Get user bookings',
    getHostBookings: 'Get host bookings',
    cancelBooking: 'Cancel booking',
    getUserPastBookings: 'Get user booking history',
    getHostPastBookings: 'Get host booking history',
    
    // Notifications service
    createNotification: 'Create notification',
    getUserNotifications: 'Get user notifications',
    deleteNotification: 'Delete notification',
    
    // Messaging service
    sendMessage: 'Send message',
    getMessages: 'Get conversation messages',
    getUserConversations: 'Get user conversations',
    deleteMessage: 'Delete message',
    
    // Admin service
    getUsers: 'Get all users (Admin)',
    updateUser: 'Update user (Admin)',
    getProperties: 'Get properties for moderation (Admin)',
    updateProperty: 'Update property (Admin)',
    deleteProperty: 'Delete property (Admin)'
  };

  return summaries[functionName] || `${functionName} operation`;
}

// Generate description from function name and service
function generateDescription(functionName, serviceName) {
  const descriptions = {
    signup: 'Register a new user account with email and password',
    login: 'Authenticate user and return JWT token',
    googleAuth: 'Authenticate user using Google OAuth',
    refreshToken: 'Refresh expired JWT token using refresh token',
    logout: 'Logout user and invalidate tokens',
    sendOtp: 'Send OTP code to user\'s phone for verification',
    verifyOtp: 'Verify OTP code sent to user\'s phone',
    deleteAccount: 'Permanently delete user account and all associated data',
    
    getUserProfile: 'Retrieve complete user profile information',
    updateUserProfile: 'Update user profile information including personal details',
    updateUserPreferences: 'Update user preferences for notifications, language, etc.',
    getUserPreferences: 'Get user preferences and settings',
    saveUserLocation: 'Save a property location to user\'s favorites',
    getUserSavedLocations: 'Retrieve all user\'s saved property locations',
    deleteUserSavedLocation: 'Remove a saved location from user\'s favorites',
    switchUserRole: 'Switch user role between guest and host',
    
    createProperty: 'Create a new property listing with all details',
    getProperty: 'Retrieve detailed information about a specific property',
    updateProperty: 'Update property information and details',
    getUserProperty: 'Get all properties owned by a specific user',
    deleteProperty: 'Remove property listing permanently',
    searchProperties: 'Search for properties based on filters and criteria',
    uploadPropertyDocument: 'Upload legal documents for property verification',
    uploadPropertyImages: 'Upload property photos and images',
    deletePropertyDocument: 'Remove property verification documents',
    deletePropertyImages: 'Remove property images',
    
    createBookings: 'Create a new booking request for a property',
    getBookings: 'Get detailed information about a specific booking',
    updateBookings: 'Update booking details and status',
    getUserBookings: 'Get all bookings made by a user',
    getHostBookings: 'Get all bookings for properties owned by a host',
    cancelBooking: 'Cancel an existing booking',
    getUserPastBookings: 'Get user\'s booking history',
    getHostPastBookings: 'Get host\'s booking history',
    
    createNotification: 'Create and send a new notification to user',
    getUserNotifications: 'Get all notifications for a specific user',
    deleteNotification: 'Delete a specific notification',
    
    sendMessage: 'Send a message in a conversation',
    getMessages: 'Get all messages in a conversation',
    getUserConversations: 'Get all conversations for a user',
    deleteMessage: 'Delete a specific message',
    
    getUsers: 'Get all users for admin moderation (Admin only)',
    updateUser: 'Update any user\'s information (Admin only)',
    getProperties: 'Get all properties for moderation (Admin only)'
  };

  return descriptions[functionName] || `Perform ${functionName} operation in ${serviceName} service`;
}

// Extract path parameters from path string
function extractPathParameters(path) {
  const parameters = [];
  const matches = path.match(/{([^}]+)}/g);
  
  if (matches) {
    matches.forEach(match => {
      const paramName = match.slice(1, -1);
      parameters.push({
        name: paramName,
        in: 'path',
        required: true,
        schema: {
          type: paramName.toLowerCase().includes('id') ? 'string' : 'string',
          format: paramName.toLowerCase().includes('id') ? 'uuid' : undefined
        },
        description: `${paramName.charAt(0).toUpperCase() + paramName.slice(1)} identifier`
      });
    });
  }
  
  return parameters;
}

// Generate request body schema based on function name
function generateRequestBody(functionName, serviceName) {
  const requestBodies = {
    // Auth
    signup: {
      description: 'User registration data',
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['email', 'password', 'firstName', 'lastName', 'phone'],
            properties: {
              email: { type: 'string', format: 'email' },
              password: { type: 'string', minLength: 8 },
              firstName: { type: 'string' },
              lastName: { type: 'string' },
              phone: { type: 'string' }
            }
          }
        }
      }
    },
    login: {
      description: 'User login credentials',
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['email', 'password'],
            properties: {
              email: { type: 'string', format: 'email' },
              password: { type: 'string' }
            }
          }
        }
      }
    },
    googleAuth: {
      description: 'Google OAuth token',
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['token'],
            properties: {
              token: { type: 'string' }
            }
          }
        }
      }
    },
    
    // Properties
    createProperty: {
      description: 'Property creation data',
      required: true,
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/Property' }
        }
      }
    },
    updateProperty: {
      description: 'Property update data',
      required: true,
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/Property' }
        }
      }
    },
    
    // Bookings
    createBookings: {
      description: 'Booking creation data',
      required: true,
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/Booking' }
        }
      }
    },
    updateBookings: {
      description: 'Booking update data',
      required: true,
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/Booking' }
        }
      }
    }
  };

  return requestBodies[functionName] || {
    description: 'Request body',
    required: true,
    content: {
      'application/json': {
        schema: { type: 'object' }
      }
    }
  };
}

// Main function to generate Swagger documentation
function generateSwaggerDocumentation() {
  console.log('🚀 Starting Swagger documentation generation...');
  
  const allEndpoints = [];
  
  // Parse all services
  services.forEach(service => {
    console.log(`📋 Parsing ${service.name} service...`);
    const endpoints = parseServerlessConfig(service.name, service.file);
    allEndpoints.push(...endpoints);
    console.log(`   Found ${endpoints.length} endpoints`);
  });

  console.log(`📊 Total endpoints found: ${allEndpoints.length}`);

  // Generate paths for swagger document
  allEndpoints.forEach(endpoint => {
    const { path, method } = endpoint;
    
    if (!swaggerBase.paths[path]) {
      swaggerBase.paths[path] = {};
    }
    
    swaggerBase.paths[path][method.toLowerCase()] = generatePathDefinition(endpoint);
  });

  // Add tags for better organization
  swaggerBase.tags = [
    { name: 'Auth', description: 'Authentication and authorization operations' },
    { name: 'Users', description: 'User profile and preferences management' },
    { name: 'Properties', description: 'Property listing management' },
    { name: 'Bookings', description: 'Booking and reservation management' },
    { name: 'Notifications', description: 'Notification management' },
    { name: 'Messaging', description: 'In-app messaging system' },
    { name: 'Admin', description: 'Administrative operations' }
  ];

  // Write the complete Swagger documentation
  const outputPath = path.join(__dirname, 'swagger-documentation.json');
  fs.writeFileSync(outputPath, JSON.stringify(swaggerBase, null, 2));
  
  console.log(`✅ Swagger documentation generated successfully!`);
  console.log(`📄 Output file: ${outputPath}`);
  console.log(`🌐 You can now import this file into Swagger UI or Postman`);
  
  // Generate summary
  console.log('\n📈 Summary:');
  const serviceStats = {};
  allEndpoints.forEach(endpoint => {
    serviceStats[endpoint.serviceName] = (serviceStats[endpoint.serviceName] || 0) + 1;
  });
  
  Object.entries(serviceStats).forEach(([service, count]) => {
    console.log(`   ${service}: ${count} endpoints`);
  });

  return swaggerBase;
}

// Run the script
if (require.main === module) {
  try {
    generateSwaggerDocumentation();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error generating Swagger documentation:', error);
    process.exit(1);
  }
}

module.exports = { generateSwaggerDocumentation }; 