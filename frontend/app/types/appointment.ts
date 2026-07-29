export interface Appointment {
  id: number;
  date: string;
  time: string;
  reason_id: number;
  is_completed: boolean;
  is_cancelled: boolean;
  is_accepted: boolean;
  is_refused: boolean;
  user_id: number;
  animal_id: number;
  clinic_id: number;
  animal_name?: string;
  owner_first_name?: string;
  owner_last_name?: string;
  remark?: string;
  created_at: string;
  updated_at: string;
}

export interface AppointmentReason {
  id: number;
  label: string;
}
