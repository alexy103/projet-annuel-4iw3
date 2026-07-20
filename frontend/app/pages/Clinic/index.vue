<script setup lang="ts">
import type { Clinic } from "~/types/clinic";
import type { Appointment, AppointmentReason } from "~/types/appointment";
import type { Veterinarian } from "~/types/veterinarian";

definePageMeta({
  layout: "default",
});

const { apiFetch } = useApi();
const { fetchClinics } = useClinics();
const { fetchByClinic } = useVeterinarians();

const clinic = ref<Clinic | null>(null);
const appointments = ref<Appointment[]>([]);
const veterinarians = ref<Veterinarian[]>([]);
const reasons = ref<AppointmentReason[]>([]);
const isLoading = ref(false);
const errorMessage = ref("");

const today = new Date().toISOString().slice(0, 10);

const getDatePart = (rawDate: string) =>
  rawDate.includes("T") ? (rawDate.split("T")[0] ?? rawDate) : rawDate;

const reasonLabel = (reasonId: number) =>
  reasons.value.find((reason) => reason.id === reasonId)?.label ?? "Consultation";

const todayAppointments = computed(() =>
  appointments.value
    .filter((appointment) => getDatePart(appointment.date) === today)
    .sort((a, b) => a.time.localeCompare(b.time)),
);

const upcomingCount = computed(
  () =>
    appointments.value.filter(
      (appointment) =>
        !appointment.is_completed && getDatePart(appointment.date) >= today,
    ).length,
);

const stats = computed(() => [
  {
    label: "RDV aujourd'hui",
    value: todayAppointments.value.length,
    icon: "material-symbols:calendar-today",
  },
  {
    label: "À venir",
    value: upcomingCount.value,
    icon: "material-symbols:pending-actions",
  },
  {
    label: "Vétérinaires",
    value: veterinarians.value.length,
    icon: "material-symbols:stethoscope",
  },
]);

const quickLinks = [
  {
    label: "Gestion des RDV",
    description: "Voir et gérer les rendez-vous",
    icon: "material-symbols:calendar-month",
    to: "/clinic/appointments",
    color: "bg-[#15D98B]",
  },
  {
    label: "Nos vétérinaires",
    description: "Gérer l'équipe médicale",
    icon: "material-symbols:stethoscope",
    to: "/clinic/veterinarians",
    color: "bg-[#31C6D0]",
  },
  {
    label: "Paramètres",
    description: "Modifier les infos de la clinique",
    icon: "material-symbols:settings",
    to: "/clinic/settings",
    color: "bg-[#CCE8DD]",
  },
];

const loadDashboard = async () => {
  isLoading.value = true;
  errorMessage.value = "";
  try {
    const clinics = await fetchClinics();
    clinic.value = clinics[0] ?? null;

    reasons.value = await apiFetch<AppointmentReason[]>("/appointment-reasons");

    if (clinic.value) {
      const [clinicAppointments, clinicVets] = await Promise.all([
        apiFetch<Appointment[]>(`/appointments/clinic/${clinic.value.id}`),
        fetchByClinic(clinic.value.id),
      ]);
      appointments.value = clinicAppointments;
      veterinarians.value = clinicVets;
    }
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : "Impossible de charger le tableau de bord";
  } finally {
    isLoading.value = false;
  }
};

onMounted(loadDashboard);
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold">Tableau de bord</h1>
      <p class="text-sm text-gray-400">{{ clinic?.name ?? "Ma clinique" }}</p>
    </div>

    <p v-if="errorMessage" class="text-sm text-red-500">{{ errorMessage }}</p>

    <div class="grid grid-cols-3 gap-3">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="rounded-2xl bg-white border border-gray-100 shadow-sm p-4 flex flex-col items-center gap-1 text-center"
      >
        <Icon :name="stat.icon" class="size-6 text-[#15D98B]" />
        <p class="text-2xl font-bold">{{ stat.value }}</p>
        <p class="text-xs text-gray-400">{{ stat.label }}</p>
      </div>
    </div>

    <div class="space-y-3">
      <h2 class="text-lg font-bold">Accès rapide</h2>
      <div class="space-y-3">
        <NuxtLink
          v-for="link in quickLinks"
          :key="link.to"
          :to="link.to"
          class="flex items-center gap-4 rounded-2xl p-4 text-white transition-transform duration-200 hover:scale-[1.02] cursor-pointer"
          :class="link.color"
        >
          <Icon :name="link.icon" class="size-8 shrink-0" :class="link.color === 'bg-[#CCE8DD]' ? 'text-[#15D98B]' : 'text-white'" />
          <div>
            <p class="font-bold" :class="link.color === 'bg-[#CCE8DD]' ? 'text-black' : 'text-white'">{{ link.label }}</p>
            <p class="text-sm" :class="link.color === 'bg-[#CCE8DD]' ? 'text-gray-500' : 'text-white/80'">{{ link.description }}</p>
          </div>
          <Icon name="material-symbols:arrow-forward" class="ml-auto size-5" :class="link.color === 'bg-[#CCE8DD]' ? 'text-[#15D98B]' : 'text-white'" />
        </NuxtLink>
      </div>
    </div>

    <div class="space-y-3">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-bold">RDV du jour</h2>
        <NuxtLink to="/clinic/appointments" class="text-sm font-bold text-[#15D98B]">Tout voir</NuxtLink>
      </div>
      <div class="space-y-2">
        <div
          v-for="appt in todayAppointments"
          :key="appt.id"
          class="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm"
        >
          <div class="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#CCE8DD]">
            <p class="text-xs font-bold text-[#15D98B]">{{ appt.time.slice(0, 5) }}</p>
          </div>
          <div>
            <p class="font-bold text-sm">{{ reasonLabel(appt.reason_id) }}</p>
            <p class="text-xs text-gray-400">
              {{ appt.is_completed ? "Terminé" : "À traiter" }}
            </p>
          </div>
        </div>

        <p
          v-if="!isLoading && todayAppointments.length === 0"
          class="text-center text-sm text-gray-400"
        >
          Aucun rendez-vous aujourd'hui.
        </p>
      </div>
    </div>
  </div>
</template>
