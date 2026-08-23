import React from 'react';
import { LoadingState } from '@/components/ui/states';

export default function Loading() {
  return (
    <main className="min-h-screen bg-brand-black flex items-center justify-center p-4">
      <LoadingState message="Sincronizando dados com a oficina..." />
    </main>
  );
}
