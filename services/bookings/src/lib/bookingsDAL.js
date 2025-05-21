const Joi = require('joi');

const paymentSchema = Joi.object({
    stripePaymentIntentId: Joi.string(), 
    paymentIntentId: Joi.string(), 
    amount: Joi.number().positive().required(),
    currency: Joi.string().length(3).required(),
    status: Joi.string().valid('pending', 'completed', 'failed', 'refunded').required(),
    breakdown: Joi.object({
        basePrice: Joi.number().positive().required(),
        cleaningFee: Joi.number().min(0).required(),
        serviceFee: Joi.number().min(0).required(),
        taxes: Joi.number().min(0).required(),
        total: Joi.number().positive().required()
    }),
    refund: Joi.object({
        amount: Joi.number().min(0),
        reason: Joi.string(),
        stripeRefundId: Joi.string(),
        processedAt: Joi.date()
    }),
    createdAt: Joi.date().default(Date.now),
    updatedAt: Joi.date().default(Date.now),
    completedAt: Joi.date(),
    details: Joi.object().optional(),
    payment_method: Joi.string().valid('credit_card', 'paypal', 'stripe', 'bank_transfer').optional(),
    payment_status: Joi.string().valid('pending', 'paid', 'failed', 'refunded').optional(),
    transaction_id: Joi.string().allow(null, '').optional(),
    payment_date: Joi.date().optional(),
    refunded: Joi.boolean().optional(),
    refundedAmount: Joi.number().min(0).optional(),
    refundedAt: Joi.date().optional(),
    refundReason: Joi.string().optional(),
    lastError: Joi.string().optional(),
    disputed: Joi.boolean().optional(),
    disputeDetails: Joi.object().optional()
});

// Booking Details Schema
const bookingDetailsSchema = Joi.object({
    booking_reference: Joi.string().required(),
    check_in: Joi.date().required(),
    check_out: Joi.date().greater(Joi.ref('check_in')).required(),
    total_nights: Joi.number().integer().positive().required(),
    guests: Joi.object({
        adults: Joi.number().integer().min(1).required(),
        children: Joi.number().integer().min(0).default(0),
        infants: Joi.number().integer().min(0).default(0)
    }).required(),
    special_requests: Joi.string().allow('').optional(),
    status: Joi.string().valid("pending", "confirmed", "cancelled", "completed", "no-show").default("pending"),
    booking_date: Joi.date().default(new Date()),
    last_updated: Joi.date().default(new Date()),
    payment: paymentSchema
});

// Pricing Schema
const pricingSchema = Joi.object({
    base_price: Joi.number().positive().required(),
    cleaning_fee: Joi.number().min(0).default(0),
    service_fee: Joi.number().min(0).default(0),
    taxes: Joi.number().min(0).default(0),
    deposit_amount: Joi.number().min(0).default(0),
    discounts: Joi.object({
        weekly_discount: Joi.number().min(0).max(100).default(0),
        monthly_discount: Joi.number().min(0).max(100).default(0),
        early_bird_discount: Joi.number().min(0).max(100).default(0),
        last_minute_discount: Joi.number().min(0).max(100).default(0),
        custom_discount: Joi.number().min(0).max(100).default(0)
    }).default({}),
    currency: Joi.string().default("USD"),
    total_amount: Joi.number().positive().required(),
    platform_commission: Joi.number().min(0).default(0)
});

// Cancellation Schema
const cancellationSchema = Joi.object({
    cancellation_policy: Joi.string().optional(),
    cancellation_reason: Joi.string().optional(),
    cancellation_date: Joi.date().optional(),
    cancellation_fee: Joi.number().min(0).optional(),
    refund_amount: Joi.number().min(0).optional(),
    cancelled_by: Joi.string().valid("guest", "host", "admin").optional()
});

// Metadata Schema
const metadataSchema = Joi.object({
    created_at: Joi.date().default(new Date()),
    updated_at: Joi.date().default(new Date())
});

// Final Booking Schema
const bookingSchema = Joi.object({
    _id: Joi.string().required(),
    property_id: Joi.string().required(),
    host_id: Joi.string().required(),
    guest_id: Joi.string().required(),
    bookingDetails: bookingDetailsSchema.required(),
    pricing: pricingSchema.required(),
    payment: paymentSchema.optional(),
    cancellation: cancellationSchema.optional(),
    metadata: metadataSchema.default()
});

// Exporting Modules
module.exports = {
    paymentSchema,
    bookingSchema,
    bookingDetailsSchema,
    pricingSchema,
    cancellationSchema,
    metadataSchema
};