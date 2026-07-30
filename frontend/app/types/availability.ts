export interface SlotRules {
  interval: number;
  capacity?: number;
  break?: {
    start: number;
    end: number;
  };
}

export interface Availability {
  id: number;
  clinic_id: number;
  day: string;
  opening: number;
  closing: number;
  slot_rules: SlotRules;
  created_at: string;
  updated_at: string;
}

export interface AvailabilityPayload {
  clinic_id: number;
  day: string;
  opening: number;
  closing: number;
  slot_rules: SlotRules;
}
