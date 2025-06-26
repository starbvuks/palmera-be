# Palmera Messaging API Demo Examples

This document provides practical examples for using the Palmera Messaging API endpoints.

## Base URL
```
https://am22amgo33.execute-api.us-east-1.amazonaws.com
```

## Authentication
All endpoints require Bearer token authentication. Include the token in the Authorization header:
```bash
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 1. Send Message

### Create a new conversation and send first message
```bash
curl -X POST https://am22amgo33.execute-api.us-east-1.amazonaws.com/messaging/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "message": "Hi, I am interested in your beautiful property!",
    "sentBy": "user-123e4567-e89b-12d3-a456-426614174000",
    "property_id": "prop-123e4567-e89b-12d3-a456-426614174000",
    "host_id": "host-123e4567-e89b-12d3-a456-426614174000",
    "guest_id": "guest-123e4567-e89b-12d3-a456-426614174000"
  }'
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Message sent successfully",
    "ConversationId": "conv-123e4567-e89b-12d3-a456-426614174000",
    "messageData": {
      "_id": "msg-123e4567-e89b-12d3-a456-426614174000",
      "message": "Hi, I am interested in your beautiful property!",
      "sentBy": "user-123e4567-e89b-12d3-a456-426614174000",
      "sentAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

### Send message to existing conversation
```bash
curl -X POST https://am22amgo33.execute-api.us-east-1.amazonaws.com/messaging/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "ConversationId": "conv-123e4567-e89b-12d3-a456-426614174000",
    "message": "What is the check-in time?",
    "sentBy": "user-123e4567-e89b-12d3-a456-426614174000",
    "property_id": "prop-123e4567-e89b-12d3-a456-426614174000",
    "host_id": "host-123e4567-e89b-12d3-a456-426614174000",
    "guest_id": "guest-123e4567-e89b-12d3-a456-426614174000"
  }'
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Message sent successfully",
    "ConversationId": "conv-123e4567-e89b-12d3-a456-426614174000",
    "messageData": {
      "_id": "msg-987fcdeb-51a2-43d1-b789-123456789abc",
      "message": "What is the check-in time?",
      "sentBy": "user-123e4567-e89b-12d3-a456-426614174000",
      "sentAt": "2024-01-15T10:35:00.000Z"
    }
  }
}
```

### Error Responses

**Validation Error (400):**
```bash
curl -X POST https://am22amgo33.execute-api.us-east-1.amazonaws.com/messaging/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "sentBy": "user-123e4567-e89b-12d3-a456-426614174000",
    "property_id": "prop-123e4567-e89b-12d3-a456-426614174000"
  }'
```

**Response (400):**
```json
{
  "success": false,
  "error": "Validation error: message is required"
}
```

**Invalid JSON (400):**
```bash
curl -X POST https://am22amgo33.execute-api.us-east-1.amazonaws.com/messaging/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d 'invalid json'
```

**Response (400):**
```json
{
  "success": false,
  "error": "Invalid JSON in request body"
}
```

---

## 2. Get User Conversations

### Retrieve all conversations for a user
```bash
curl -X GET https://am22amgo33.execute-api.us-east-1.amazonaws.com/messaging/conversations/user-123e4567-e89b-12d3-a456-426614174000 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "conversations": [
      {
        "_id": "conv-123e4567-e89b-12d3-a456-426614174000",
        "property_id": "prop-123e4567-e89b-12d3-a456-426614174000",
        "host_id": "host-123e4567-e89b-12d3-a456-426614174000",
        "guest_id": "guest-123e4567-e89b-12d3-a456-426614174000",
        "createdAt": "2024-01-15T10:30:00.000Z"
      },
      {
        "_id": "conv-987fcdeb-51a2-43d1-b789-123456789abc",
        "property_id": "prop-987fcdeb-51a2-43d1-b789-123456789abc",
        "host_id": "host-987fcdeb-51a2-43d1-b789-123456789abc",
        "guest_id": "guest-987fcdeb-51a2-43d1-b789-123456789abc",
        "createdAt": "2024-01-14T15:20:00.000Z"
      }
    ],
    "count": 2
  }
}
```

### Error Responses

**No Conversations Found (404):**
```bash
curl -X GET https://am22amgo33.execute-api.us-east-1.amazonaws.com/messaging/conversations/user-nonexistent \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (404):**
```json
{
  "success": false,
  "error": "No conversations found for this user"
}
```

**Invalid User ID (400):**
```bash
curl -X GET https://am22amgo33.execute-api.us-east-1.amazonaws.com/messaging/conversations/ \
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

## 3. Get Conversation Messages

### Retrieve all messages in a conversation
```bash
curl -X GET https://am22amgo33.execute-api.us-east-1.amazonaws.com/messaging/conversations/conv-123e4567-e89b-12d3-a456-426614174000/messages \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "_id": "msg-123e4567-e89b-12d3-a456-426614174000",
        "message": "Hi, I am interested in your beautiful property!",
        "sentBy": "user-123e4567-e89b-12d3-a456-426614174000",
        "sentAt": "2024-01-15T10:30:00.000Z"
      },
      {
        "_id": "msg-987fcdeb-51a2-43d1-b789-123456789abc",
        "message": "What is the check-in time?",
        "sentBy": "user-123e4567-e89b-12d3-a456-426614174000",
        "sentAt": "2024-01-15T10:35:00.000Z"
      },
      {
        "_id": "msg-456abcde-78f9-4g2h-i3j4-k5l6m7n8o9p0",
        "message": "Check-in is at 3 PM. Looking forward to hosting you!",
        "sentBy": "host-123e4567-e89b-12d3-a456-426614174000",
        "sentAt": "2024-01-15T10:40:00.000Z"
      }
    ],
    "conversationId": "conv-123e4567-e89b-12d3-a456-426614174000",
    "messageCount": 3
  }
}
```

### Error Responses

**Conversation Not Found (404):**
```bash
curl -X GET https://am22amgo33.execute-api.us-east-1.amazonaws.com/messaging/conversations/nonexistent-conv/messages \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (404):**
```json
{
  "success": false,
  "error": "Conversation not found"
}
```

**Invalid Conversation ID (400):**
```bash
curl -X GET https://am22amgo33.execute-api.us-east-1.amazonaws.com/messaging/conversations//messages \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (400):**
```json
{
  "success": false,
  "error": "Conversation ID is required"
}
```

---

## 4. Delete Message

### Delete a specific message from a conversation
```bash
curl -X DELETE https://am22amgo33.execute-api.us-east-1.amazonaws.com/messaging/conversations/conv-123e4567-e89b-12d3-a456-426614174000/messages/msg-987fcdeb-51a2-43d1-b789-123456789abc \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Message deleted successfully",
    "conversationId": "conv-123e4567-e89b-12d3-a456-426614174000",
    "messageId": "msg-987fcdeb-51a2-43d1-b789-123456789abc",
    "remainingMessages": 2
  }
}
```

### Error Responses

**Message Not Found (404):**
```bash
curl -X DELETE https://am22amgo33.execute-api.us-east-1.amazonaws.com/messaging/conversations/conv-123e4567-e89b-12d3-a456-426614174000/messages/nonexistent-msg \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (404):**
```json
{
  "success": false,
  "error": "Message not found"
}
```

**Conversation Not Found (404):**
```bash
curl -X DELETE https://am22amgo33.execute-api.us-east-1.amazonaws.com/messaging/conversations/nonexistent-conv/messages/msg-987fcdeb-51a2-43d1-b789-123456789abc \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (404):**
```json
{
  "success": false,
  "error": "Conversation not found"
}
```

**Missing Parameters (400):**
```bash
curl -X DELETE https://am22amgo33.execute-api.us-east-1.amazonaws.com/messaging/conversations//messages/ \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (400):**
```json
{
  "success": false,
  "error": "Conversation ID is required"
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

---

## Testing with Postman

### Environment Variables
Set up these environment variables in Postman:
- `base_url`: `https://am22amgo33.execute-api.us-east-1.amazonaws.com`
- `auth_token`: Your JWT token

### Collection Setup
1. Create a new collection called "Palmera Messaging API"
2. Set the Authorization type to "Bearer Token" at the collection level
3. Use `{{auth_token}}` as the token value
4. Set the base URL to `{{base_url}}`

### Request Examples

**Send Message:**
- Method: POST
- URL: `{{base_url}}/messaging/send`
- Headers: `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "message": "Hi, I am interested in your property!",
  "sentBy": "user-123e4567-e89b-12d3-a456-426614174000",
  "property_id": "prop-123e4567-e89b-12d3-a456-426614174000",
  "host_id": "host-123e4567-e89b-12d3-a456-426614174000",
  "guest_id": "guest-123e4567-e89b-12d3-a456-426614174000"
}
```

**Get User Conversations:**
- Method: GET
- URL: `{{base_url}}/messaging/conversations/user-123e4567-e89b-12d3-a456-426614174000`

**Get Conversation Messages:**
- Method: GET
- URL: `{{base_url}}/messaging/conversations/conv-123e4567-e89b-12d3-a456-426614174000/messages`

**Delete Message:**
- Method: DELETE
- URL: `{{base_url}}/messaging/conversations/conv-123e4567-e89b-12d3-a456-426614174000/messages/msg-987fcdeb-51a2-43d1-b789-123456789abc`

---

## Rate Limiting
- 100 requests per minute per user
- 1000 requests per hour per user

## Best Practices
1. Always include proper error handling in your client code
2. Validate message content before sending
3. Implement retry logic for failed requests
4. Use pagination for large conversation lists (future enhancement)
5. Implement real-time messaging using WebSocket connections (future enhancement) 