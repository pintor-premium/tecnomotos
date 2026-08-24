'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Logo } from '@/components/ui/logo';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { LogIn } from 'lucide-react';
import { z } from 'zod';
import Link from 'next/link';

const loginSchema = z.object({
  email: z.string().email('Por favor, informe um e-mail válido.'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres.'),
});

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const { success, error } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formErrors, setFormErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFormErrors({});

    // Zod validation
    const validationResult = loginSchema.safeParse({ email, password });
    if (!validationResult.success) {
      const formattedErrors: typeof formErrors = {};
      validationResult.error.issues.forEach((err) => {
        if (err.path[0] === 'email') formattedErrors.email = err.message;
        if (err.path[0] === 'password') formattedErrors.password = err.message;
      });
      setFormErrors(formattedErrors);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        error('Falha de Autenticação', authError.message);
        setIsLoading(false);
        return;
      }

      success('Acesso Autorizado', 'Sincronizando parâmetros do painel...');

      // Redirect user according to role
      const user = data.user;
      const role =
        (user?.app_metadata?.role as string) ||
        (user?.user_metadata?.role as string) ||
        'CUSTOMER';

      const nextUrl = searchParams.get('next');

      if (nextUrl) {
        router.push(nextUrl);
      } else if (role === 'OWNER' || role === 'EMPLOYEE') {
        router.push('/admin/dashboard');
      } else {
        router.push('/cliente');
      }

      router.refresh();
    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : 'Falha ao processar o login.';
      error('Erro Inesperado', errMsg);
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-brand-black text-white flex flex-col items-center justify-center p-4 telemetry-grid">
      <div className="w-full max-w-md">
        <Card className="skew-x-[-2deg] border border-brand-grey/15" withStripe>
          <div className="skew-x-[2deg] flex flex-col items-center">
            {/* Header / Logo */}
            <Link href="/" className="cursor-pointer hover:opacity-90 transition-opacity">
              <Logo className="mb-8" />
            </Link>

            <h2 className="text-lg font-black italic uppercase tracking-wider text-white mb-2">
              Autenticação de Painel
            </h2>
            <p className="text-xs text-brand-grey uppercase tracking-widest font-mono mb-8">
              Acesse sua conta para continuar
            </p>

            <form onSubmit={handleSubmit} className="w-full space-y-6 text-left">
              <Input
                label="E-mail"
                type="email"
                placeholder="nome@tecnomotos.com.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={formErrors.email}
                disabled={isLoading}
                required
              />

              <Input
                label="Senha de Segurança"
                type="password"
                placeholder="******"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={formErrors.password}
                disabled={isLoading}
                required
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full mt-4"
                disabled={isLoading}
              >
                <LogIn className="w-4 h-4 shrink-0" />
                {isLoading ? 'Autenticando...' : 'Iniciar Sessão'}
              </Button>

              <p className="text-center text-[10px] text-brand-grey font-mono mt-6 uppercase tracking-normal whitespace-nowrap">
                Se ainda não tem uma conta, faça seu cadastro{' '}
                <Link href="/cadastro" className="text-brand-red hover:underline font-bold">
                  Clique aqui
                </Link>
              </p>
            </form>
          </div>
        </Card>
      </div>
    </main>
  );
}
