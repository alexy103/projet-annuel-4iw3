<script setup lang="ts">
import type { Clinic } from "~/types/clinic";
import type { Appointment, AppointmentReason } from "~/types/appointment";

definePageMeta({
  layout: "default",
});

const { apiFetch } = useApi();
const { fetchClinics } = useClinics();

const clinicId = ref<number | null>(null);
const appointments = ref<Appointment[]>([]);
const reasons = ref<AppointmentReason[]>([]);
const isLoading = ref(false);
const errorMessage = ref("");
const updatingId = ref<number | null>(null);

const activeTab = ref<"upcoming" | "past">("upcoming");
const selectedAppointment = ref<number | null>(null);

const tabs = [
  { key: "upcoming", label: "À venir" },
  { key: "past", label: "Terminés" },
];

const getDatePart = (rawDate: string) =>
  rawDate.includes("T") ? (rawDate.split("T")[0] ?? rawDate) : rawDate;

const reasonLabel = (reasonId: number) =>
  reasons.value.find((reason) => reason.id === reasonId)?.label ?? "Consultation";

const filtered = computed(() => {
  const sorted = [...appointments.value].sort((a, b) => {
    const dateCompare = getDatePart(a.date).localeCompare(getDatePart(b.date));
    return dateCompare !== 0 ? dateCompare : a.time.localeCompare(b.time);
  });
  return activeTab.value === "upcoming"
    ? sorted.filter((appointment) => !appointment.is_completed)
    : sorted.filter((appointment) => appointment.is_completed);
});

const loadAppointments = async () => {
  isLoading.value = true;
  errorMessage.value = "";
  try {
    const clinics = await fetchClinics();
    const clinic: Clinic | undefined = clinics[0];
    if (!clinic) return;
    clinicId.value = clinic.id;

    const [clinicAppointments, appointmentReasons] = await Promise.all([
      apiFetch<Appointment[]>(`/appointments/clinic/${clinic.id}`),
      apiFetch<AppointmentReason[]>("/appointment-reasons"),
    ]);
    appointments.value = clinicAppointments;
    reasons.value = appointmentReasons;
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : "Impossible de charger les rendez-vous";
  } finally {
    isLoading.value = false;
  }
};

const toggleDetail = (id: number) => {
  selectedAppointment.value = selectedAppointment.value === id ? null : id;
};

const completeAppointment = async (appointment: Appointment) => {
  updatingId.value = appointment.id;
  try {
    const updated = await apiFetch<Appointment>(
      `/appointments/${appointment.id}/completed`,
      { method: "PATCH", body: { isCompleted: true } },
    );
    appointment.is_completed = updated.is_completed;
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : "Mise à jour impossible";
  } finally {
    updatingId.value = null;
  }
};

onMounted(loadAppointments);
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center gap-3">
      <NuxtLink to="/clinic">
        <Icon name="material-symbols:arrow-back" class="size-6 text-black" />
      </NuxtLink>
      <h1 class="text-2xl font-bold">Gestion des RDV</h1>
    </div>

    <div class="flex gap-2">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="rounded-full px-4 py-2 text-sm font-bold transition-colors duration-200"
        :class="activeTab === tab.key ? 'bg-[#15D98B] text-white' : 'bg-gray-200 text-black'"
        @click="activeTab = tab.key as 'upcoming' | 'past'"
      >
        {{ tab.label }}
      </button>
    </div>

    <p v-if="errorMessage" class="text-sm text-red-500">{{ errorMessage }}</p>
    <p v-if="isLoading" class="text-center text-sm text-gray-400">
      Chargement...
    </p>

    <div v-else class="space-y-4">
      <div
        v-for="appt in filtered"
        :key="appt.id"
        class="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden"
      >
        <div
          class="flex items-center justify-between p-4 cursor-pointer"
          @click="toggleDetail(appt.id)"
        >
          <div>
            <p class="font-bold text-lg">{{ reasonLabel(appt.reason_id) }}</p>
            <p class="text-sm text-gray-400">
              {{ getDatePart(appt.date) }} à {{ appt.time.slice(0, 5) }}
            </p>
          </div>
          <div class="flex flex-col items-end gap-2">
            <span
              class="rounded-full px-3 py-1 text-xs font-bold text-white"
              :class="appt.is_completed ? 'bg-gray-400' : 'bg-[#31C6D0]'"
            >
              {{ appt.is_completed ? 'Terminé' : 'À venir' }}
            </span>
            <Icon
              :name="selectedAppointment === appt.id ? 'material-symbols:keyboard-arrow-up' : 'material-symbols:keyboard-arrow-down'"
              class="size-5 text-gray-400"
            />
          </div>
        </div>

        <div
          v-if="selectedAppointment === appt.id"
          class="border-t border-gray-100 px-4 pb-4 pt-3 space-y-3"
        >
          <div class="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p class="text-gray-400">Motif</p>
              <p class="font-bold">{{ reasonLabel(appt.reason_id) }}</p>
            </div>
            <div>
              <p class="text-gray-400">Date & heure</p>
              <p class="font-bold">
                {{ getDatePart(appt.date) }} à {{ appt.time.slice(0, 5) }}
              </p>
            </div>
          </div>

          <div v-if="appt.remark">
            <p class="text-sm text-gray-400">Remarque</p>
            <p class="text-sm font-bold">{{ appt.remark }}</p>
          </div>

          <div v-if="!appt.is_completed" class="pt-1">
            <button
              :disabled="updatingId === appt.id"
              class="rounded-full bg-[#15D98B] px-4 py-2 text-sm font-bold text-white transition-transform duration-200 hover:scale-105 disabled:opacity-50"
              @click="completeAppointment(appt)"
            >
              Clôturer
            </button>
          </div>
        </div>
      </div>

      <p v-if="!isLoading && filtered.length === 0" class="text-center text-gray-400">
        Aucun rendez-vous dans cette catégorie.
      </p>
    </div>
  </div>
</template>
