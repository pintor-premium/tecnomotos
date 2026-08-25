import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { SefazMtFiscalService } from '@/lib/services/fiscal/SefazMtFiscalService';
import { MockFiscalService } from '@/lib/services/fiscal/MockFiscalService';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // 1. Authenticate user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // 2. Authorize user (OWNER only)
    const { data: isOwner, error: roleError } = await supabase.rpc('is_owner', {
      user_uuid: user.id
    });

    if (roleError || !isOwner) {
      return NextResponse.json(
        { error: 'Acesso negado: Somente proprietários (OWNER) podem testar conexões com a SEFAZ.' },
        { status: 403 }
      );
    }

    // Read target environment from settings
    const { data: settings } = await supabase
      .from('fiscal_settings')
      .select('environment')
      .single();

    const env = settings?.environment || 'mock';

    let statusResult;
    if (env === 'mock') {
      const mockService = new MockFiscalService();
      statusResult = await mockService.getServiceStatus();
    } else {
      const sefazService = new SefazMtFiscalService();
      statusResult = await sefazService.getServiceStatus();
    }

    return NextResponse.json({
      success: true,
      status: statusResult.status,
      environment: statusResult.environment,
      lastCheck: statusResult.lastCheck,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Erro interno ao consultar status da SEFAZ.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
