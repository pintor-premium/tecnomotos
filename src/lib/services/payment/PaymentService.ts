export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface CheckoutSession {
  id: string;
  url: string;
  mode: string;
}

export interface PaymentStatus {
  id: string;
  status: 'paid' | 'unpaid' | 'cancelled' | 'refunded';
  amount: number;
  customerEmail: string;
}

export interface WebhookResult {
  processed: boolean;
  event: string;
  message: string;
}

export interface RefundResult {
  success: boolean;
  refundId: string;
  status: string;
}

export abstract class PaymentService {
  abstract createCheckoutSession(
    userId: string,
    items: CartItem[],
    cancelUrl: string,
    successUrl: string
  ): Promise<CheckoutSession>;

  abstract getPaymentStatus(sessionId: string): Promise<PaymentStatus>;

  abstract processWebhook(payload: string, signature: string): Promise<WebhookResult>;

  abstract refundPayment(paymentId: string, amount?: number): Promise<RefundResult>;
}
