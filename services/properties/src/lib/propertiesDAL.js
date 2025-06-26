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

// Update Property Schema - allows partial updates
const updatePropertySchema = Joi.object({
    _id: Joi.string().required(),
    host_id: Joi.string().optional(),
    basicInfo: Joi.object({
        title: Joi.string().optional(),
        description: Joi.string().optional(),
        property_type: Joi.string().valid("Entire place", "Private room", "Shared room").optional(),
        status: Joi.string().valid("active", "pending", "inactive").optional(),
    }).optional(),
    location: Joi.object({
        address: Joi.string().optional(),
        city: Joi.string().optional(),
        state: Joi.string().optional(),
        country: Joi.string().optional(),
        zip_code: Joi.string().optional(),
        coordinates: Joi.object({
            type: Joi.string().valid("Point").optional(),
            coordinates: Joi.array().items(Joi.number()).length(2).optional(),
        }).optional(),
    }).optional(),
    pricing: Joi.object({
        price_per_night: Joi.number().optional(),
        cleaning_fee: Joi.number().optional(),
        service_fee: Joi.number().optional(),
        currency: Joi.string().optional(),
        minimum_stay: Joi.number().optional(),
        maximum_stay: Joi.number().optional(),
        dynamic_pricing_enabled: Joi.boolean().optional(),
        seasonal_pricing: Joi.object().optional(),
        weekly_discount: Joi.number().optional(),
        monthly_discount: Joi.number().optional(),
        additional_discounts: Joi.object({
            early_bird: Joi.number().optional(),
            last_minute: Joi.number().optional(),
            referral_discount: Joi.number().optional(),
            custom_discounts: Joi.array().items(
                Joi.object({
                    code: Joi.string().optional(),
                    discount_percentage: Joi.number().optional(),
                    conditions: Joi.object({
                        min_nights: Joi.number().optional(),
                        applicable_dates: Joi.array().items(Joi.date()).optional(),
                    }).optional(),
                })
            ).optional(),
        }).optional(),
    }).optional(),
    availability: Joi.object({
        availability_calendar: Joi.array().items(Joi.date()).optional(),
        booking_buffer: Joi.number().optional(),
    }).optional(),
    amenities: Joi.object({
        wifi: Joi.boolean().optional(),
        parking: Joi.boolean().optional(),
        air_conditioning: Joi.boolean().optional(),
        heating: Joi.boolean().optional(),
        kitchen: Joi.boolean().optional(),
        pool: Joi.boolean().optional(),
        gym: Joi.boolean().optional(),
        pet_friendly: Joi.boolean().optional(),
        tv: Joi.boolean().optional(),
        laundry: Joi.boolean().optional(),
        smoke_detector: Joi.boolean().optional(),
        fire_extinguisher: Joi.boolean().optional(),
        additional_amenities: Joi.array().items(Joi.string()).optional(),
    }).optional(),
    media: Joi.object({
        photos: Joi.array().items(Joi.string().uri()).optional(),
        videos: Joi.array().items(Joi.string().uri()).optional(),
        thumbnail: Joi.string().uri().optional(),
        virtual_tour_link: Joi.string().uri().optional(),
    }).optional(),
    rules: Joi.object({
        house_rules: Joi.string().optional(),
        maximum_guests: Joi.number().optional(),
        minimum_age_requirement: Joi.number().optional(),
        smoking_allowed: Joi.boolean().optional(),
        pets_allowed: Joi.boolean().optional(),
        events_allowed: Joi.boolean().optional(),
    }).optional(),
    verification: Joi.object({
        documents: Joi.array().items(documentSchema).optional(),
        government_id_verified: Joi.boolean().optional(),
        ownership_proof_verified: Joi.boolean().optional(),
        admin_approved: Joi.boolean().optional(),
        physical_inspection_done: Joi.boolean().optional(),
    }).optional(),
    ratings: Joi.object({
        average_rating: Joi.number().optional(),
        number_of_reviews: Joi.number().optional(),
        client_rating_history: Joi.array().items(
            Joi.object({
                rating: Joi.number().optional(),
                timestamp: Joi.date().optional(),
            })
        ).optional(),
        host_response_rate: Joi.number().optional(),
        host_response_time: Joi.number().optional(),
    }).optional(),
    bookingSettings: Joi.object({
        instant_booking: Joi.boolean().optional(),
        cancellation_policy: Joi.string().optional(),
        check_in_time: Joi.string().optional(),
        check_out_time: Joi.string().optional(),
    }).optional(),
    hostInfo: Joi.object({
        host_name: Joi.string().optional(),
        host_profile_picture: Joi.string().uri().optional(),
        host_contact_email: Joi.string().email().optional(),
        host_phone_number: Joi.string().optional(),
        super_host: Joi.boolean().optional(),
    }).optional(),
    analytics: Joi.object({
        view_count: Joi.number().optional(),
        bookmark_count: Joi.number().optional(),
        conversion_rate: Joi.number().optional(),
    }).optional(),
    legal: Joi.object({
        tax_id: Joi.string().optional(),
        business_license_number: Joi.string().optional(),
        liability_waiver_signed: Joi.boolean().optional(),
    }).optional(),
    metadata: Joi.object({
        created_at: Joi.date().optional(),
        updated_at: Joi.date().optional(),
        deleted_at: Joi.date().allow(null).optional(),
        last_booked_at: Joi.date().allow(null).optional(),
    }).optional(),
    additionalDetails: Joi.object({
        bedrooms: Joi.number().optional(),
        bathrooms: Joi.number().optional(),
        beds: Joi.number().optional(),
        square_footage: Joi.number().optional(),
        occupancy_limit: Joi.number().optional(),
    }).optional(),
});

// Exporting Modules
module.exports = {
    propertySchema,
    updatePropertySchema
};