export interface Consultation {
  id: number;
  veterinarian_id: number;
  summary: string;
  prescription: string;
  appointment_id: number;
  created_at: string;
  updated_at: string;
}

export interface ConsultationPayload {
  veterinarian_id: number;
  summary: string;
  prescription: string;
  appointment_id: number;
}
