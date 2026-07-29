export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role_id: number;
  clinic_id?: number | null;
  is_activated: boolean;
  email_verified: boolean;
  onboarding_completed?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: number;
  label: string;
}
