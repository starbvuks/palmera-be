const { connectToDatabase } = require('../lib/mongodb');
const response = require('../lib/response');
const { verifyWebhookSignature } = require('../lib/stripeService');

const handler = async (event) => {
  try {
    // Get the Stripe signature from headers
    const signature = event.headers['stripe-signature'];
    
    if (!signature) {
      return response.error('Missing Stripe signature', 400);
    }
    
    // Verify webhook signature and parse the event
    const stripeEvent = verifyWebhookSignature(event.body, signature);
    
    // Connect to database
    const db = await connectToDatabase();
    
    // Handle different event types
    switch (stripeEvent.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(db, stripeEvent.data.object);
        break;
        
      case 'payment_intent.payment_failed':
        await handlePaymentFailure(db, stripeEvent.data.object);
        break;
        
      case 'charge.dispute.created':
        await handleDispute(db, stripeEvent.data.object);
        break;
        
      case 'charge.refunded':
        await handleRefund(db, stripeEvent.data.object);
        break;
    }
    
    // Return success response to Stripe
    return response.success({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return response.error('Webhook error', 500);
  }
};

/**
 * Handle successful payment
 */
async function handlePaymentSuccess(db, paymentIntent) {
  // Extract booking ID from metadata
  const { bookingId } = paymentIntent.metadata;
  
  if (!bookingId) {
    console.error('Payment success webhook missing bookingId in metadata');
    return;
  }
  
  // Update booking status
  await db.collection('bookings').updateOne(
    { _id: bookingId },
    { 
      $set: { 
        status: 'confirmed',
        'payment.status': 'completed',
        'payment.completedAt': new Date()
      }
    }
  );
  
  console.log(`Webhook: Payment succeeded for booking ${bookingId}`);
}

/**
 * Handle payment failure
 */
async function handlePaymentFailure(db, paymentIntent) {
  const { bookingId } = paymentIntent.metadata;
  
  if (!bookingId) {
    console.error('Payment failure webhook missing bookingId in metadata');
    return;
  }
  
  // Update booking with payment failure
  await db.collection('bookings').updateOne(
    { _id: bookingId },
    { 
      $set: { 
        'payment.status': 'failed',
        'payment.lastError': paymentIntent.last_payment_error?.message || 'Payment failed'
      }
    }
  );
  
  console.log(`Webhook: Payment failed for booking ${bookingId}`);
}

/**
 * Handle dispute/chargeback
 */
async function handleDispute(db, dispute) {
  const charge = dispute.charge;
  
  // Find booking with this charge
  const booking = await db.collection('bookings').findOne({
    'payment.details.charges.data.id': charge
  });
  
  if (!booking) {
    console.error(`No booking found for disputed charge ${charge}`);
    return;
  }
  
  // Update booking with dispute information
  await db.collection('bookings').updateOne(
    { _id: booking._id },
    { 
      $set: { 
        'payment.disputed': true,
        'payment.disputeDetails': {
          reason: dispute.reason,
          status: dispute.status,
          amount: dispute.amount / 100,
          created: new Date(dispute.created * 1000)
        }
      }
    }
  );
  
  console.log(`Webhook: Dispute created for booking ${booking._id}`);
}

/**
 * Handle refund
 */
async function handleRefund(db, charge) {
  // Find booking with this charge
  const booking = await db.collection('bookings').findOne({
    'payment.details.charges.data.id': charge.id
  });
  
  if (!booking) {
    console.error(`No booking found for refunded charge ${charge.id}`);
    return;
  }
  
  // Check if fully refunded
  const isFullRefund = charge.amount_refunded === charge.amount;
  
  // Update booking with refund information
  await db.collection('bookings').updateOne(
    { _id: booking._id },
    { 
      $set: { 
        status: isFullRefund ? 'refunded' : 'partially_refunded',
        'payment.refunded': true,
        'payment.refundedAmount': charge.amount_refunded / 100,
        'payment.refundedAt': new Date()
      }
    }
  );
  
  console.log(`Webhook: ${isFullRefund ? 'Full' : 'Partial'} refund processed for booking ${booking._id}`);
}

module.exports = { handler };