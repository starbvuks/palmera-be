const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  stripePaymentIntentId: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    required: true,
  },
  breakdown: {
    basePrice: { type: Number, required: true },
    cleaningFee: { type: Number, required: true },
    serviceFee: { type: Number, required: true },
    taxes: { type: Number, required: true },
    total: { type: Number, required: true },
  },
  refund: {
    amount: Number,
    reason: String,
    stripeRefundId: String,
    processedAt: Date,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: { type: String, required: true },
  attachments: [{
    type: { type: String, enum: ['image', 'document'] },
    url: String,
  }],
  createdAt: { type: Date, default: Date.now },
});

const bookingSchema = new mongoose.Schema({
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true,
  },
  guestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  hostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: [
      'pending',
      'confirmed',
      'cancelled_by_guest',
      'cancelled_by_host',
      'completed',
      'disputed',
      'refunded',
    ],
    default: 'pending',
  },
  dates: {
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
  },
  guests: {
    adults: { type: Number, required: true },
    children: { type: Number, default: 0 },
    infants: { type: Number, default: 0 },
    pets: { type: Number, default: 0 },
  },
  payment: paymentSchema,
  specialRequests: String,
  cancellation: {
    date: Date,
    reason: String,
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    refundAmount: Number,
  },
  review: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property.reviews',
  },
  messages: [messageSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  deletedAt: Date,
});

// Indexes
bookingSchema.index({ propertyId: 1 });
bookingSchema.index({ guestId: 1 });
bookingSchema.index({ hostId: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ 'dates.checkIn': 1 });
bookingSchema.index({ 'dates.checkOut': 1 });
bookingSchema.index({ 'payment.stripePaymentIntentId': 1 });

// Update timestamps on save
bookingSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Validate dates
bookingSchema.pre('save', function(next) {
  if (this.dates.checkIn >= this.dates.checkOut) {
    next(new Error('Check-out date must be after check-in date'));
  }
  next();
});

// Methods
bookingSchema.methods.calculateDuration = function() {
  return Math.ceil(
    (this.dates.checkOut - this.dates.checkIn) / (1000 * 60 * 60 * 24)
  );
};

bookingSchema.methods.getTotalGuests = function() {
  return (
    this.guests.adults +
    this.guests.children +
    this.guests.infants
  );
};

module.exports = mongoose.model('Booking', bookingSchema); 