'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

type EmployeeFunction = 'SELLER' | 'MECHANIC' | 'CASHIER' | 'FINANCIAL';

interface CreateEmployeeInput {
  fullName: string;
  email: string;
  password: string;
  cpf: string;
  phone: string;
  employeeFunction: EmployeeFunction;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  postalCode: string;
}

export async function createEmployeeAction(input: CreateEmployeeInput) {
  try {
    const supabaseServer = await createClient();

    const { data: { user: currentUser } } = await supabaseServer.auth.getUser();
    if (!currentUser) {
      return { success: false, error: 'Nao autorizado.' };
    }

    const { data: hasCreatePermission } = await supabaseServer.rpc('has_permission', {
      user_uuid: currentUser.id,
      required_permission: 'employees.create'
    });

    if (!hasCreatePermission) {
      return { success: false, error: 'Voce nao tem permissao para cadastrar funcionarios.' };
    }

    const adminClient = createAdminClient();

    if (input.password.length < 6) {
      return { success: false, error: 'A senha deve ter pelo menos 6 caracteres.' };
    }

    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email: input.email,
      password: input.password,
      email_confirm: true,
      app_metadata: {
        role: 'EMPLOYEE',
        employee_function: input.employeeFunction
      },
      user_metadata: {
        role: 'EMPLOYEE',
        employee_function: input.employeeFunction,
        full_name: input.fullName,
        phone: input.phone
      }
    });

    if (authError) {
      return { success: false, error: authError.message };
    }

    const newUserId = authData.user?.id;
    if (!newUserId) {
      return { success: false, error: 'Falha ao recuperar o ID do novo funcionario.' };
    }

    const { data: employeeRole, error: roleErr } = await adminClient
      .from('roles')
      .select('id')
      .eq('name', 'EMPLOYEE')
      .single();

    if (roleErr || !employeeRole) {
      return { success: false, error: roleErr?.message || 'Role EMPLOYEE nao encontrada.' };
    }

    await adminClient
      .from('customers')
      .delete()
      .eq('id', newUserId);

    await adminClient
      .from('user_roles')
      .delete()
      .eq('user_id', newUserId);

    const { error: assignErr } = await adminClient
      .from('user_roles')
      .insert({
        user_id: newUserId,
        role_id: employeeRole.id
      });

    if (assignErr) {
      return { success: false, error: assignErr.message };
    }

    const { error: profileErr } = await adminClient
      .from('profiles')
      .update({
        full_name: input.fullName,
        phone: input.phone,
        status: 'ACTIVE'
      })
      .eq('id', newUserId);

    if (profileErr) {
      return { success: false, error: profileErr.message };
    }

    const { error: employeeErr } = await adminClient
      .from('employees')
      .upsert({
        id: newUserId,
        document: input.cpf.replace(/\D/g, ''),
        employee_function: input.employeeFunction,
        address_street: input.street,
        address_number: input.number,
        address_complement: input.complement || null,
        address_neighborhood: input.neighborhood,
        address_city: input.city,
        address_state: input.state.toUpperCase(),
        address_postal_code: input.postalCode
      });

    if (employeeErr) {
      return { success: false, error: employeeErr.message };
    }

    return { success: true, userId: newUserId };
  } catch (err) {
    console.error('[createEmployeeAction] Unexpected error:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Erro inesperado ao cadastrar funcionario.' };
  }
}
