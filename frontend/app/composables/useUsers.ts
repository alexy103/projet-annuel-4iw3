import type { User, Role } from "~/types/user";

export function useUsers() {
  const { apiFetch } = useApi();

  const fetchUsers = () => apiFetch<User[]>("/users");

  const fetchRoles = () => apiFetch<Role[]>("/roles");

  const toggleActivation = (id: number, isActivated: boolean) =>
    apiFetch<User>(`/users/${id}/active`, {
      method: "PATCH",
      body: { isActivated },
    });

  const updateUserRole = (id: number, roleId: number) =>
    apiFetch<User>(`/users/${id}`, {
      method: "PUT",
      body: { role_id: roleId },
    });

  const deleteUser = (id: number) =>
    apiFetch<User>(`/users/${id}`, { method: "DELETE" });

  return { fetchUsers, fetchRoles, toggleActivation, updateUserRole, deleteUser };
}
