import { User, UserRole } from './types';

export const TEST_USERS: User[] = [
  {
    id: 'usr_salesman',
    username: 'salesman',
    password: 'password123',
    name: 'Senthil Kumar (Salesman A)',
    role: 'salesman',
    badge: 'Mobile Field Sales',
  },
  {
    id: 'usr_admin',
    username: 'admin',
    password: 'password123',
    name: 'Kavitha Raman (Billing Desk)',
    role: 'admin',
    badge: 'Factory Administration',
  },
  {
    id: 'usr_production',
    username: 'production',
    password: 'password123',
    name: 'Murugan P (Floor Supervisor)',
    role: 'production',
    badge: 'Production Floor Supervisor',
  },
  {
    id: 'usr_auditor',
    username: 'auditor',
    password: 'password123',
    name: 'R. Sundaram (Chartered Accountant)',
    role: 'auditor',
    badge: 'Auditor & Accounts Desk',
  },
  {
    id: 'usr_owner',
    username: 'owner',
    password: 'password123',
    name: 'Annamalai Chettiar (Managing Director)',
    role: 'owner',
    badge: 'Business Owner & Executive',
  },
];

export function authenticate(username: string, password?: string): User | null {
  const cleanUser = username.trim().toLowerCase();
  const cleanPass = password?.trim() || '';

  const matched = TEST_USERS.find(
    (u) =>
      u.username.toLowerCase() === cleanUser ||
      u.role.toLowerCase() === cleanUser
  );

  if (!matched) return null;

  // Accept simple password 'password123', '<role>123', or empty in demo mode
  if (
    !cleanPass ||
    cleanPass === 'password123' ||
    cleanPass === `${matched.role}123` ||
    cleanPass === matched.password
  ) {
    return matched;
  }

  return null;
}
