import type { Veterinarian, VeterinarianPayload } from "~/types/veterinarian";

export function useVeterinarians() {
  const { apiFetch } = useApi();

  const fetchByClinic = (clinicId: number) =>
    apiFetch<Veterinarian[]>(`/veterinarians/clinic/${clinicId}`);

  const createVeterinarian = (payload: VeterinarianPayload) =>
    apiFetch<Veterinarian>("/veterinarians", {
      method: "POST",
      body: { ...payload },
    });

  const setPresence = (id: number, isPresent: boolean) =>
    apiFetch<Veterinarian>(`/veterinarians/${id}/presence`, {
      method: "PATCH",
      body: { is_present: isPresent },
    });

  const deleteVeterinarian = (id: number) =>
    apiFetch<Veterinarian>(`/veterinarians/${id}`, { method: "DELETE" });

  return {
    fetchByClinic,
    createVeterinarian,
    setPresence,
    deleteVeterinarian,
  };
}
