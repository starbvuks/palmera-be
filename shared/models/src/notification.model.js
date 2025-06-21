const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: [
      'booking_request',
      'booking_confirmed',
      'booking_cancelled',
      'booking_reminder',
      'message_received',
      'payment_successful',
      'payment_failed',
      'refund_processed',
      'review_received',
      'account_update',
      'property_status_change',
      'host_response',
    ],
    required: true,
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  data: {
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
    messageId: String,
    paymentId: String,
    reviewId: String,
    amount: Number,
    additionalInfo: mongoose.Schema.Types.Mixed,
  },
  channels: {
    inApp: { type: Boolean, default: true },
    email: { type: Boolean, default: false },
    sms: { type: Boolean, default: false },
    push: { type: Boolean, default: false },
  },
  status: {
    read: { type: Boolean, default: false },
    readAt: Date,
    emailSent: { type: Boolean, default: false },
    emailSentAt: Date,
    smsSent: { type: Boolean, default: false },
    smsSentAt: Date,
    pushSent: { type: Boolean, default: false },
    pushSentAt: Date,
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  expiresAt: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  deletedAt: Date,
});

// Indexes
notificationSchema.index({ userId: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ 'status.read': 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Update timestamps on save
notificationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Methods
notificationSchema.methods.markAsRead = async function() {
  this.status.read = true;
  this.status.readAt = new Date();
  return this.save();
};

notificationSchema.methods.markAsSent = async function(channel) {
  const now = new Date();
  switch (channel) {
    case 'email':
      this.status.emailSent = true;
      this.status.emailSentAt = now;
      break;
    case 'sms':
      this.status.smsSent = true;
      this.status.smsSentAt = now;
      break;
    case 'push':
      this.status.pushSent = true;
      this.status.pushSentAt = now;
      break;
  }
  return this.save();
};

module.exports = mongoose.model('Notification', notificationSchema); 