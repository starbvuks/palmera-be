# Palemra Backend

This is the **serverless-first backend** for **Palemra**, an Airbnb-style mobile application. Built using **AWS Lambda, API Gateway, MongoDB Atlas, and AWS services**, it provides a scalable and modular backend for the **React Native frontend**.

---

## Features
- **User Authentication & Role Management**: Secure JWT-based authentication for users and hosts.
- **Property Listings & Management**: CRUD operations with geolocation validation.
- **Booking & Payment Processing**: Integration with Stripe for transactions and refunds.
- **Real-Time Messaging**: User-host chat system with image support.
- **Notifications & Alerts**: SMS (AWS SNS), email (AWS SES), and push notifications (FCM).
- **File Storage**: AWS S3 for images and verification documents.
- **Admin & Security Controls**: Fraud detection and role-based access control.

---

## Architecture
- **Serverless**: AWS Lambda for business logic, API Gateway for RESTful endpoints.
- **Database**: MongoDB Atlas for data storage.
- **Event-Driven**: S3 triggers, SNS notifications, and DynamoDB Streams for real-time updates.
- **Modular Design**: Each Lambda function handles a single responsibility.

---

## Key Services
### **Authentication & User Management**
- `auth-signup`, `auth-login`, `auth-refresh-token`, `auth-2fa`, `auth-password-reset`

### **Property Management**
- `property-create`, `property-update`, `property-delete`, `property-verify-location`

### **Booking & Payments**
- `booking-create`, `booking-cancel`, `booking-history`

### **Notifications & Messaging**
- `sns-send-booking-alert`, `ses-send-user-notification`, `chat-send-message`, `chat-fetch-history`

### **Admin & Security**
- `admin-ban-user`, `admin-verify-host`, `admin-moderate-reports`

---

## Getting Started
### Prerequisites
- Node.js 18.x
- AWS CLI configured with IAM credentials
- MongoDB Atlas cluster
- Google Cloud OAuth credentials

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/palemra-backend.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   - Copy `.env.example` to `.env` and fill in the required values.

### Deployment
1. Deploy to AWS:
   ```bash
   serverless deploy
   ```
2. Test the API using the provided endpoint.

---

## Development
### Code Structure

palemra-backend/
├── services/ # Service-specific Lambda functions
├── shared/ # Shared libraries and models
├── serverless.yml # Serverless Framework configuration
├── package.json # Node.js dependencies
├── .env.example # Environment variables template
└── README.md # Project documentation


### Testing
Run unit and integration tests:
```
bash
npm test
```

---

## CI/CD
- **GitHub Actions**: Automates deployment to AWS.
- **AWS SAM**: Infrastructure as code for AWS resources.

---

## Monitoring
- **AWS CloudWatch**: Logs and metrics for Lambda functions and API Gateway.
- **Sentry**: Error tracking and monitoring.
- **MongoDB Atlas**: Performance metrics for database queries.

---

## Contributing
Contributions are welcome! Please follow the [contribution guidelines](CONTRIBUTING.md).

---

## License
This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

## Acknowledgments
- **AWS Serverless Framework** for scalable backend architecture.
- **MongoDB Atlas** for reliable data storage.
- **Stripe** for secure payment processing.
