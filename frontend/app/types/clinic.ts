export type ClinicStatus = "pending" | "approved" | "rejected";

export interface Clinic {
  id: number;
  name: string;
  address: string;
  city: string;
  postcode: string;
  phone_number: string;
  status: ClinicStatus;
  created_at: string;
  updated_at: string;
}

export interface ClinicPayload {
  name: string;
  address: string;
  city: string;
  postcode: string;
  phone_number: string;
}
