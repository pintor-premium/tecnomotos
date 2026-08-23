'use client';

import React, { useEffect } from 'react';
import { ErrorState } from '@/components/ui/states';
import { Logo } from '@/components/ui/logo';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Standard error logging without exposing stack traces to the user interface
    console.error('Next.js captured error:', error);
  }, [error]);

  return (
    <main className="min-h-screen bg-brand-black text-white flex flex-col items-center justify-center p-4 telemetry-grid">
      <div className="max-w-md w-full text-center space-y-8 bg-brand-card border border-brand-red/10 p-8 shadow-2xl skew-x-[-2deg]">
        <div className="skew-x-[2deg] flex flex-col items-center">
          <Logo className="mb-6" />
          <ErrorState
            title="Falha de Processamento"
            message="Ocorreu um desvio de telemetria no servidor. O erro foi registrado para análise."
            retryLabel="Reiniciar Sistema"
            onRetry={reset}
          />
        </div>
      </div>
    </main>
  );
}
