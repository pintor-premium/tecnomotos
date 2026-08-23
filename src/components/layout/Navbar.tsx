'use client';

import React from 'react';
import Link from 'next/link';
import { Logo } from '@/components/ui/logo';
import { ShoppingCart, User, Search, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavbarProps {
  isAuthenticated?: boolean;
  userRole?: string;
}

export function Navbar({ isAuthenticated = false, userRole = 'CUSTOMER' }: NavbarProps) {
  const accountHref = !isAuthenticated
    ? '/login'
    : userRole === 'OWNER' || userRole === 'EMPLOYEE'
    ? '/admin/dashboard'
    : '/cliente';

  return (
    <header className="bg-brand-black border-b border-brand-grey/15 text-white sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="shrink-0">
          <Logo />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-mono uppercase tracking-widest font-bold">
          <Link href="/" className="hover:text-brand-red transition-colors text-white">
            Home
          </Link>
          <Link href="/loja" className="hover:text-brand-red transition-colors text-brand-grey">
            Loja
          </Link>
          <Link href="/produtos" className="hover:text-brand-red transition-colors text-brand-grey">
            Peças
          </Link>
          <Link href="/oficina" className="hover:text-brand-red transition-colors text-brand-grey">
            Serviços
          </Link>
        </nav>

        {/* Search bar mock */}
        <div className="hidden sm:flex flex-1 max-w-md relative">
          <input
            type="text"
            placeholder="Pesquisar peças, marcas ou compatibilidade..."
            className="w-full bg-brand-darkgrey border border-brand-grey/25 py-2 pl-4 pr-10 text-xs font-mono focus:border-brand-red focus:outline-none transition-all"
          />
          <div className="absolute right-3 inset-y-0 flex items-center text-brand-grey pointer-events-none">
            <Search className="w-4 h-4" />
          </div>
        </div>

        {/* User Actions */}
        <div className="flex items-center gap-4 shrink-0">
          {/* Cart Icon */}
          <Link
            href="/carrinho"
            className="p-2.5 rounded-sm bg-brand-darkgrey text-brand-grey hover:text-white border border-brand-grey/10 hover:border-brand-red/30 transition-all relative cursor-pointer skew-x-[-6deg]"
          >
            <span className="skew-x-[6deg] block relative">
              <ShoppingCart className="w-4.5 h-4.5" />
              <span className="absolute -top-2 -right-2 bg-brand-red text-white text-[9px] font-mono font-bold w-4 h-4 rounded-full flex items-center justify-center">
                0
              </span>
            </span>
          </Link>

          {/* Account Button */}
          <Link href={accountHref}>
            <Button variant="secondary" size="sm" className="hidden sm:inline-flex">
              <User className="w-4 h-4" />
              {isAuthenticated ? 'Minha Conta' : 'Acessar'}
            </Button>
            <span className="p-2.5 sm:hidden rounded-sm bg-brand-darkgrey text-brand-grey hover:text-white border border-brand-grey/10 transition-all flex items-center justify-center skew-x-[-6deg]">
              <span className="skew-x-[6deg] block">
                <User className="w-4.5 h-4.5" />
              </span>
            </span>
          </Link>

          {/* Mobile menu trigger */}
          <button className="md:hidden p-2 text-brand-grey hover:text-white cursor-pointer">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
    </header>
  );
}
