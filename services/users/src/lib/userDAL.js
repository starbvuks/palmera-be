const Joi = require('joi');

const coordinatesSchema = Joi.object({
    type: Joi.string().valid('Point').default('Point'),
    coordinates: Joi.array().items(Joi.number()).length(2)
});

const addressSchema = Joi.object({
    street: Joi.string(),
    city: Joi.string(),
    state: Joi.string(),
    country: Joi.string(),
    postalCode: Joi.string(),
    coordinates: coordinatesSchema
});

const socialLinksSchema = Joi.object({
    facebook: Joi.string().uri(),
    twitter: Joi.string().uri(),
    instagram: Joi.string().uri(),
    linkedin: Joi.string().uri()
});

const authenticationSchema = Joi.object({
    passwordHash: Joi.string().required(),
    oauthProviders: Joi.array().items(
        Joi.object({
            provider: Joi.string().required(),
            providerId: Joi.string().required(),
            profileURL: Joi.string().uri()
        })
    ),
    twoFactorAuth: Joi.object({
        enabled: Joi.boolean().default(false),
        secret: Joi.string(),
        backupCodes: Joi.array().items(Joi.string())
    }),
    accountRecovery: Joi.object({
        recoveryEmail: Joi.string().email(),
        recoveryPhone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/)
    }),
    failedLoginAttempts: Joi.number().default(0)
});

const identityVerificationSchema = Joi.object({
    status: Joi.string().valid('pending', 'verified', 'rejected').default('pending'),
    documents: Joi.array().items(Joi.string()),
    verifiedAt: Joi.date(),
    idNumber: Joi.string()
});

const preferencesSchema = Joi.object({
    notification: Joi.object({
        email: Joi.boolean().default(true),
        sms: Joi.boolean().default(false),
        push: Joi.boolean().default(true)
    }),
    currency: Joi.string().default('USD'),
    language: Joi.string().default('en'),
    searchFilters: Joi.object({
        maxPrice: Joi.number(),
        propertyTypes: Joi.array().items(Joi.string()),
        amenities: Joi.array().items(Joi.string()),
        distance: Joi.number()
    })
});

const accountStatusSchema = Joi.object({
    status: Joi.string().valid('active', 'suspended', 'deleted').default('active'),
    createdAt: Joi.date().default(Date.now),
    updatedAt: Joi.date().default(Date.now),
    lastLogin: Joi.date()
});

const sessionInfoSchema = Joi.object({
    currentSessionStart: Joi.date(),
    accumulatedSessionDuration: Joi.number()
});

const rolesSchema = Joi.object({
    isHost: Joi.boolean().default(false),
    isSuperhost: Joi.boolean().default(false),
    isAdmin: Joi.boolean().default(false)
});

const hostDetailsSchema = Joi.object({
    verification: identityVerificationSchema,
    propertiesListed: Joi.array().items(Joi.string()),
    hostStats: Joi.object({
        totalBookings: Joi.number().default(0),
        responseRate: Joi.number(),
        cancellationRate: Joi.number(),
        averageRating: Joi.number(),
        totalEarnings: Joi.number(),
        lastMonthEarnings: Joi.number()
    }),
    bankDetails: Joi.object({
        bankName: Joi.string(),
        accountNumber: Joi.string(),
        routingNumber: Joi.string(),
        swiftCode: Joi.string()
    })
});

const savedItemsSchema = Joi.object({
    favoriteProperties: Joi.array().items(Joi.string()),
    savedSearches: Joi.array().items(
        Joi.object({
            searchQuery: Joi.string(),
            filters: Joi.object(),
            savedAt: Joi.date().default(Date.now)
        })
    )
});

const reviewsSchema = Joi.object({
    received: Joi.array().items(
        Joi.object({
            reviewerId: Joi.string(),
            rating: Joi.number(),
            comment: Joi.string(),
            createdAt: Joi.date().default(Date.now)
        })
    ),
    given: Joi.array().items(
        Joi.object({
            revieweeId: Joi.string(),
            rating: Joi.number(),
            comment: Joi.string(),
            createdAt: Joi.date().default(Date.now)
        })
    )
});

const subscriptionsSchema = Joi.object({
    plan: Joi.string().valid('basic', 'premium').default('basic'),
    status: Joi.string().valid('active', 'cancelled', 'expired').default('active'),
    startDate: Joi.date(),
    endDate: Joi.date(),
    nextBillingDate: Joi.date()
});

const activityLogSchema = Joi.array().items(
    Joi.object({
        action: Joi.string().required(),
        description: Joi.string(),
        timestamp: Joi.date().default(Date.now)
    })
);

const personalInfoSchema = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    fullName: Joi.string(),
    dateOfBirth: Joi.date(),
    gender: Joi.string().valid('male', 'female', 'other'),
    email: Joi.string().email().required(),
    phone: Joi.string().required(),
    profilePictureURL: Joi.string().uri(),
    photoGallery: Joi.array().items(Joi.string().uri()),
    bio: Joi.string(),
    languages: Joi.array().items(Joi.string()),
    address: addressSchema,
    socialLinks: socialLinksSchema
})

const userSchema = Joi.object({
    personalInfo: personalInfoSchema.required(),
    authentication: authenticationSchema.required(),
    identityVerification: identityVerificationSchema,
    preferences: preferencesSchema,
    accountStatus: accountStatusSchema,
    sessionInfo: sessionInfoSchema,
    roles: rolesSchema,
    hostDetails: hostDetailsSchema,
    savedItems: savedItemsSchema,
    reviews: reviewsSchema,
    subscriptions: subscriptionsSchema,
    activityLog: activityLogSchema
});

module.exports = { userSchema, preferencesSchema, personalInfoSchema, savedItemsSchema };