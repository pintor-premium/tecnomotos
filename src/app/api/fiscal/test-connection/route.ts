import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createFiscalProvider, getFiscalRuntimeConfig } from '@/lib/services/fiscal/FiscalProviderFactory';

export async function POST() {
  try {
    const supabase = await createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 });
    }

    const { data: isOwner, error: roleError } = await supabase.rpc('is_owner', {
      user_uuid: user.id
    });

    if (roleError || !isOwner) {
      return NextResponse.json(
        { error: 'Acesso negado: Somente proprietarios OWNER podem testar conexoes fiscais.' },
        { status: 403 }
      );
    }

    const config = getFiscalRuntimeConfig();
    const provider = createFiscalProvider();
    const statusResult = await provider.getServiceStatus();

    return NextResponse.json({
      success: true,
      provider: config.provider,
      status: statusResult.status,
      environment: statusResult.environment,
      lastCheck: statusResult.lastCheck,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Erro interno ao consultar provedor fiscal.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
