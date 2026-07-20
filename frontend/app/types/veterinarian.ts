export interface Veterinarian {
  id: number;
  first_name: string;
  last_name: string;
  is_present: boolean;
  clinic_id: number;
  created_at: string;
  updated_at: string;
}

export interface VeterinarianPayload {
  first_name: string;
  last_name: string;
  clinic_id: number;
  is_present?: boolean;
}
