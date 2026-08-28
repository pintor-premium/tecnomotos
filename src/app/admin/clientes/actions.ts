'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

interface CreateCustomerInput {
  fullName: string;
  email: string;
  phone: string;
  document?: string;
  birthDate?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  postalCode?: string;
}

export async function createCustomerAction(input: CreateCustomerInput) {
  try {
    const supabaseServer = await createClient();
    
    // Double check that current user has permission to create customer
    const { data: { user: currentUser } } = await supabaseServer.auth.getUser();
    if (!currentUser) {
      return { success: false, error: 'Não autorizado.' };
    }

    const { data: hasCreatePermission } = await supabaseServer.rpc('has_permission', {
      user_uuid: currentUser.id,
      required_permission: 'customers.create'
    });

    if (!hasCreatePermission) {
      return { success: false, error: 'Você não tem permissão para cadastrar clientes.' };
    }

    const adminClient = createAdminClient();

    // 1. Create Auth User (this fires the trigger handle_new_user automatically)
    // We generate a random password so they can recover/reset it later, or they can use their email
    const tempPassword = Math.random().toString(36).slice(-10) + 'A1!';
    
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email: input.email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        role: 'CUSTOMER',
        full_name: input.fullName,
        phone: input.phone,
        address_street: input.street || '',
        address_number: input.number || '',
        address_complement: input.complement || '',
        address_neighborhood: input.neighborhood || '',
        address_city: input.city || '',
        address_state: input.state || '',
        address_postal_code: input.postalCode || '',
      }
    });

    if (authError) {
      return { success: false, error: authError.message };
    }

    const newUserId = authData.user?.id;
    if (!newUserId) {
      return { success: false, error: 'Falha ao recuperar o ID do novo usuário.' };
    }

    // 2. Update the customers table with optional details like document and birth_date
    if (input.document || input.birthDate) {
      const { error: custError } = await adminClient
        .from('customers')
        .update({
          document: input.document ? input.document.replace(/\D/g, '') : null,
          birth_date: input.birthDate || null,
        })
        .eq('id', newUserId);

      if (custError) {
        console.error('[createCustomerAction] Error updating customers metadata:', custError);
      }
    }

    return { success: true, userId: newUserId };
  } catch (err) {
    console.error('[createCustomerAction] Unexpected error:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Erro inesperado ao cadastrar cliente.' };
  }
}

export async function deleteCustomerAction(customerId: string) {
  try {
    const supabaseServer = await createClient();

    const { data: { user: currentUser } } = await supabaseServer.auth.getUser();
    if (!currentUser) {
      return { success: false, error: 'NÃ£o autorizado.' };
    }

    const { data: isOwner } = await supabaseServer.rpc('is_owner', {
      user_uuid: currentUser.id
    });

    if (!isOwner) {
      return { success: false, error: 'VocÃª nÃ£o tem permissÃ£o para excluir clientes.' };
    }

    if (currentUser.id === customerId) {
      return { success: false, error: 'VocÃª nÃ£o pode excluir o prÃ³prio cadastro.' };
    }

    const adminClient = createAdminClient();
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(customerId);

    if (deleteError) {
      return { success: false, error: deleteError.message };
    }

    return { success: true };
  } catch (err) {
    console.error('[deleteCustomerAction] Unexpected error:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Erro inesperado ao excluir cliente.' };
  }
}
