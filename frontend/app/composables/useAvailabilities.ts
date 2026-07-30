import type { Availability, AvailabilityPayload } from "~/types/availability";

export function useAvailabilities() {
  const { apiFetch } = useApi();

  const fetchByClinic = (clinicId: number) =>
    apiFetch<Availability[]>(`/availabilities/clinic/${clinicId}`);

  const createAvailability = (payload: AvailabilityPayload) =>
    apiFetch<Availability>("/availabilities", {
      method: "POST",
      body: { ...payload },
    });

  const deleteAvailability = (id: number) =>
    apiFetch<Availability>(`/availabilities/${id}`, { method: "DELETE" });

  return {
    fetchByClinic,
    createAvailability,
    deleteAvailability,
  };
}
