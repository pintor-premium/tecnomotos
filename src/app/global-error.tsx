'use client';

import React from 'react';
import { ErrorState } from '@/components/ui/states';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  React.useEffect(() => {
    console.error('Global capture error:', error);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body className="bg-brand-black text-white min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <ErrorState
            title="Falha Geral do Sistema"
            message="Um erro crítico de inicialização interrompeu a execução. Tente reiniciar a aplicação."
            retryLabel="Reiniciar"
            onRetry={reset}
          />
        </div>
      </body>
    </html>
  );
}
