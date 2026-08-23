import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-brand-grey py-3">
      <Link href="/admin/dashboard" className="hover:text-white transition-colors">
        TECNOMOTOS
      </Link>
      {items.length > 0 && <ChevronRight className="w-3 h-3 shrink-0" />}
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <React.Fragment key={idx}>
            {idx > 0 && <ChevronRight className="w-3 h-3 shrink-0" />}
            {isLast || !item.href ? (
              <span className={isLast ? 'text-white font-bold' : ''}>{item.label}</span>
            ) : (
              <Link href={item.href} className="hover:text-white transition-colors">
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
