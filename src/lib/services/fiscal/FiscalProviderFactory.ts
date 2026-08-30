import { FocusNFeProvider } from './providers/FocusNFeProvider';
import { MockFiscalProvider } from './providers/MockFiscalProvider';
import { FiscalEnvironment, FiscalProvider, FiscalProviderName } from './types';

export function getFiscalRuntimeConfig() {
  const provider = (process.env.FISCAL_PROVIDER || 'mock').toLowerCase() as FiscalProviderName;
  const rawEnvironment = (process.env.FISCAL_ENVIRONMENT || 'mock').toLowerCase() as FiscalEnvironment;
  const productionEnabled = process.env.FISCAL_PRODUCTION_ENABLED === 'true';

  const normalizedProvider: FiscalProviderName = provider === 'focusnfe' ? 'focusnfe' : 'mock';
  const environment: FiscalEnvironment = normalizedProvider === 'mock'
    ? 'mock'
    : rawEnvironment === 'production'
    ? 'production'
    : 'homologation';

  if (environment === 'production' && (!productionEnabled || normalizedProvider !== 'focusnfe')) {
    throw new Error('Producao fiscal bloqueada. Configure FISCAL_PROVIDER=focusnfe, FISCAL_ENVIRONMENT=production e FISCAL_PRODUCTION_ENABLED=true no backend.');
  }

  return {
    provider: normalizedProvider,
    environment,
    productionEnabled
  };
}

export function createFiscalProvider(): FiscalProvider {
  const config = getFiscalRuntimeConfig();

  if (config.provider === 'focusnfe') {
    if (config.environment === 'mock') {
      throw new Error('Focus NFe exige FISCAL_ENVIRONMENT=homologation ou production.');
    }

    return new FocusNFeProvider(config.environment);
  }

  return new MockFiscalProvider();
}
