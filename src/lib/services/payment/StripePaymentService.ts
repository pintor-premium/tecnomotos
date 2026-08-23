import {
  PaymentService,
  CartItem,
  CheckoutSession,
  PaymentStatus,
  WebhookResult,
  RefundResult,
} from './PaymentService';

export class StripePaymentService extends PaymentService {
  private secretKey: string;
  private mode: string;

  constructor() {
    super();
    this.secretKey = process.env.STRIPE_SECRET_KEY || '';
    this.mode = process.env.STRIPE_MODE || 'test';
  }

  async createCheckoutSession(
    userId: string,
    items: CartItem[],
    cancelUrl: string,
    successUrl: string
  ): Promise<CheckoutSession> {
    console.log(`[Stripe Mock] Creating checkout session for user: ${userId} with items:`, items, `Redirecting to: ${successUrl} (success) or ${cancelUrl} (cancel)`);

    if (this.mode !== 'test') {
      console.warn('[Stripe Warning] Mode is not set to "test". Real Stripe calls are not implemented yet.');
    }

    const sessionId = `cs_test_${Math.random().toString(36).substring(2, 15)}`;
    return {
      id: sessionId,
      url: `https://checkout.stripe.com/pay/${sessionId}`,
      mode: this.mode,
    };
  }

  async getPaymentStatus(sessionId: string): Promise<PaymentStatus> {
    console.log(`[Stripe Mock] Fetching payment status for session: ${sessionId}`);

    return {
      id: `ch_test_${Math.random().toString(36).substring(2, 15)}`,
      status: 'paid',
      amount: 150.0,
      customerEmail: 'cliente@tecnomotos.com.br',
    };
  }

  async processWebhook(payload: string, signature: string): Promise<WebhookResult> {
    console.log('[Stripe Mock] Processing incoming webhook event with signature:', signature);

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET environment variable is missing.');
    }

    try {
      const event = JSON.parse(payload);
      return {
        processed: true,
        event: event.type || 'checkout.session.completed',
        message: 'Stripe Mock Webhook processed successfully.',
      };
    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : 'Erro desconhecido';
      return {
        processed: false,
        event: 'unknown',
        message: `Failed to parse payload: ${errMsg}`,
      };
    }
  }

  async refundPayment(paymentId: string, amount?: number): Promise<RefundResult> {
    console.log(`[Stripe Mock] Requesting refund for payment: ${paymentId}, amount: ${amount}`);

    return {
      success: true,
      refundId: `re_test_${Math.random().toString(36).substring(2, 15)}`,
      status: 'succeeded',
    };
  }
}
