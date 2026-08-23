import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const role =
    (user.app_metadata?.role as string) ||
    (user.user_metadata?.role as string) ||
    'CUSTOMER';

  // Strict check: only OWNER and EMPLOYEE can pass
  if (role !== 'OWNER' && role !== 'EMPLOYEE') {
    redirect('/403');
  }

  // Fetch employee permissions if they are an employee
  let permissions: string[] = [];
  if (role === 'EMPLOYEE') {
    const { data: userRoles } = await supabase
      .from('user_roles')
      .select('role_id')
      .eq('user_id', user.id);

    if (userRoles && userRoles.length > 0) {
      const roleIds = userRoles.map((ur) => ur.role_id);
      
      const { data: rolePermissions } = await supabase
        .from('role_permissions')
        .select('permission_id')
        .in('role_id', roleIds);

      if (rolePermissions && rolePermissions.length > 0) {
        const permissionIds = rolePermissions.map((rp) => rp.permission_id);
        
        const { data: permissionsData } = await supabase
          .from('permissions')
          .select('key')
          .in('id', permissionIds);

        if (permissionsData) {
          permissions = permissionsData.map((p) => p.key);
        }
      }
    }
  }

  return (
    <div className="flex h-screen bg-brand-black overflow-hidden select-none">
      <Sidebar userRole={role} userPermissions={permissions} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar userEmail={user.email || ''} userRole={role} />
        <main className="flex-1 overflow-y-auto bg-brand-black p-6 telemetry-grid">
          {children}
        </main>
      </div>
    </div>
  );
}
