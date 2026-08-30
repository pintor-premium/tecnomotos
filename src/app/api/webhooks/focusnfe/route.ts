import { createHash } from 'crypto';
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { FiscalOperationService } from '@/lib/services/fiscal/FiscalOperationService';

export async function POST(request: Request) {
  const rawBody = await request.text();
  const payloadHash = createHash('sha256').update(rawBody).digest('hex');

  try {
    const payload = rawBody ? JSON.parse(rawBody) : {};
    const reference = extractReference(payload);

    if (!reference) {
      return NextResponse.json({ received: true, processed: false });
    }

    const fiscalService = new FiscalOperationService(createAdminClient());
    const result = await fiscalService.applyWebhook(reference, payloadHash, payload);

    return NextResponse.json({ received: true, ...result });
  } catch {
    return NextResponse.json({ received: true, processed: false });
  }
}

function extractReference(payload: Record<string, unknown>) {
  const value = payload.ref || payload.referencia || payload.reference;
  return typeof value === 'string' ? value : null;
}
