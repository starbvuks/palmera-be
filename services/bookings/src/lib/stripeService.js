const Stripe = require('stripe');

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Create a new payment intent
 * @param {number} amount - Amount to charge (in dollars/euros)
 * @param {string} currency - Currency code (e.g., 'usd', 'eur')
 * @param {Object} metadata - Additional data to attach to the payment intent
 * @returns {Promise<Object>} - Payment intent details
 */
async function createPaymentIntent(amount, currency, metadata) {
  try {
    // Stripe requires amounts in cents
    const amountInCents = Math.round(amount * 100);
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: currency.toLowerCase(),
      metadata,
      // Optional parameters
      capture_method: 'automatic',
      // You can add automatic payment methods if needed:
      // automatic_payment_methods: { enabled: true }
    });
    
    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: amount,
      currency: currency
    };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
}

/**
 * Retrieve and confirm payment status
 * @param {string} paymentIntentId - Stripe payment intent ID
 * @returns {Promise<Object>} - Payment details and status
 */
async function confirmPayment(paymentIntentId) {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    return {
      paymentIntentId: paymentIntent.id,
      status: paymentIntent.status,
      succeeded: paymentIntent.status === 'succeeded',
      amount: paymentIntent.amount / 100, // Convert back to dollars/euros
      currency: paymentIntent.currency,
      paymentMethod: paymentIntent.payment_method,
      metadata: paymentIntent.metadata
    };
  } catch (error) {
    console.error('Error confirming payment:', error);
    throw error;
  }
}

/**
 * Process a refund
 * @param {string} paymentIntentId - Stripe payment intent ID
 * @param {number} amount - Amount to refund (optional, refunds entire amount if not specified)
 * @returns {Promise<Object>} - Refund details
 */
async function processRefund(paymentIntentId, amount = null) {
  try {
    const refundParams = { payment_intent: paymentIntentId };
    
    if (amount) {
      refundParams.amount = Math.round(amount * 100); // Convert to cents
    }
    
    const refund = await stripe.refunds.create(refundParams);
    
    return {
      refundId: refund.id,
      amount: refund.amount / 100,
      status: refund.status,
      paymentIntentId: refund.payment_intent
    };
  } catch (error) {
    console.error('Error processing refund:', error);
    throw error;
  }
}

/**
 * Verify a webhook signature
 * @param {string} payload - Raw request body
 * @param {string} signature - Stripe signature from headers
 * @returns {Object} - Event object if valid
 */
function verifyWebhookSignature(payload, signature) {
  try {
    return stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    throw error;
  }
}

module.exports = {
  createPaymentIntent,
  confirmPayment,
  processRefund,
  verifyWebhookSignature,
  stripe // Export for advanced use cases
};