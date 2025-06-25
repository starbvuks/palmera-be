const { connectToDatabase } = require('../lib/mongodb');
const response = require('../lib/response');
const { createPaymentIntent } = require('../lib/stripeService');
const Joi = require('joi');

// Validation schema
const schema = Joi.object({
  bookingId: Joi.string().required(),
  amount: Joi.number().positive().required(),
  currency: Joi.string().length(3).required()
});

const handler = async (event) => {
  try {
    // Validate request body
    if (!event.body) {
      return response.error("Request body is required", 400);
    }

    let requestData;
    try {
      requestData = JSON.parse(event.body);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      return response.error("Invalid JSON in request body", 400);
    }
    
    // Validate request data
    const { error } = schema.validate(requestData);
    if (error) {
      console.error("Validation error:", error);
      return response.error(`Validation error: ${error.details[0].message}`, 400);
    }
    
    const { bookingId, amount, currency } = requestData;
    
    // Validate user authentication
    if (!event.requestContext || !event.requestContext.authorizer || !event.requestContext.authorizer.principalId) {
      return response.error("User authentication required", 401);
    }
    
    const userId = event.requestContext.authorizer.principalId;
    
    // Connect to database
    let db;
    try {
      db = await connectToDatabase();
    } catch (dbError) {
      console.error("Database connection error:", dbError);
      return response.error("Database connection failed", 503);
    }
    
    // Get booking details
    let booking;
    try {
      booking = await db.collection('bookings').findOne({ _id: bookingId });
    } catch (queryError) {
      console.error("Database query error:", queryError);
      return response.error("Failed to retrieve booking", 500);
    }
    
    if (!booking) {
      return response.error('Booking not found', 404);
    }
    
    // Check if user is authorized to pay for this booking
    if (booking.guest_id !== userId) {
      return response.error('Unauthorized to make payment for this booking', 403);
    }
    
    // Check if booking is in the correct state for payment
    if (booking.status !== 'pending') {
      return response.error(`Cannot process payment for booking with status: ${booking.status}`, 400);
    }
    
    // Check if payment already exists
    if (booking.payment && booking.payment.paymentIntentId) {
      return response.error('Payment intent already exists for this booking', 409);
    }
    
    // Create metadata for the payment intent
    const metadata = {
      bookingId,
      userId,
      propertyId: booking.property_id,
      hostId: booking.host_id,
      checkIn: booking.bookingDetails.check_in,
      checkOut: booking.bookingDetails.check_out
    };
    
    // Create payment intent with Stripe
    let paymentIntent;
    try {
      paymentIntent = await createPaymentIntent(amount, currency, metadata);
    } catch (stripeError) {
      console.error("Stripe payment intent creation error:", stripeError);
      return response.error("Failed to create payment intent", 500);
    }
    
    // Update booking with payment information
    try {
      const updateResult = await db.collection('bookings').updateOne(
        { _id: bookingId },
        { 
          $set: { 
            'payment': {
              paymentIntentId: paymentIntent.paymentIntentId,
              amount: amount,
              currency: currency,
              status: 'pending',
              createdAt: new Date()
            }
          }
        }
      );

      if (updateResult.matchedCount === 0) {
        return response.error("Booking not found during payment update", 404);
      }

      if (updateResult.modifiedCount === 0) {
        return response.error("Failed to update booking with payment information", 500);
      }
    } catch (updateError) {
      console.error("Booking payment update error:", updateError);
      return response.error("Failed to update booking with payment information", 500);
    }
    
    // Return client secret to the frontend
    return response.success({
      message: "Payment intent created successfully",
      clientSecret: paymentIntent.clientSecret,
      paymentIntentId: paymentIntent.paymentIntentId,
      amount,
      currency
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    return response.error('Internal server error', 500);
  }
};

module.exports = { handler };