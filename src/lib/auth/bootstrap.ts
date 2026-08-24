import { createAdminClient } from '@/lib/supabase/admin';

export async function bootstrapOwner() {
  const adminClient = createAdminClient();

  // 1. Get OWNER role ID
  const { data: ownerRole, error: roleSearchError } = await adminClient
    .from('roles')
    .select('id')
    .eq('name', 'OWNER')
    .single();

  if (roleSearchError || !ownerRole) {
    return { success: false, message: 'Role OWNER não encontrada no banco. Por favor, rode as migrations e o seed primeiro.' };
  }

  // 2. Check if any user already has the OWNER role
  const { data: existingOwnerRoles, error: checkError } = await adminClient
    .from('user_roles')
    .select('user_id')
    .eq('role_id', ownerRole.id);

  if (checkError) {
    return { success: false, message: `Erro ao verificar proprietários existentes: ${checkError.message}` };
  }

  if (existingOwnerRoles && existingOwnerRoles.length > 0) {
    return { success: false, message: 'O proprietário administrador (OWNER) já está cadastrado.' };
  }

  const email = process.env.OWNER_EMAIL;
  const password = process.env.OWNER_PASSWORD;

  if (!email || !password) {
    return { success: false, message: 'Variáveis de ambiente OWNER_EMAIL ou OWNER_PASSWORD não configuradas no servidor.' };
  }

  // 3. Check if a profile with this email already exists
  const { data: existingProfile } = await adminClient
    .from('profiles')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  let userId: string;

  if (existingProfile) {
    userId = existingProfile.id;
  } else {
    // Create the user in Supabase Auth
    const { data: authUser, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: 'Proprietário Administrador',
      },
    });

    if (authError) {
      return { success: false, message: `Erro ao criar usuário auth: ${authError.message}` };
    }

    userId = authUser.user.id;
  }

  // The database trigger "on_auth_user_created" runs asynchronously / immediately
  // and creates a profile and a customer entry. We will promote this user to OWNER.
  
  // 4. Delete default user role (CUSTOMER) that the trigger might have assigned
  await adminClient
    .from('user_roles')
    .delete()
    .eq('user_id', userId);

  // 5. Assign OWNER role
  const { error: assignError } = await adminClient
    .from('user_roles')
    .insert({
      user_id: userId,
      role_id: ownerRole.id,
    });

  if (assignError) {
    return { success: false, message: `Erro ao associar a role OWNER ao perfil: ${assignError.message}` };
  }

  // 6. Delete from customers table since OWNER is not a customer
  await adminClient
    .from('customers')
    .delete()
    .eq('id', userId);

  return {
    success: true,
    message: `Proprietário inicial (${email}) criado e associado à role OWNER com sucesso.`,
  };
}
