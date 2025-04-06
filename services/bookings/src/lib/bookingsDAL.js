const Joi = require('joi');

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
    last_updated: Joi.date().default(new Date())
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

// Payment Schema
const paymentSchema = Joi.object({
    payment_status: Joi.string().valid("pending", "paid", "failed", "refunded").default("pending"),
    payment_method: Joi.string().valid("credit_card", "paypal", "stripe", "bank_transfer").optional(),
    transaction_id: Joi.string().allow(null, '').optional(),
    payment_date: Joi.date().optional(),
    refund_status: Joi.string().valid("not_requested", "requested", "processed", "declined").default("not_requested"),
    refund_amount: Joi.number().min(0).optional(),
    refund_date: Joi.date().optional()
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
    bookingSchema,
    bookingDetailsSchema,
    pricingSchema,
    paymentSchema,
    cancellationSchema,
    metadataSchema
};