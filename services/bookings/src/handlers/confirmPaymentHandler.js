const { connectToDatabase } = require('../../../../auth/src/lib/mongodb');
const response = require('../../../../auth/src/lib/response');
const { confirmPayment } = require('../../lib/stripeService');
const Joi = require('joi');

// Validation schema
const schema = Joi.object({
  paymentIntentId: Joi.string().required(),
  bookingId: Joi.string().required()
});

const handler = async (event) => {
  try {
    const requestData = JSON.parse(event.body);
    
    // Validate request data
    const { error } = schema.validate(requestData);
    if (error) {
      return response.error(error.details[0].message, 400);
    }
    
    const { paymentIntentId, bookingId } = requestData;
    const userId = event.requestContext.authorizer.principalId;
    
    // Connect to database
    const db = await connectToDatabase();
    
    // Get booking details
    const booking = await db.collection('bookings').findOne({ _id: bookingId });
    
    if (!booking) {
      return response.error('Booking not found', 404);
    }
    
    // Check if the payment intent matches the booking
    if (!booking.payment || booking.payment.paymentIntentId !== paymentIntentId) {
      return response.error('Payment intent does not match this booking', 400);
    }
    
    // Confirm payment status with Stripe
    const paymentDetails = await confirmPayment(paymentIntentId);
    
    // Check if payment succeeded
    if (!paymentDetails.succeeded) {
      return response.success({
        success: false,
        status: paymentDetails.status,
        message: `Payment is ${paymentDetails.status}`
      });
    }
    
    // Update booking with payment confirmation
    await db.collection('bookings').updateOne(
      { _id: bookingId },
      { 
        $set: { 
          status: 'confirmed',
          'payment.status': 'completed',
          'payment.completedAt': new Date(),
          'payment.details': paymentDetails
        }
      }
    );
    
    // Return success response with booking details
    return response.success({
      success: true,
      booking: {
        _id: booking._id,
        status: 'confirmed',
        property_id: booking.property_id,
        bookingDetails: booking.bookingDetails,
        payment: {
          status: 'completed',
          amount: paymentDetails.amount,
          currency: paymentDetails.currency
        }
      }
    });
  } catch (error) {
    console.error('Confirm payment error:', error);
    return response.error('Error confirming payment', 500);
  }
};

module.exports = { handler };