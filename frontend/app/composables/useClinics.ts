import type { Clinic, ClinicPayload, ClinicStatus } from "~/types/clinic";

export function useClinics() {
  const { apiFetch } = useApi();

  const fetchClinics = (status?: ClinicStatus) =>
    apiFetch<Clinic[]>(status ? `/clinics?status=${status}` : "/clinics");

  const fetchClinic = (id: number) => apiFetch<Clinic>(`/clinics/${id}`);

  const createClinic = (payload: ClinicPayload) =>
    apiFetch<Clinic>("/clinics", { method: "POST", body: { ...payload } });

  const registerClinic = (payload: ClinicPayload) =>
    apiFetch<Clinic>("/clinics/register", {
      method: "POST",
      body: { ...payload },
    });

  const updateClinic = (id: number, payload: Partial<ClinicPayload>) =>
    apiFetch<Clinic>(`/clinics/${id}`, { method: "PUT", body: { ...payload } });

  const updateClinicStatus = (id: number, status: ClinicStatus) =>
    apiFetch<Clinic>(`/clinics/${id}/status`, {
      method: "PATCH",
      body: { status },
    });

  const deleteClinic = (id: number) =>
    apiFetch<Clinic>(`/clinics/${id}`, { method: "DELETE" });

  return {
    fetchClinics,
    fetchClinic,
    createClinic,
    registerClinic,
    updateClinic,
    updateClinicStatus,
    deleteClinic,
  };
}
