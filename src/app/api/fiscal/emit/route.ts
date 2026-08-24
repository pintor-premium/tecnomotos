import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { MockFiscalService } from '@/lib/services/fiscal/MockFiscalService';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // 1. Verify Authentication
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // 2. Verify Permission (OWNER or fiscal.create)
    const { data: hasPerm, error: permError } = await supabase.rpc('has_permission', {
      user_uuid: user.id,
      required_permission: 'fiscal.create'
    });

    if (permError || !hasPerm) {
      return NextResponse.json({ error: 'Acesso negado: sem permissão para emitir notas fiscais' }, { status: 403 });
    }

    // 3. Receive invoice payload
    const body = await request.json();
    const { orderId, items, customerName, customerDocument, paymentMethod } = body;

    if (!orderId || !items || items.length === 0) {
      return NextResponse.json({ error: 'Dados do pedido inválidos para emissão' }, { status: 400 });
    }

    // 4. Instantiate MockFiscalService
    const fiscalService = new MockFiscalService();

    // 5. Create NFC-e Draft
    const emitResult = await fiscalService.createNfce(orderId, {
      items,
      customerName,
      customerDocument,
      paymentMethod,
    });

    if (!emitResult.success) {
      return NextResponse.json({ error: emitResult.errorMessage || 'Falha ao simular NFC-e' }, { status: 500 });
    }

    // 6. Send NFC-e to Sefaz (Fetch Mock URLs)
    const sendResult = await fiscalService.sendNfce(emitResult.documentId);

    if (!sendResult.success) {
      await supabase
        .from('fiscal_documents')
        .insert({
          order_id: orderId,
          invoice_number: emitResult.invoiceNumber,
          series: emitResult.series,
          status: 'ERROR',
          error_message: 'Falha no envio para o Sefaz'
        });
      return NextResponse.json({ error: 'Falha no envio do documento fiscal' }, { status: 500 });
    }

    // 7. Save Document
    const { data: document, error: insertError } = await supabase
      .from('fiscal_documents')
      .insert({
        order_id: orderId,
        invoice_number: emitResult.invoiceNumber,
        series: emitResult.series,
        xml_url: sendResult.xmlUrl,
        danfe_url: sendResult.danfeUrl,
        status: 'EMITTED'
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: `Erro ao salvar nota fiscal: ${insertError.message}` }, { status: 500 });
    }

    // 8. Log Fiscal Event
    await supabase
      .from('fiscal_events')
      .insert({
        document_id: document.id,
        event_type: 'SEND',
        payload: { items, customerName, customerDocument, paymentMethod },
        response: { emitResult, sendResult }
      });

    return NextResponse.json({ success: true, document });
  } catch (e: unknown) {
    const errMsg = e instanceof Error ? e.message : 'Erro ao processar emissão fiscal';
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
