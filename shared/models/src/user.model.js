const mongoose = require('mongoose');

const notificationSettingsSchema = new mongoose.Schema({
  email: { type: Boolean, default: true },
  sms: { type: Boolean, default: true },
  push: { type: Boolean, default: true },
});

const preferencesSchema = new mongoose.Schema({
  language: {
    type: String,
    enum: ['en', 'es', 'fr', 'de', 'it'],
    default: 'en',
  },
  currency: {
    type: String,
    enum: ['USD', 'EUR', 'GBP', 'JPY'],
    default: 'USD',
  },
  notifications: {
    type: notificationSettingsSchema,
    default: () => ({}),
  },
  theme: {
    type: String,
    enum: ['light', 'dark', 'system'],
    default: 'system',
  },
});

const hostDetailsSchema = new mongoose.Schema({
  businessName: { type: String, required: true },
  businessAddress: { type: String, required: true },
  taxId: { type: String, required: true },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending',
  },
  verificationDocuments: [{
    type: { type: String, enum: ['id', 'address', 'business'] },
    url: String,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    uploadedAt: { type: Date, default: Date.now },
  }],
});

const savedLocationSchema = new mongoose.Schema({
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true,
  },
  notes: { type: String, maxLength: 500 },
  savedAt: { type: Date, default: Date.now },
});

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: function() {
      return this.authProvider === 'local';
    },
  },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phone: {
    type: String,
    required: true,
    match: /^\+?[1-9]\d{1,14}$/,
  },
  profilePicture: String,
  role: {
    type: String,
    enum: ['user', 'host', 'admin'],
    default: 'user',
  },
  authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local',
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'deleted'],
    default: 'active',
  },
  preferences: {
    type: preferencesSchema,
    default: () => ({}),
  },
  hostDetails: hostDetailsSchema,
  savedLocations: [savedLocationSchema],
  lastLogin: Date,
  loginAttempts: { type: Number, default: 0 },
  lockUntil: Date,
  emailVerified: { type: Boolean, default: false },
  phoneVerified: { type: Boolean, default: false },
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  deletedAt: Date,
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });
userSchema.index({ 'savedLocations.propertyId': 1 });

// Update timestamps on save
userSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Methods
userSchema.methods.isLocked = function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

userSchema.methods.incrementLoginAttempts = async function() {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 },
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };
  if (this.loginAttempts + 1 >= 5) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }
  return this.updateOne(updates);
};

module.exports = mongoose.model('User', userSchema); 