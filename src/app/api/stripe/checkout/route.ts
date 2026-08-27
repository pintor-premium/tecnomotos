import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { StripePaymentService } from '@/lib/services/payment/StripePaymentService';

interface CheckoutItemInput {
  id: string; // Product UUID
  quantity: number;
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // 1. Get authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Você precisa estar logado para realizar compras.' }, { status: 401 });
    }

    const body = await request.json();
    const items: CheckoutItemInput[] = body.items || [];

    if (items.length === 0) {
      return NextResponse.json({ error: 'Seu carrinho está vazio.' }, { status: 400 });
    }

    // 2. Resolve origin for redirect URLs
    const origin = request.headers.get('origin') || 'http://localhost:3000';

    // 3. Recalculate totals and check stock from database
    let totalAmount = 0;
    const validatedItems = [];

    for (const item of items) {
      const { data: product, error: prodErr } = await supabase
        .from('products')
        .select('id, name, price, stock_quantity, stripe_price_id')
        .eq('id', item.id)
        .single();

      if (prodErr || !product) {
        return NextResponse.json({ error: `Produto não encontrado: ${item.id}` }, { status: 400 });
      }

      // Check stock
      if ((product.stock_quantity || 0) < item.quantity) {
        return NextResponse.json({ 
          error: `Estoque insuficiente para o produto: ${product.name}. Disponível: ${product.stock_quantity || 0} un.` 
        }, { status: 400 });
      }

      const unitPrice = parseFloat(product.price) || 0;
      totalAmount += unitPrice * item.quantity;

      validatedItems.push({
        id: product.id,
        name: product.name,
        price: unitPrice,
        quantity: item.quantity
      });
    }

    // 4. Create the reserved order in the database (status = pending_payment)
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert({
        customer_id: user.id,
        customer_email: user.email,
        status: 'pending_payment',
        total_amount: totalAmount
      })
      .select('id')
      .single();

    if (orderErr || !order) {
      throw new Error(`Falha ao registrar pedido no banco: ${orderErr?.message}`);
    }

    // 5. Insert order items
    const orderItemsPayload = validatedItems.map(item => ({
      order_id: order.id,
      product_id: item.id,
      quantity: item.quantity,
      unit_price: item.price
    }));

    const { error: itemsErr } = await supabase
      .from('order_items')
      .insert(orderItemsPayload);

    if (itemsErr) {
      // Cleanup order to prevent orphans
      await supabase.from('orders').delete().eq('id', order.id);
      throw new Error(`Falha ao registrar itens do pedido: ${itemsErr.message}`);
    }

    // 6. Create Stripe Checkout Session
    const paymentService = new StripePaymentService();
    const successUrl = `${origin}/checkout/sucesso?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${origin}/checkout/cancelado`;

    const session = await paymentService.createCheckoutSession(
      user.id,
      validatedItems,
      cancelUrl,
      successUrl,
      order.id
    );

    // Save checkout session ID to order
    await supabase
      .from('orders')
      .update({ stripe_checkout_session_id: session.id })
      .eq('id', order.id);

    return NextResponse.json({ success: true, url: session.url });
  } catch (err: any) {
    console.error('[Checkout Route Error]:', err);
    return NextResponse.json({ error: err.message || 'Erro inesperado ao criar checkout.' }, { status: 500 });
  }
}
