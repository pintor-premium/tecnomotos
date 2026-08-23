import React, { ReactNode } from 'react';
import { AlertCircle, Inbox, Cpu } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils/cn';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  title = 'Nenhum registro encontrado',
  description = 'Não há dados disponíveis para exibição no momento.',
  icon = <Inbox className="w-10 h-10 text-brand-grey/40" />,
  actionLabel,
  onAction,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center p-8 text-center bg-brand-card/30 border border-brand-grey/10 border-dashed rounded-sm min-h-[300px]', className)}>
      <div className="mb-4 p-4 rounded-full bg-brand-darkgrey text-brand-grey/80 shrink-0">
        {icon}
      </div>
      <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-2">{title}</h3>
      <p className="text-xs text-brand-grey max-w-sm mb-6 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button variant="secondary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({
  message = 'Carregando dados de telemetria...',
  className = '',
}: LoadingStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center p-8 min-h-[300px]', className)}>
      <Cpu className="w-8 h-8 text-brand-red animate-spin mb-4" />
      <span className="text-xs font-mono uppercase tracking-widest text-brand-grey animate-pulse">
        {message}
      </span>
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  message?: string;
  retryLabel?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = 'Falha na conexão',
  message = 'Ocorreu um erro ao carregar os dados. Verifique sua conexão e tente novamente.',
  retryLabel = 'Tentar Novamente',
  onRetry,
  className = '',
}: ErrorStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center p-8 text-center bg-brand-card/20 border border-brand-red/10 rounded-sm min-h-[300px]', className)}>
      <div className="mb-4 p-4 rounded-full bg-brand-red/10 text-brand-red shrink-0">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-2">{title}</h3>
      <p className="text-xs text-brand-grey max-w-sm mb-6 leading-relaxed">{message}</p>
      {onRetry && (
        <Button variant="primary" size="sm" onClick={onRetry}>
          {retryLabel}
        </Button>
      )}
    </div>
  );
}
