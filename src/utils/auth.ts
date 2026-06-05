export interface AuthUser {
  id: string;
  full_name: string;
  email: string | null;
  employee_code: string | null;
  role: 'SUPERADMIN' | 'MANAGER' | 'OPERATOR' | 'ENGINEER';
  branch_id: string;
  branch_name: string | null;
  login_time: string | null;
  isAuthenticated: boolean;
}
