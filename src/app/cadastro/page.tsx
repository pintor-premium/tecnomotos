'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Logo } from '@/components/ui/logo';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { UserPlus } from 'lucide-react';
import { z } from 'zod';
import Link from 'next/link';

const registerSchema = z
  .object({
    fullName: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres.'),
    email: z.string().email('Por favor, informe um e-mail válido.'),
    password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres.'),
    confirmPassword: z.string().min(6, 'A confirmação de senha deve ter pelo menos 6 caracteres.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem.',
    path: ['confirmPassword'],
  });

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();
  const { success, error } = useToast();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formErrors, setFormErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFormErrors({});

    // Zod validation
    const validationResult = registerSchema.safeParse({
      fullName,
      email,
      password,
      confirmPassword,
    });

    if (!validationResult.success) {
      const formattedErrors: typeof formErrors = {};
      validationResult.error.issues.forEach((err) => {
        const fieldName = err.path[0] as keyof typeof formErrors;
        formattedErrors[fieldName] = err.message;
      });
      setFormErrors(formattedErrors);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: fullName,
          },
        },
      });

      if (authError) {
        error('Falha no Cadastro', authError.message);
        setIsLoading(false);
        return;
      }

      // Check if registration auto-logs in or requires email verification
      if (data.session) {
        success('Cadastro Realizado!', 'Sua conta foi criada com sucesso.');
        router.push('/cliente');
      } else {
        success('Confirmar E-mail', 'Enviamos um link de confirmação para o seu e-mail.');
        router.push('/login');
      }
      
      router.refresh();
    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : 'Falha ao processar o cadastro.';
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
              Cadastro de Cliente
            </h2>
            <p className="text-xs text-brand-grey uppercase tracking-widest font-mono mb-8">
              Crie sua conta para acessar a plataforma
            </p>

            <form onSubmit={handleSubmit} className="w-full space-y-6 text-left">
              <Input
                label="Nome Completo"
                type="text"
                placeholder="Seu nome completo"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                error={formErrors.fullName}
                disabled={isLoading}
                required
              />

              <Input
                label="E-mail"
                type="email"
                placeholder="seu-email@provedor.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={formErrors.email}
                disabled={isLoading}
                required
              />

              <Input
                label="Senha de Segurança"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={formErrors.password}
                disabled={isLoading}
                required
              />

              <Input
                label="Confirmar Senha"
                type="password"
                placeholder="Repita sua senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={formErrors.confirmPassword}
                disabled={isLoading}
                required
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full mt-4"
                disabled={isLoading}
              >
                <UserPlus className="w-4 h-4 shrink-0" />
                {isLoading ? 'Criando Conta...' : 'Cadastrar'}
              </Button>

              <p className="text-center text-[11px] text-brand-grey font-mono mt-6 uppercase tracking-wider">
                Já possui uma conta?{' '}
                <Link href="/login" className="text-brand-red hover:underline font-bold">
                  Clique aqui para Entrar
                </Link>
              </p>
            </form>
          </div>
        </Card>
      </div>
    </main>
  );
}
