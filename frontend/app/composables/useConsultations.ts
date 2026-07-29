import type { Consultation, ConsultationPayload } from "~/types/consultation";

export function useConsultations() {
  const { apiFetch } = useApi();

  const fetchByAppointment = (appointmentId: number) =>
    apiFetch<Consultation[]>(`/consultations/appointment/${appointmentId}`);

  const createConsultation = (payload: ConsultationPayload) =>
    apiFetch<Consultation>("/consultations", {
      method: "POST",
      body: { ...payload },
    });

  return {
    fetchByAppointment,
    createConsultation,
  };
}
