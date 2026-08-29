export type EmployeeFunction = 'SELLER' | 'MECHANIC' | 'CASHIER' | 'FINANCIAL';

export function getEmployeeDashboardPath(employeeFunction?: string | null) {
  if (employeeFunction === 'SELLER') return '/admin/dashboard/vendedor';
  if (employeeFunction === 'MECHANIC') return '/admin/dashboard/mecanico';
  if (employeeFunction === 'CASHIER') return '/admin/dashboard/caixa';
  if (employeeFunction === 'FINANCIAL') return '/admin/dashboard/financeiro';
  return '/admin/dashboard';
}
