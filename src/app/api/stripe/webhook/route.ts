import { NextResponse } from 'next/server';
import { StripePaymentService } from '@/lib/services/payment/StripePaymentService';

export async function POST(request: Request) {
  try {
    const payload = await request.text();
    const signature = request.headers.get('stripe-signature') || '';

    if (!signature) {
      return NextResponse.json({ error: 'Assinatura Stripe ausente.' }, { status: 400 });
    }

    const paymentService = new StripePaymentService();
    const result = await paymentService.processWebhook(payload, signature);

    if (!result.processed) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json({ received: true, message: result.message });
  } catch (err: any) {
    console.error('[Stripe Webhook Endpoint Error]:', err);
    return NextResponse.json({ error: err.message || 'Erro interno no webhook' }, { status: 500 });
  }
}
