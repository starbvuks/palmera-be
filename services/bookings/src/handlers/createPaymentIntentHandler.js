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
    const requestData = JSON.parse(event.body);
    
    // Validate request data
    const { error } = schema.validate(requestData);
    if (error) {
      return response.error(error.details[0].message, 400);
    }
    
    const { bookingId, amount, currency } = requestData;
    const userId = event.requestContext.authorizer.principalId;
    
    // Connect to database
    const db = await connectToDatabase();
    
    // Get booking details
    const booking = await db.collection('bookings').findOne({ _id: bookingId });
    
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
    const paymentIntent = await createPaymentIntent(amount, currency, metadata);
    
    // Update booking with payment information
    await db.collection('bookings').updateOne(
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
    
    // Return client secret to the frontend
    return response.success({
      clientSecret: paymentIntent.clientSecret,
      paymentIntentId: paymentIntent.paymentIntentId
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    return response.error('Error creating payment intent', 500);
  }
};

module.exports = { handler };