import { createClient } from '@/lib/supabase/server';

/**
 * Checks if the currently authenticated user has the specified permission.
 * Owners automatically pass all permission checks.
 */
export async function hasServerPermission(permission: string): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return false;
  }

  const role =
    (user.app_metadata?.role as string) ||
    (user.user_metadata?.role as string) ||
    'CUSTOMER';

  // 1. OWNER has full access to everything
  if (role === 'OWNER') {
    return true;
  }

  // 2. CUSTOMER doesn't have access to administrative permissions
  if (role === 'CUSTOMER') {
    return false;
  }

  // 3. Query the DB helper function has_permission
  const { data: hasPerm, error } = await supabase.rpc('has_permission', {
    user_uuid: user.id,
    required_permission: permission,
  });

  if (error) {
    console.error(`Error verifying permission ${permission} for user ${user.id}:`, error);
    return false;
  }

  return !!hasPerm;
}

/**
 * Throws an error if the currently authenticated user does not have the specified permission.
 */
export async function requireServerPermission(permission: string): Promise<void> {
  const permitted = await hasServerPermission(permission);
  if (!permitted) {
    throw new Error(`Forbidden: Você não possui a permissão necessária (${permission}).`);
  }
}
