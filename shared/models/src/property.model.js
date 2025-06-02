const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'],
    default: 'Point',
  },
  coordinates: {
    type: [Number], // [longitude, latitude]
    required: true,
  },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    zipCode: { type: String, required: true },
  },
  placeId: String, // Google Maps Place ID
});

const amenitySchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ['basic', 'safety', 'accessibility', 'outdoor', 'entertainment', 'workspace'],
    required: true,
  },
  name: { type: String, required: true },
  icon: String,
  description: String,
});

const availabilitySchema = new mongoose.Schema({
  date: { type: Date, required: true },
  isBlocked: { type: Boolean, default: false },
  price: { type: Number, required: true },
  minimumStay: { type: Number, default: 1 },
});

const reviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: { type: String, maxLength: 1000 },
  cleanliness: { type: Number, min: 1, max: 5 },
  communication: { type: Number, min: 1, max: 5 },
  checkIn: { type: Number, min: 1, max: 5 },
  accuracy: { type: Number, min: 1, max: 5 },
  location: { type: Number, min: 1, max: 5 },
  value: { type: Number, min: 1, max: 5 },
  photos: [String],
  response: {
    comment: String,
    createdAt: { type: Date, default: Date.now },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const propertySchema = new mongoose.Schema({
  hostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: {
    type: String,
    enum: ['house', 'apartment', 'guesthouse', 'hotel', 'villa'],
    required: true,
  },
  category: {
    type: String,
    enum: ['beachfront', 'mountain', 'city', 'countryside', 'luxury'],
    required: true,
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'active', 'inactive', 'deleted'],
    default: 'draft',
  },
  basePrice: { type: Number, required: true },
  cleaningFee: { type: Number, default: 0 },
  serviceFee: { type: Number, default: 0 },
  capacity: {
    guests: { type: Number, required: true },
    bedrooms: { type: Number, required: true },
    beds: { type: Number, required: true },
    bathrooms: { type: Number, required: true },
  },
  location: {
    type: locationSchema,
    required: true,
  },
  amenities: [amenitySchema],
  images: [{
    url: { type: String, required: true },
    caption: String,
    order: { type: Number, default: 0 },
  }],
  availability: [availabilitySchema],
  rules: {
    checkIn: { type: String, required: true },
    checkOut: { type: String, required: true },
    cancellation: {
      type: String,
      enum: ['flexible', 'moderate', 'strict'],
      required: true,
    },
    instantBook: { type: Boolean, default: false },
    smoking: { type: Boolean, default: false },
    pets: { type: Boolean, default: false },
    parties: { type: Boolean, default: false },
    additionalRules: [String],
  },
  reviews: [reviewSchema],
  stats: {
    averageRating: { type: Number, default: 0 },
    numberOfReviews: { type: Number, default: 0 },
    numberOfBookings: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  deletedAt: Date,
});

// Indexes
propertySchema.index({ 'location.coordinates': '2dsphere' });
propertySchema.index({ hostId: 1 });
propertySchema.index({ status: 1 });
propertySchema.index({ basePrice: 1 });
propertySchema.index({ 'stats.averageRating': -1 });
propertySchema.index({ 'availability.date': 1 });

// Update timestamps on save
propertySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Calculate average rating when a review is added or updated
propertySchema.pre('save', function(next) {
  if (this.reviews && this.reviews.length > 0) {
    const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    this.stats.averageRating = totalRating / this.reviews.length;
    this.stats.numberOfReviews = this.reviews.length;
  }
  next();
});

module.exports = mongoose.model('Property', propertySchema); 