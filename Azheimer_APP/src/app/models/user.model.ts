export type UserRole = 'ADMIN' | 'PATIENT' | 'DOCTOR' | 'CAREGIVER' | 'VOLUNTEER';

export interface User {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: UserRole;
  caregiverId?: number | null;
}
