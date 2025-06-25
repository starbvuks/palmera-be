# Palmera Backend Deployment Guide

This guide provides complete step-by-step instructions for deploying the Palmera backend services and integrating with the frontend.

## 🚀 Quick Start

### Prerequisites
- AWS CLI configured with appropriate permissions
- Node.js 18+ installed
- Serverless Framework installed globally
- MongoDB Atlas account
- AWS S3 bucket for file uploads
- Twilio account (for SMS/OTP)

### Environment Setup
```bash
# Install dependencies
npm install -g serverless

# Configure AWS credentials
aws configure

# Install project dependencies
cd palmera-be
npm install
```

## 📋 Step-by-Step Deployment

### Step 1: Environment Configuration

Create environment files for each service:

#### Auth Service (`services/auth/`)
```bash
cd services/auth
cp .env.example .env
```

Edit `.env`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/palmera
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890
GOOGLE_CLIENT_ID=your-google-client-id
```

#### Users Service (`services/users/`)
```bash
cd services/users
cp .env.example .env
```

Edit `.env`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/palmera
JWT_SECRET=your-super-secret-jwt-key
```

#### Properties Service (`services/properties/`)
```bash
cd services/properties
cp .env.example .env
```

Edit `.env`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/palmera
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your-s3-bucket-name
```

#### Bookings Service (`services/bookings/`)
```bash
cd services/bookings
cp .env.example .env
```

Edit `.env`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/palmera
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
```

#### Messaging Service (`services/messaging/`)
```bash
cd services/messaging
cp .env.example .env
```

Edit `.env`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/palmera
```

#### Notifications Service (`services/notifications/`)
```bash
cd services/notifications
cp .env.example .env
```

Edit `.env`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/palmera
```

#### Admin Service (`services/admin/`)
```bash
cd services/admin
cp .env.example .env
```

Edit `.env`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/palmera
JWT_SECRET=your-super-secret-jwt-key
```

### Step 2: Deploy Services

Deploy each service in the following order:

#### 1. Deploy Auth Service
```bash
cd services/auth
serverless deploy --stage prod
```

**Expected Output:**
```
endpoints:
  POST - https://m71ar6e3f9.execute-api.us-east-1.amazonaws.com/auth/login
  POST - https://m71ar6e3f9.execute-api.us-east-1.amazonaws.com/auth/signup
  POST - https://m71ar6e3f9.execute-api.us-east-1.amazonaws.com/auth/send-otp
  POST - https://m71ar6e3f9.execute-api.us-east-1.amazonaws.com/auth/verify-otp
  POST - https://m71ar6e3f9.execute-api.us-east-1.amazonaws.com/auth/google-oauth
  POST - https://m71ar6e3f9.execute-api.us-east-1.amazonaws.com/auth/refresh-token
  POST - https://m71ar6e3f9.execute-api.us-east-1.amazonaws.com/auth/logout
  DELETE - https://m71ar6e3f9.execute-api.us-east-1.amazonaws.com/auth/delete-account
```

#### 2. Deploy Users Service
```bash
cd services/users
serverless deploy --stage prod
```

**Expected Output:**
```
endpoints:
  GET - https://ct4rgp2633.execute-api.us-east-1.amazonaws.com/users/{id}
  PUT - https://ct4rgp2633.execute-api.us-east-1.amazonaws.com/users/{id}
  GET - https://ct4rgp2633.execute-api.us-east-1.amazonaws.com/users/{id}/preferences
  PUT - https://ct4rgp2633.execute-api.us-east-1.amazonaws.com/users/{id}/preferences
  POST - https://ct4rgp2633.execute-api.us-east-1.amazonaws.com/users/{id}/locations
  GET - https://ct4rgp2633.execute-api.us-east-1.amazonaws.com/users/{id}/locations
  DELETE - https://ct4rgp2633.execute-api.us-east-1.amazonaws.com/users/{id}/locations/{locationId}
  GET - https://ct4rgp2633.execute-api.us-east-1.amazonaws.com/users/{id}/subscription
  PUT - https://ct4rgp2633.execute-api.us-east-1.amazonaws.com/users/{id}/subscription
  PUT - https://ct4rgp2633.execute-api.us-east-1.amazonaws.com/users/{id}/role
```

#### 3. Deploy Properties Service
```bash
cd services/properties
serverless deploy --stage prod
```

**Expected Output:**
```
endpoints:
  POST - https://fk0ojke7ka.execute-api.us-east-1.amazonaws.com/properties
  GET - https://fk0ojke7ka.execute-api.us-east-1.amazonaws.com/properties/search
  GET - https://fk0ojke7ka.execute-api.us-east-1.amazonaws.com/properties/{id}
  PUT - https://fk0ojke7ka.execute-api.us-east-1.amazonaws.com/properties/{id}
  DELETE - https://fk0ojke7ka.execute-api.us-east-1.amazonaws.com/properties/{id}
  GET - https://fk0ojke7ka.execute-api.us-east-1.amazonaws.com/properties/user/{id}
  POST - https://fk0ojke7ka.execute-api.us-east-1.amazonaws.com/properties/{id}/images
  DELETE - https://fk0ojke7ka.execute-api.us-east-1.amazonaws.com/properties/{id}/images
  POST - https://fk0ojke7ka.execute-api.us-east-1.amazonaws.com/properties/{id}/documents
  DELETE - https://fk0ojke7ka.execute-api.us-east-1.amazonaws.com/properties/{id}/documents/{docId}
```

#### 4. Deploy Bookings Service
```bash
cd services/bookings
serverless deploy --stage prod
```

**Expected Output:**
```
endpoints:
  POST - https://097aqk2gwf.execute-api.us-east-1.amazonaws.com/bookings
  GET - https://097aqk2gwf.execute-api.us-east-1.amazonaws.com/bookings/{id}
  PUT - https://097aqk2gwf.execute-api.us-east-1.amazonaws.com/bookings/{id}
  DELETE - https://097aqk2gwf.execute-api.us-east-1.amazonaws.com/bookings/{id}
  GET - https://097aqk2gwf.execute-api.us-east-1.amazonaws.com/bookings/user/{id}
  GET - https://097aqk2gwf.execute-api.us-east-1.amazonaws.com/bookings/host/{id}
  GET - https://097aqk2gwf.execute-api.us-east-1.amazonaws.com/bookings/user/{id}/history
  GET - https://097aqk2gwf.execute-api.us-east-1.amazonaws.com/bookings/host/{id}/history
  POST - https://097aqk2gwf.execute-api.us-east-1.amazonaws.com/bookings/{id}/payment-intent
  POST - https://097aqk2gwf.execute-api.us-east-1.amazonaws.com/bookings/{id}/confirm-payment
  POST - https://097aqk2gwf.execute-api.us-east-1.amazonaws.com/bookings/{id}/refund
  POST - https://097aqk2gwf.execute-api.us-east-1.amazonaws.com/webhook/stripe
```

#### 5. Deploy Messaging Service
```bash
cd services/messaging
serverless deploy --stage prod
```

**Expected Output:**
```
endpoints:
  POST - https://am22amgo33.execute-api.us-east-1.amazonaws.com/conversations/{id}/messages
  GET - https://am22amgo33.execute-api.us-east-1.amazonaws.com/conversations/{id}/messages
  GET - https://am22amgo33.execute-api.us-east-1.amazonaws.com/conversations/user/{id}
  DELETE - https://am22amgo33.execute-api.us-east-1.amazonaws.com/conversations/{id}/messages/{messageId}
```

#### 6. Deploy Notifications Service
```bash
cd services/notifications
serverless deploy --stage prod
```

**Expected Output:**
```
endpoints:
  POST - https://z421qustb7.execute-api.us-east-1.amazonaws.com/notifications
  GET - https://z421qustb7.execute-api.us-east-1.amazonaws.com/notifications/user/{id}
  DELETE - https://z421qustb7.execute-api.us-east-1.amazonaws.com/notifications/{id}
```

#### 7. Deploy Admin Service
```bash
cd services/admin
serverless deploy --stage prod
```

**Expected Output:**
```
endpoints:
  GET - https://8u9wyib7j4.execute-api.us-east-1.amazonaws.com/admin/users
  PUT - https://8u9wyib7j4.execute-api.us-east-1.amazonaws.com/admin/users/{id}
  GET - https://8u9wyib7j4.execute-api.us-east-1.amazonaws.com/admin/properties/moderation
  PUT - https://8u9wyib7j4.execute-api.us-east-1.amazonaws.com/admin/properties/{id}
  DELETE - https://8u9wyib7j4.execute-api.us-east-1.amazonaws.com/admin/properties/{id}
  POST - https://8u9wyib7j4.execute-api.us-east-1.amazonaws.com/admin/notifications/system
```

### Step 3: Update Frontend Configuration

Create a configuration file in your frontend project:

```typescript
// config/api.ts
export const API_CONFIG = {
  // Auth Service
  AUTH_BASE_URL: 'https://m71ar6e3f9.execute-api.us-east-1.amazonaws.com',
  
  // Users Service
  USERS_BASE_URL: 'https://ct4rgp2633.execute-api.us-east-1.amazonaws.com',
  
  // Properties Service
  PROPERTIES_BASE_URL: 'https://fk0ojke7ka.execute-api.us-east-1.amazonaws.com',
  
  // Bookings Service
  BOOKINGS_BASE_URL: 'https://097aqk2gwf.execute-api.us-east-1.amazonaws.com',
  
  // Messaging Service
  MESSAGING_BASE_URL: 'https://am22amgo33.execute-api.us-east-1.amazonaws.com',
  
  // Notifications Service
  NOTIFICATIONS_BASE_URL: 'https://z421qustb7.execute-api.us-east-1.amazonaws.com',
  
  // Admin Service
  ADMIN_BASE_URL: 'https://8u9wyib7j4.execute-api.us-east-1.amazonaws.com',
};

export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: `${API_CONFIG.AUTH_BASE_URL}/auth/login`,
  SIGNUP: `${API_CONFIG.AUTH_BASE_URL}/auth/signup`,
  SEND_OTP: `${API_CONFIG.AUTH_BASE_URL}/auth/send-otp`,
  VERIFY_OTP: `${API_CONFIG.AUTH_BASE_URL}/auth/verify-otp`,
  GOOGLE_OAUTH: `${API_CONFIG.AUTH_BASE_URL}/auth/google-oauth`,
  REFRESH_TOKEN: `${API_CONFIG.AUTH_BASE_URL}/auth/refresh-token`,
  LOGOUT: `${API_CONFIG.AUTH_BASE_URL}/auth/logout`,
  DELETE_ACCOUNT: `${API_CONFIG.AUTH_BASE_URL}/auth/delete-account`,
  
  // User endpoints
  GET_USER: (id: string) => `${API_CONFIG.USERS_BASE_URL}/users/${id}`,
  UPDATE_USER: (id: string) => `${API_CONFIG.USERS_BASE_URL}/users/${id}`,
  GET_PREFERENCES: (id: string) => `${API_CONFIG.USERS_BASE_URL}/users/${id}/preferences`,
  UPDATE_PREFERENCES: (id: string) => `${API_CONFIG.USERS_BASE_URL}/users/${id}/preferences`,
  SAVE_LOCATION: (id: string) => `${API_CONFIG.USERS_BASE_URL}/users/${id}/locations`,
  GET_SAVED_LOCATIONS: (id: string) => `${API_CONFIG.USERS_BASE_URL}/users/${id}/locations`,
  DELETE_LOCATION: (id: string, locationId: string) => 
    `${API_CONFIG.USERS_BASE_URL}/users/${id}/locations/${locationId}`,
  GET_SUBSCRIPTION: (id: string) => `${API_CONFIG.USERS_BASE_URL}/users/${id}/subscription`,
  UPDATE_SUBSCRIPTION: (id: string) => `${API_CONFIG.USERS_BASE_URL}/users/${id}/subscription`,
  CHANGE_ROLE: (id: string) => `${API_CONFIG.USERS_BASE_URL}/users/${id}/role`,
  
  // Property endpoints
  CREATE_PROPERTY: `${API_CONFIG.PROPERTIES_BASE_URL}/properties`,
  SEARCH_PROPERTIES: `${API_CONFIG.PROPERTIES_BASE_URL}/properties/search`,
  GET_PROPERTY: (id: string) => `${API_CONFIG.PROPERTIES_BASE_URL}/properties/${id}`,
  UPDATE_PROPERTY: (id: string) => `${API_CONFIG.PROPERTIES_BASE_URL}/properties/${id}`,
  DELETE_PROPERTY: (id: string) => `${API_CONFIG.PROPERTIES_BASE_URL}/properties/${id}`,
  GET_USER_PROPERTIES: (id: string) => `${API_CONFIG.PROPERTIES_BASE_URL}/properties/user/${id}`,
  UPLOAD_PROPERTY_IMAGES: (id: string) => `${API_CONFIG.PROPERTIES_BASE_URL}/properties/${id}/images`,
  DELETE_PROPERTY_IMAGES: (id: string) => `${API_CONFIG.PROPERTIES_BASE_URL}/properties/${id}/images`,
  UPLOAD_PROPERTY_DOCUMENTS: (id: string) => `${API_CONFIG.PROPERTIES_BASE_URL}/properties/${id}/documents`,
  DELETE_PROPERTY_DOCUMENT: (id: string, docId: string) => 
    `${API_CONFIG.PROPERTIES_BASE_URL}/properties/${id}/documents/${docId}`,
  
  // Booking endpoints
  CREATE_BOOKING: `${API_CONFIG.BOOKINGS_BASE_URL}/bookings`,
  GET_BOOKING: (id: string) => `${API_CONFIG.BOOKINGS_BASE_URL}/bookings/${id}`,
  UPDATE_BOOKING: (id: string) => `${API_CONFIG.BOOKINGS_BASE_URL}/bookings/${id}`,
  DELETE_BOOKING: (id: string) => `${API_CONFIG.BOOKINGS_BASE_URL}/bookings/${id}`,
  GET_USER_BOOKINGS: (id: string) => `${API_CONFIG.BOOKINGS_BASE_URL}/bookings/user/${id}`,
  GET_HOST_BOOKINGS: (id: string) => `${API_CONFIG.BOOKINGS_BASE_URL}/bookings/host/${id}`,
  GET_USER_BOOKING_HISTORY: (id: string) => `${API_CONFIG.BOOKINGS_BASE_URL}/bookings/user/${id}/history`,
  GET_HOST_BOOKING_HISTORY: (id: string) => `${API_CONFIG.BOOKINGS_BASE_URL}/bookings/host/${id}/history`,
  CREATE_PAYMENT_INTENT: (id: string) => `${API_CONFIG.BOOKINGS_BASE_URL}/bookings/${id}/payment-intent`,
  CONFIRM_PAYMENT: (id: string) => `${API_CONFIG.BOOKINGS_BASE_URL}/bookings/${id}/confirm-payment`,
  REFUND_PAYMENT: (id: string) => `${API_CONFIG.BOOKINGS_BASE_URL}/bookings/${id}/refund`,
  
  // Messaging endpoints
  SEND_MESSAGE: (id: string) => `${API_CONFIG.MESSAGING_BASE_URL}/conversations/${id}/messages`,
  GET_CONVERSATION_MESSAGES: (id: string) => `${API_CONFIG.MESSAGING_BASE_URL}/conversations/${id}/messages`,
  GET_USER_CONVERSATIONS: (id: string) => `${API_CONFIG.MESSAGING_BASE_URL}/conversations/user/${id}`,
  DELETE_MESSAGE: (id: string, messageId: string) => 
    `${API_CONFIG.MESSAGING_BASE_URL}/conversations/${id}/messages/${messageId}`,
  
  // Notification endpoints
  CREATE_NOTIFICATION: `${API_CONFIG.NOTIFICATIONS_BASE_URL}/notifications`,
  GET_USER_NOTIFICATIONS: (id: string) => `${API_CONFIG.NOTIFICATIONS_BASE_URL}/notifications/user/${id}`,
  DELETE_NOTIFICATION: (id: string) => `${API_CONFIG.NOTIFICATIONS_BASE_URL}/notifications/${id}`,
  
  // Admin endpoints
  GET_ALL_USERS: `${API_CONFIG.ADMIN_BASE_URL}/admin/users`,
  UPDATE_USER_ADMIN: (id: string) => `${API_CONFIG.ADMIN_BASE_URL}/admin/users/${id}`,
  GET_PROPERTIES_FOR_MODERATION: `${API_CONFIG.ADMIN_BASE_URL}/admin/properties/moderation`,
  UPDATE_PROPERTY_ADMIN: (id: string) => `${API_CONFIG.ADMIN_BASE_URL}/admin/properties/${id}`,
  DELETE_PROPERTY_ADMIN: (id: string) => `${API_CONFIG.ADMIN_BASE_URL}/admin/properties/${id}`,
  CREATE_SYSTEM_NOTIFICATION: `${API_CONFIG.ADMIN_BASE_URL}/admin/notifications/system`,
};
```

### Step 4: Create API Client

Create a reusable API client for your frontend:

```typescript
// services/apiClient.ts
import { API_ENDPOINTS } from '../config/api';

class ApiClient {
  private baseHeaders = {
    'Content-Type': 'application/json',
  };

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('accessToken');
    return {
      ...this.baseHeaders,
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async handleResponse(response: Response) {
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }
    
    return data;
  }

  // Auth methods
  async login(credentials: { email: string; password: string }) {
    const response = await fetch(API_ENDPOINTS.LOGIN, {
      method: 'POST',
      headers: this.baseHeaders,
      body: JSON.stringify(credentials),
    });
    return this.handleResponse(response);
  }

  async signup(userData: { email: string; password: string; firstName: string; lastName: string }) {
    const response = await fetch(API_ENDPOINTS.SIGNUP, {
      method: 'POST',
      headers: this.baseHeaders,
      body: JSON.stringify(userData),
    });
    return this.handleResponse(response);
  }

  async sendOtp(phoneNumber: string) {
    const response = await fetch(API_ENDPOINTS.SEND_OTP, {
      method: 'POST',
      headers: this.baseHeaders,
      body: JSON.stringify({ phoneNumber }),
    });
    return this.handleResponse(response);
  }

  async verifyOtp(phoneNumber: string, otp: string) {
    const response = await fetch(API_ENDPOINTS.VERIFY_OTP, {
      method: 'POST',
      headers: this.baseHeaders,
      body: JSON.stringify({ phoneNumber, otp }),
    });
    return this.handleResponse(response);
  }

  // Property methods
  async createProperty(propertyData: any) {
    const response = await fetch(API_ENDPOINTS.CREATE_PROPERTY, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(propertyData),
    });
    return this.handleResponse(response);
  }

  async searchProperties(filters: any) {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_ENDPOINTS.SEARCH_PROPERTIES}?${queryParams}`, {
      method: 'GET',
      headers: this.baseHeaders,
    });
    return this.handleResponse(response);
  }

  async getProperty(id: string) {
    const response = await fetch(API_ENDPOINTS.GET_PROPERTY(id), {
      method: 'GET',
      headers: this.baseHeaders,
    });
    return this.handleResponse(response);
  }

  async updateProperty(id: string, propertyData: any) {
    const response = await fetch(API_ENDPOINTS.UPDATE_PROPERTY(id), {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(propertyData),
    });
    return this.handleResponse(response);
  }

  async deleteProperty(id: string) {
    const response = await fetch(API_ENDPOINTS.DELETE_PROPERTY(id), {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async uploadPropertyImages(propertyId: string, files: File[]) {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    const response = await fetch(API_ENDPOINTS.UPLOAD_PROPERTY_IMAGES(propertyId), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: formData,
    });
    return this.handleResponse(response);
  }

  // Booking methods
  async createBooking(bookingData: any) {
    const response = await fetch(API_ENDPOINTS.CREATE_BOOKING, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(bookingData),
    });
    return this.handleResponse(response);
  }

  async getBooking(id: string) {
    const response = await fetch(API_ENDPOINTS.GET_BOOKING(id), {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // User methods
  async getUser(id: string) {
    const response = await fetch(API_ENDPOINTS.GET_USER(id), {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async updateUser(id: string, userData: any) {
    const response = await fetch(API_ENDPOINTS.UPDATE_USER(id), {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(userData),
    });
    return this.handleResponse(response);
  }

  // Messaging methods
  async sendMessage(conversationId: string, message: string) {
    const response = await fetch(API_ENDPOINTS.SEND_MESSAGE(conversationId), {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ message }),
    });
    return this.handleResponse(response);
  }

  async getConversationMessages(conversationId: string) {
    const response = await fetch(API_ENDPOINTS.GET_CONVERSATION_MESSAGES(conversationId), {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // Notification methods
  async getUserNotifications(userId: string) {
    const response = await fetch(API_ENDPOINTS.GET_USER_NOTIFICATIONS(userId), {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async deleteNotification(id: string) {
    const response = await fetch(API_ENDPOINTS.DELETE_NOTIFICATION(id), {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }
}

export const apiClient = new ApiClient();
```

### Step 5: Test Integration

Create test functions to verify all endpoints:

```typescript
// tests/apiIntegration.test.ts
import { apiClient } from '../services/apiClient';

describe('API Integration Tests', () => {
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    // Test authentication
    const loginResponse = await apiClient.login({
      email: 'test@example.com',
      password: 'password123'
    });
    authToken = loginResponse.data.accessToken;
    userId = loginResponse.data.user._id;
  });

  test('should create a property', async () => {
    const propertyData = {
      host_id: userId,
      basicInfo: {
        title: 'Test Property',
        description: 'A test property for integration testing',
        property_type: 'Entire place',
        status: 'pending'
      },
      location: {
        address: '123 Test St',
        city: 'Test City',
        state: 'TS',
        country: 'Test Country'
      },
      pricing: {
        price_per_night: 100,
        currency: 'USD'
      },
      amenities: {
        wifi: true,
        parking: true
      }
    };

    const response = await apiClient.createProperty(propertyData);
    expect(response.success).toBe(true);
    expect(response.data.propertyData).toBeDefined();
  });

  test('should search properties', async () => {
    const filters = {
      location: 'Test City',
      min_price: 50,
      max_price: 200
    };

    const response = await apiClient.searchProperties(filters);
    expect(response.success).toBe(true);
    expect(response.data.properties).toBeDefined();
  });

  // Add more tests for other endpoints...
});
```

## 🔧 Configuration Management

### Environment Variables

Create environment-specific configuration files:

```typescript
// config/environments.ts
export const environments = {
  development: {
    API_CONFIG: {
      AUTH_BASE_URL: 'http://localhost:3001',
      USERS_BASE_URL: 'http://localhost:3002',
      PROPERTIES_BASE_URL: 'http://localhost:3003',
      BOOKINGS_BASE_URL: 'http://localhost:3004',
      MESSAGING_BASE_URL: 'http://localhost:3005',
      NOTIFICATIONS_BASE_URL: 'http://localhost:3006',
      ADMIN_BASE_URL: 'http://localhost:3007',
    }
  },
  staging: {
    API_CONFIG: {
      AUTH_BASE_URL: 'https://staging-auth.palmera.com',
      USERS_BASE_URL: 'https://staging-users.palmera.com',
      PROPERTIES_BASE_URL: 'https://staging-properties.palmera.com',
      BOOKINGS_BASE_URL: 'https://staging-bookings.palmera.com',
      MESSAGING_BASE_URL: 'https://staging-messaging.palmera.com',
      NOTIFICATIONS_BASE_URL: 'https://staging-notifications.palmera.com',
      ADMIN_BASE_URL: 'https://staging-admin.palmera.com',
    }
  },
  production: {
    API_CONFIG: {
      AUTH_BASE_URL: 'https://m71ar6e3f9.execute-api.us-east-1.amazonaws.com',
      USERS_BASE_URL: 'https://ct4rgp2633.execute-api.us-east-1.amazonaws.com',
      PROPERTIES_BASE_URL: 'https://fk0ojke7ka.execute-api.us-east-1.amazonaws.com',
      BOOKINGS_BASE_URL: 'https://097aqk2gwf.execute-api.us-east-1.amazonaws.com',
      MESSAGING_BASE_URL: 'https://am22amgo33.execute-api.us-east-1.amazonaws.com',
      NOTIFICATIONS_BASE_URL: 'https://z421qustb7.execute-api.us-east-1.amazonaws.com',
      ADMIN_BASE_URL: 'https://8u9wyib7j4.execute-api.us-east-1.amazonaws.com',
    }
  }
};
```

## 🚨 Error Handling

Implement comprehensive error handling:

```typescript
// utils/errorHandler.ts
export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const handleApiError = (error: any) => {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 400:
        // Handle validation errors
        console.error('Validation error:', error.message);
        break;
      case 401:
        // Handle authentication errors
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        break;
      case 403:
        // Handle authorization errors
        console.error('Access denied:', error.message);
        break;
      case 404:
        // Handle not found errors
        console.error('Resource not found:', error.message);
        break;
      case 500:
        // Handle server errors
        console.error('Server error:', error.message);
        break;
      case 503:
        // Handle service unavailable
        console.error('Service unavailable:', error.message);
        break;
      default:
        console.error('Unknown error:', error.message);
    }
  } else {
    console.error('Network error:', error);
  }
};
```

## 📊 Monitoring and Logging

### API Monitoring

Set up monitoring for your API endpoints:

```typescript
// utils/monitoring.ts
export const logApiCall = (endpoint: string, method: string, duration: number, status: number) => {
  console.log(`API Call: ${method} ${endpoint} - ${status} (${duration}ms)`);
  
  // Send to monitoring service
  if (process.env.NODE_ENV === 'production') {
    // Send to your monitoring service (e.g., Sentry, LogRocket, etc.)
  }
};

export const logError = (error: any, context: string) => {
  console.error(`Error in ${context}:`, error);
  
  // Send to error tracking service
  if (process.env.NODE_ENV === 'production') {
    // Send to your error tracking service
  }
};
```

## 🔒 Security Considerations

### CORS Configuration

Ensure proper CORS configuration in your API Gateway:

```yaml
# serverless.yml (for each service)
functions:
  handler:
    events:
      - http:
          cors:
            origin: 
              - 'https://your-frontend-domain.com'
              - 'http://localhost:3000' # for development
            headers:
              - Content-Type
              - X-Amz-Date
              - Authorization
              - X-Api-Key
              - X-Amz-Security-Token
            allowCredentials: true
```

### Rate Limiting

Implement rate limiting in API Gateway:

```yaml
# serverless.yml
functions:
  handler:
    events:
      - http:
          throttling:
            rate: 100
            burst: 200
```

## 🧪 Testing Strategy

### Unit Tests

```typescript
// tests/apiClient.test.ts
import { apiClient } from '../services/apiClient';

describe('ApiClient', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('should handle authentication correctly', async () => {
    const mockToken = 'mock-jwt-token';
    localStorage.setItem('accessToken', mockToken);
    
    const headers = apiClient['getAuthHeaders']();
    expect(headers.Authorization).toBe(`Bearer ${mockToken}`);
  });

  test('should handle API errors correctly', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ error: 'Bad Request' })
    });

    await expect(apiClient.login({ email: '', password: '' }))
      .rejects
      .toThrow('Bad Request');
  });
});
```

### Integration Tests

```typescript
// tests/integration/api.test.ts
import { apiClient } from '../../services/apiClient';

describe('API Integration', () => {
  test('should complete full booking flow', async () => {
    // 1. Search for properties
    const searchResponse = await apiClient.searchProperties({
      location: 'New York',
      min_price: 100,
      max_price: 200
    });
    expect(searchResponse.success).toBe(true);

    // 2. Get property details
    const propertyId = searchResponse.data.properties[0]._id;
    const propertyResponse = await apiClient.getProperty(propertyId);
    expect(propertyResponse.success).toBe(true);

    // 3. Create booking
    const bookingResponse = await apiClient.createBooking({
      propertyId,
      checkIn: '2024-01-15',
      checkOut: '2024-01-20',
      guests: 2
    });
    expect(bookingResponse.success).toBe(true);

    // 4. Confirm payment
    const paymentResponse = await apiClient.confirmPayment(bookingResponse.data.booking._id);
    expect(paymentResponse.success).toBe(true);
  });
});
```

## 📈 Performance Optimization

### Caching Strategy

```typescript
// utils/cache.ts
class ApiCache {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly TTL = 5 * 60 * 1000; // 5 minutes

  set(key: string, data: any) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  get(key: string) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > this.TTL) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear() {
    this.cache.clear();
  }
}

export const apiCache = new ApiCache();
```

### Request Optimization

```typescript
// utils/requestOptimizer.ts
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};
```

## 🚀 Deployment Checklist

### Pre-Deployment
- [ ] All environment variables configured
- [ ] MongoDB connection tested
- [ ] AWS credentials configured
- [ ] S3 bucket permissions set
- [ ] Stripe keys configured (for bookings)
- [ ] Twilio credentials configured (for auth)

### Deployment
- [ ] Deploy auth service first
- [ ] Deploy users service
- [ ] Deploy properties service
- [ ] Deploy bookings service
- [ ] Deploy messaging service
- [ ] Deploy notifications service
- [ ] Deploy admin service
- [ ] Update frontend configuration
- [ ] Test all endpoints

### Post-Deployment
- [ ] Verify all endpoints are accessible
- [ ] Test authentication flow
- [ ] Test file uploads
- [ ] Test payment processing
- [ ] Monitor error logs
- [ ] Set up monitoring alerts

## 📞 Support

For deployment issues or questions:

1. **Check the logs**: Use `serverless logs -f functionName -t` to view function logs
2. **Verify environment variables**: Ensure all required variables are set
3. **Test locally**: Use `serverless offline` for local testing
4. **Check AWS Console**: Verify resources are created correctly
5. **Review API Gateway**: Ensure CORS and authentication are configured

## 🔄 Updates and Maintenance

### Updating Services

```bash
# Update a specific service
cd services/auth
serverless deploy --stage prod

# Update all services
cd palmera-be
for service in auth users properties bookings messaging notifications admin; do
  cd services/$service
  serverless deploy --stage prod
  cd ../..
done
```

### Monitoring and Alerts

Set up CloudWatch alarms for:
- API Gateway 4xx/5xx errors
- Lambda function errors
- Database connection issues
- Response time thresholds

This comprehensive deployment guide ensures a smooth integration between your frontend and the Palmera backend services. Follow each step carefully and test thoroughly before going live. 