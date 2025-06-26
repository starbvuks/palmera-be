const Joi = require('joi');

// Basic Info Schema
const basicInfoSchema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    property_type: Joi.string().valid("Entire place", "Private room", "Shared room").required(),
    status: Joi.string().valid("active", "pending", "inactive").default("pending"),
});

// Location Schema
const locationSchema = Joi.object({
    address: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    country: Joi.string().required(),
    zip_code: Joi.string().required(),
    coordinates: Joi.object({
        type: Joi.string().valid("Point").default("Point"),
        coordinates: Joi.array().items(Joi.number()).length(2).required(), // [longitude, latitude]
    }).required(),
});

// Pricing Schema
const pricingSchema = Joi.object({
    price_per_night: Joi.number().required(),
    cleaning_fee: Joi.number(),
    service_fee: Joi.number(),
    currency: Joi.string().default("USD"),
    minimum_stay: Joi.number().required(),
    maximum_stay: Joi.number().required(),
    dynamic_pricing_enabled: Joi.boolean().default(false),
    seasonal_pricing: Joi.object().empty(null).default({}),
    weekly_discount: Joi.number(),
    monthly_discount: Joi.number(),
    additional_discounts: Joi.object({
        early_bird: Joi.number(),
        last_minute: Joi.number(),
        referral_discount: Joi.number(),
        custom_discounts: Joi.array().items(
            Joi.object({
                code: Joi.string(),
                discount_percentage: Joi.number(),
                conditions: Joi.object({
                    min_nights: Joi.number(),
                    applicable_dates: Joi.array().items(Joi.date()),
                }),
            })
        ),
    }),
});

// Availability Schema
const availabilitySchema = Joi.object({
    availability_calendar: Joi.array().items(Joi.date()),
    booking_buffer: Joi.number(),
});

// Amenities Schema
const amenitiesSchema = Joi.object({
    wifi: Joi.boolean(),
    parking: Joi.boolean(),
    air_conditioning: Joi.boolean(),
    heating: Joi.boolean(),
    kitchen: Joi.boolean(),
    pool: Joi.boolean(),
    gym: Joi.boolean(),
    pet_friendly: Joi.boolean(),
    tv: Joi.boolean(),
    laundry: Joi.boolean(),
    smoke_detector: Joi.boolean(),
    fire_extinguisher: Joi.boolean(),
    additional_amenities: Joi.array().items(Joi.string()),
});

// Media Schema
const mediaSchema = Joi.object({
    photos: Joi.array().items(Joi.string().uri()),
    videos: Joi.array().items(Joi.string().uri()),
    thumbnail: Joi.string().uri(),
    virtual_tour_link: Joi.string().uri(),
});

// Rules Schema
const rulesSchema = Joi.object({
    house_rules: Joi.string(),
    maximum_guests: Joi.number(),
    minimum_age_requirement: Joi.number(),
    smoking_allowed: Joi.boolean(),
    pets_allowed: Joi.boolean(),
    events_allowed: Joi.boolean(),
});

// Document Schema
const documentSchema = Joi.object({
    document_name: Joi.string(),
    id: Joi.string(),
    document_url: Joi.string().uri(),
});

// Verification Schema
const verificationSchema = Joi.object({
    documents: Joi.array().items(documentSchema),
    government_id_verified: Joi.boolean().default(false),
    ownership_proof_verified: Joi.boolean().default(false),
    admin_approved: Joi.boolean().default(false),
    physical_inspection_done: Joi.boolean().default(false),
});

// Ratings Schema
const ratingsSchema = Joi.object({
    average_rating: Joi.number().default(0.0),
    number_of_reviews: Joi.number().default(0),
    client_rating_history: Joi.array().items(
        Joi.object({
            rating: Joi.number(),
            timestamp: Joi.date(),
        })
    ),
    host_response_rate: Joi.number(),
    host_response_time: Joi.number(),
});

// Booking Settings Schema
const bookingSettingsSchema = Joi.object({
    instant_booking: Joi.boolean().default(false),
    cancellation_policy: Joi.string(),
    check_in_time: Joi.string(),
    check_out_time: Joi.string(),
});

// Host Info Schema
const hostInfoSchema = Joi.object({
    host_name: Joi.string(),
    host_profile_picture: Joi.string().uri(),
    host_contact_email: Joi.string().email(),
    host_phone_number: Joi.string(),
    super_host: Joi.boolean().default(false),
});

// Analytics Schema
const analyticsSchema = Joi.object({
    view_count: Joi.number().default(0),
    bookmark_count: Joi.number().default(0),
    conversion_rate: Joi.number(),
});

// Legal Schema
const legalSchema = Joi.object({
    tax_id: Joi.string(),
    business_license_number: Joi.string(),
    liability_waiver_signed: Joi.boolean().default(false),
});

// Metadata Schema
const metadataSchema = Joi.object({
    created_at: Joi.date().default(new Date()),
    updated_at: Joi.date().default(new Date()),
    deleted_at: Joi.date().allow(null),
    last_booked_at: Joi.date().allow(null),
});

// Additional Details Schema
const additionalDetailsSchema = Joi.object({
    bedrooms: Joi.number(),
    bathrooms: Joi.number(),
    beds: Joi.number(),
    square_footage: Joi.number(),
    occupancy_limit: Joi.number(),
});

// **Final Property Schema**
const propertySchema = Joi.object({
    _id: Joi.string().required(),
    host_id: Joi.string().required(),
    basicInfo: basicInfoSchema.required(),
    location: locationSchema.required(),
    pricing: pricingSchema.required(),
    availability: availabilitySchema.required(),
    amenities: amenitiesSchema,
    media: mediaSchema,
    rules: rulesSchema,
    verification: verificationSchema,
    ratings: ratingsSchema,
    bookingSettings: bookingSettingsSchema,
    hostInfo: hostInfoSchema,
    analytics: analyticsSchema,
    legal: legalSchema,
    metadata: metadataSchema,
    additionalDetails: additionalDetailsSchema,
});

// Exporting Modules
module.exports = {
    propertySchema
};