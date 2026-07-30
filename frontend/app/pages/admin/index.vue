<script setup lang="ts">
import type { Clinic, ClinicStatus } from "~/types/clinic";

definePageMeta({
  layout: "default",
});

const { fetchClinics, updateClinicStatus } = useClinics();

const clinics = ref<Clinic[]>([]);
const isLoading = ref(false);
const errorMessage = ref("");
const activeFilter = ref<"all" | ClinicStatus>("all");
const updatingId = ref<number | null>(null);

const filters = [
  { key: "all", label: "Toutes" },
  { key: "pending", label: "En attente" },
  { key: "approved", label: "Validées" },
  { key: "rejected", label: "Refusées" },
];

const statusLabels: Record<ClinicStatus, string> = {
  pending: "En attente",
  approved: "Validée",
  rejected: "Refusée",
};

const statusClasses: Record<ClinicStatus, string> = {
  pending: "bg-[#31C6D0]",
  approved: "bg-[#15D98B]",
  rejected: "bg-gray-400",
};

const filtered = computed(() =>
  activeFilter.value === "all"
    ? clinics.value
    : clinics.value.filter((clinic) => clinic.status === activeFilter.value),
);

const pendingCount = computed(
  () => clinics.value.filter((clinic) => clinic.status === "pending").length,
);

const loadClinics = async () => {
  isLoading.value = true;
  errorMessage.value = "";
  try {
    clinics.value = await fetchClinics();
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : "Impossible de charger les cliniques";
  } finally {
    isLoading.value = false;
  }
};

const changeStatus = async (clinic: Clinic, status: ClinicStatus) => {
  updatingId.value = clinic.id;
  try {
    const updated = await updateClinicStatus(clinic.id, status);
    clinic.status = updated.status;
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : "Mise à jour impossible";
  } finally {
    updatingId.value = null;
  }
};

onMounted(loadClinics);
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold">Cliniques</h1>
        <p class="text-sm text-gray-400">
          {{ pendingCount }} demande(s) en attente
        </p>
      </div>
      <div class="flex items-center gap-2">
        <NuxtLink
          to="/admin/users"
          class="flex items-center gap-2 rounded-full bg-gray-200 px-4 py-2 text-sm font-bold text-black transition-transform duration-200 hover:scale-[1.02]"
        >
          <Icon name="material-symbols:group" class="size-5" />
          Utilisateurs
        </NuxtLink>
        <NuxtLink
          to="/admin/clinics/create"
          class="flex items-center gap-2 rounded-full bg-[#15D98B] px-4 py-2 text-sm font-bold text-white transition-transform duration-200 hover:scale-[1.02]"
        >
          <Icon name="material-symbols:add-rounded" class="size-5" />
          Créer une clinique
        </NuxtLink>
      </div>
    </div>

    <div class="flex gap-2 overflow-x-auto">
      <button
        v-for="filter in filters"
        :key="filter.key"
        class="shrink-0 rounded-full px-4 py-2 text-sm font-bold transition-colors duration-200"
        :class="activeFilter === filter.key ? 'bg-[#15D98B] text-white' : 'bg-gray-200 text-black'"
        @click="activeFilter = filter.key as 'all' | ClinicStatus"
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
        v-for="clinic in filtered"
        :key="clinic.id"
        class="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
      >
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="text-lg font-bold">{{ clinic.name }}</p>
            <p class="text-sm text-gray-500">
              {{ clinic.address }}, {{ clinic.postcode }} {{ clinic.city }}
            </p>
            <p class="text-sm text-gray-400">{{ clinic.phone_number }}</p>
          </div>
          <span
            class="shrink-0 rounded-full px-3 py-1 text-xs font-bold text-white"
            :class="statusClasses[clinic.status]"
          >
            {{ statusLabels[clinic.status] }}
          </span>
        </div>

        <div
          v-if="clinic.status !== 'approved'"
          class="mt-3 flex gap-2 border-t border-gray-100 pt-3"
        >
          <button
            :disabled="updatingId === clinic.id"
            class="rounded-full bg-[#15D98B] px-4 py-2 text-sm font-bold text-white transition-transform duration-200 hover:scale-105 disabled:opacity-50"
            @click="changeStatus(clinic, 'approved')"
          >
            Valider
          </button>
          <button
            v-if="clinic.status === 'pending'"
            :disabled="updatingId === clinic.id"
            class="rounded-full bg-red-500 px-4 py-2 text-sm font-bold text-white transition-transform duration-200 hover:scale-105 disabled:opacity-50"
            @click="changeStatus(clinic, 'rejected')"
          >
            Refuser
          </button>
        </div>
      </div>

      <p
        v-if="!isLoading && filtered.length === 0"
        class="text-center text-gray-400"
      >
        Aucune clinique dans cette catégorie.
      </p>
    </div>
  </div>
</template>
