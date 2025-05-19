const { connectToDatabase } = require('../../../../auth/src/lib/mongodb');
const response = require('../../../../auth/src/lib/response');
const { processRefund } = require('../../lib/stripeService');
const Joi = require('joi');

// Validation schema
const schema = Joi.object({
  bookingId: Joi.string().required(),
  amount: Joi.number().positive(),
  reason: Joi.string()
});

const handler = async (event) => {
  try {
    const requestData = JSON.parse(event.body);
    
    // Validate request data
    const { error } = schema.validate(requestData);
    if (error) {
      return response.error(error.details[0].message, 400);
    }
    
    const { bookingId, amount, reason } = requestData;
    const userId = event.requestContext.authorizer.principalId;
    
    // Connect to database
    const db = await connectToDatabase();
    
    // Get booking details
    const booking = await db.collection('bookings').findOne({ _id: bookingId });
    
    if (!booking) {
      return response.error('Booking not found', 404);
    }
    
    // Check if user is authorized (either the host or admin)
    if (booking.host_id !== userId) {
      // Check if user is admin - you need to implement this check
      const isAdmin = false; // Replace with actual admin check
      if (!isAdmin) {
        return response.error('Unauthorized to process refund for this booking', 403);
      }
    }
    
    // Check if booking has a payment
    if (!booking.payment || !booking.payment.paymentIntentId) {
      return response.error('No payment found for this booking', 400);
    }
    
    // Process refund with Stripe
    const refundDetails = await processRefund(
      booking.payment.paymentIntentId, 
      amount // If null, full refund will be processed
    );
    
    // Update booking with refund information
    const isFullRefund = !amount || amount >= booking.payment.amount;
    
    await db.collection('bookings').updateOne(
      { _id: bookingId },
      { 
        $set: { 
          status: isFullRefund ? 'refunded' : 'partially_refunded',
          'payment.refunded': true,
          'payment.refundedAmount': refundDetails.amount,
          'payment.refundedAt': new Date(),
          'payment.refundReason': reason || 'Host initiated refund',
          'payment.refundDetails': refundDetails
        }
      }
    );
    
    // Return success response
    return response.success({
      success: true,
      refund: refundDetails,
      booking: {
        _id: booking._id,
        status: isFullRefund ? 'refunded' : 'partially_refunded'
      }
    });
  } catch (error) {
    console.error('Process refund error:', error);
    return response.error('Error processing refund', 500);
  }
};

module.exports = { handler };