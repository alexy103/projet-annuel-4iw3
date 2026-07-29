<script setup lang="ts">
import type { User, Role } from "~/types/user";

definePageMeta({
  layout: "default",
});

const { fetchUsers, fetchRoles, toggleActivation, updateUserRole, deleteUser } =
  useUsers();

const users = ref<User[]>([]);
const roles = ref<Role[]>([]);
const isLoading = ref(false);
const errorMessage = ref("");
const updatingId = ref<number | null>(null);
const activeFilter = ref<"all" | number>("all");
const currentUserId = ref<number | null>(null);

const roleLabels: Record<string, string> = {
  admin: "Admin",
  user: "Utilisateur",
  clinic: "Clinique",
};

const roleLabel = (roleId: number) => {
  const role = roles.value.find((r) => r.id === roleId);
  if (!role) return "—";
  return roleLabels[role.label] ?? role.label;
};

const filters = computed(() => [
  { key: "all" as const, label: "Tous" },
  ...roles.value.map((role) => ({
    key: role.id,
    label: (roleLabels[role.label] ?? role.label) + "s",
  })),
]);

const filtered = computed(() =>
  activeFilter.value === "all"
    ? users.value
    : users.value.filter((user) => user.role_id === activeFilter.value),
);

const loadUsers = async () => {
  isLoading.value = true;
  errorMessage.value = "";
  try {
    const [usersResult, rolesResult] = await Promise.all([
      fetchUsers(),
      fetchRoles(),
    ]);
    users.value = usersResult;
    roles.value = rolesResult;
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : "Impossible de charger les utilisateurs";
  } finally {
    isLoading.value = false;
  }
};

const changeRole = async (user: User, event: Event) => {
  const roleId = Number((event.target as HTMLSelectElement).value);
  updatingId.value = user.id;
  try {
    const updated = await updateUserRole(user.id, roleId);
    user.role_id = updated.role_id;
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : "Changement de rôle impossible";
  } finally {
    updatingId.value = null;
  }
};

const changeActivation = async (user: User) => {
  updatingId.value = user.id;
  try {
    const updated = await toggleActivation(user.id, !user.is_activated);
    user.is_activated = updated.is_activated;
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : "Mise à jour impossible";
  } finally {
    updatingId.value = null;
  }
};

const removeUser = async (user: User) => {
  updatingId.value = user.id;
  try {
    await deleteUser(user.id);
    users.value = users.value.filter((u) => u.id !== user.id);
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : "Suppression impossible";
  } finally {
    updatingId.value = null;
  }
};

onMounted(() => {
  currentUserId.value = Number(localStorage.getItem("userId")) || null;
  loadUsers();
});
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center gap-3">
      <NuxtLink to="/admin">
        <Icon name="material-symbols:arrow-back" class="size-6 text-black" />
      </NuxtLink>
      <h1 class="text-2xl font-bold">Utilisateurs</h1>
    </div>

    <div class="flex gap-2 overflow-x-auto">
      <button
        v-for="filter in filters"
        :key="filter.key"
        class="shrink-0 cursor-pointer rounded-full px-4 py-2 text-sm font-bold transition-colors duration-200"
        :class="activeFilter === filter.key ? 'bg-[#15D98B] text-white' : 'bg-gray-200 text-black'"
        @click="activeFilter = filter.key"
      >
        {{ filter.label }}
      </button>
    </div>

    <p v-if="errorMessage" class="text-sm text-red-500">{{ errorMessage }}</p>
    <p v-if="isLoading" class="text-center text-sm text-gray-400">
      Chargement...
    </p>

    <div v-else class="space-y-3">
      <div
        v-for="user in filtered"
        :key="user.id"
        class="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
      >
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="text-lg font-bold">
              {{ user.first_name }} {{ user.last_name }}
              <span v-if="user.id === currentUserId" class="text-xs text-gray-400">(moi)</span>
            </p>
            <p class="text-sm text-gray-500">{{ user.email }}</p>
            <p class="text-xs text-gray-400">
              {{ user.email_verified ? "Email vérifié" : "Email non vérifié" }}
            </p>
          </div>
          <span
            class="shrink-0 rounded-full px-3 py-1 text-xs font-bold text-white"
            :class="user.is_activated ? 'bg-[#15D98B]' : 'bg-gray-400'"
          >
            {{ user.is_activated ? "Actif" : "Inactif" }}
          </span>
        </div>

        <div class="mt-3 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3">
          <select
            :value="user.role_id"
            :disabled="updatingId === user.id || user.id === currentUserId"
            class="rounded-full border border-gray-300 px-3 py-1 text-sm outline-none focus:border-[#15D98B] disabled:opacity-50"
            @change="changeRole(user, $event)"
          >
            <option v-for="role in roles" :key="role.id" :value="role.id">
              {{ roleLabel(role.id) }}
            </option>
          </select>

          <button
            :disabled="updatingId === user.id || user.id === currentUserId"
            class="cursor-pointer rounded-full px-4 py-1 text-sm font-bold text-white transition-transform duration-200 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
            :class="user.is_activated ? 'bg-gray-500' : 'bg-[#15D98B]'"
            @click="changeActivation(user)"
          >
            {{ user.is_activated ? "Désactiver" : "Activer" }}
          </button>

          <button
            :disabled="updatingId === user.id || user.id === currentUserId"
            class="cursor-pointer rounded-full bg-red-500 px-4 py-1 text-sm font-bold text-white transition-transform duration-200 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
            @click="removeUser(user)"
          >
            Supprimer
          </button>
        </div>
      </div>

      <p
        v-if="!isLoading && filtered.length === 0"
        class="text-center text-gray-400"
      >
        Aucun utilisateur dans cette catégorie.
      </p>
    </div>
  </div>
</template>
