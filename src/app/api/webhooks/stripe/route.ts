import { NextResponse } from 'next/server';
import { StripePaymentService } from '@/lib/services/payment/StripePaymentService';

export async function POST(request: Request) {
  try {
    const payload = await request.text();
    const signature = request.headers.get('stripe-signature') || '';

    const paymentService = new StripePaymentService();
    const result = await paymentService.processWebhook(payload, signature);

    if (!result.processed) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json({ message: result.message, event: result.event }, { status: 200 });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Erro interno no processamento do webhook do Stripe.';
    return NextResponse.json(
      { error: errMsg },
      { status: 500 }
    );
  }
}
