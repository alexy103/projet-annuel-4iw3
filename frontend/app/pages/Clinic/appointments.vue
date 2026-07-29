<script setup lang="ts">
import type { Clinic } from "~/types/clinic";
import type { Appointment, AppointmentReason } from "~/types/appointment";
import type { Consultation } from "~/types/consultation";
import type { Veterinarian } from "~/types/veterinarian";

definePageMeta({
  layout: "default",
});

const { apiFetch } = useApi();
const { fetchClinics } = useClinics();
const { fetchByClinic } = useVeterinarians();
const { createConsultation, fetchByAppointment } = useConsultations();

const clinicId = ref<number | null>(null);
const appointments = ref<Appointment[]>([]);
const reasons = ref<AppointmentReason[]>([]);
const veterinarians = ref<Veterinarian[]>([]);
const isLoading = ref(false);
const errorMessage = ref("");
const updatingId = ref<number | null>(null);

const activeTab = ref<"pending" | "upcoming" | "past">("pending");
const selectedAppointment = ref<number | null>(null);

const tabs = [
  { key: "pending", label: "En attente" },
  { key: "upcoming", label: "À venir" },
  { key: "past", label: "Terminés / annulés / refusés" },
];

const consultationAppointment = ref<Appointment | null>(null);
const consultationVeterinarian = ref<string | null>(null);
const consultationSummary = ref("");
const consultationPrescription = ref("");
const isSubmittingConsultation = ref(false);
const consultationError = ref("");
const consultationsByAppointmentId = ref<Record<number, Consultation | null>>(
  {},
);
const consultationLoadingByAppointmentId = ref<Record<number, boolean>>({});
const consultationErrorByAppointmentId = ref<Record<number, string>>({});

const veterinarianLabels = computed(() =>
  veterinarians.value.map((vet) => `${vet.first_name} ${vet.last_name}`),
);

const getDatePart = (rawDate: string) =>
  rawDate.includes("T") ? (rawDate.split("T")[0] ?? rawDate) : rawDate;

const reasonLabel = (reasonId: number) =>
  reasons.value.find((reason) => reason.id === reasonId)?.label ??
  "Consultation";

const statusLabel = (appt: Appointment) => {
  if (appt.is_refused) return "Refusé";
  if (appt.is_cancelled) return "Annulé";
  if (appt.is_completed) return "Terminé";
  if (!appt.is_accepted) return "En attente";
  return "À venir";
};

const statusClass = (appt: Appointment) => {
  if (appt.is_refused) return "bg-red-500";
  if (appt.is_cancelled) return "bg-red-500";
  if (appt.is_completed) return "bg-gray-400";
  if (!appt.is_accepted) return "bg-yellow-500";
  return "bg-[#31C6D0]";
};

const isSettled = (appt: Appointment) =>
  appt.is_completed || appt.is_cancelled || appt.is_refused;

const filtered = computed(() => {
  const sorted = [...appointments.value].sort((a, b) => {
    const dateCompare = getDatePart(a.date).localeCompare(getDatePart(b.date));
    return dateCompare !== 0 ? dateCompare : a.time.localeCompare(b.time);
  });

  if (activeTab.value === "pending") {
    return sorted.filter(
      (appointment) => !appointment.is_accepted && !isSettled(appointment),
    );
  }
  if (activeTab.value === "upcoming") {
    return sorted.filter(
      (appointment) => appointment.is_accepted && !isSettled(appointment),
    );
  }
  return sorted.filter((appointment) => isSettled(appointment));
});

const loadAppointments = async () => {
  isLoading.value = true;
  errorMessage.value = "";
  try {
    const clinics = await fetchClinics();
    const clinic: Clinic | undefined = clinics[0];
    if (!clinic) return;
    clinicId.value = clinic.id;

    const [clinicAppointments, appointmentReasons, clinicVeterinarians] =
      await Promise.all([
        apiFetch<Appointment[]>(`/appointments/clinic/${clinic.id}`),
        apiFetch<AppointmentReason[]>("/appointment-reasons"),
        fetchByClinic(clinic.id),
      ]);
    appointments.value = clinicAppointments;
    reasons.value = appointmentReasons;
    veterinarians.value = clinicVeterinarians;
  } catch (error) {
    errorMessage.value =
      error instanceof Error
        ? error.message
        : "Impossible de charger les rendez-vous";
  } finally {
    isLoading.value = false;
  }
};

const toggleDetail = (id: number) => {
  selectedAppointment.value = selectedAppointment.value === id ? null : id;

  if (selectedAppointment.value === id) {
    void ensureConsultationLoaded(id);
  }
};

const ensureConsultationLoaded = async (appointmentId: number) => {
  if (consultationLoadingByAppointmentId.value[appointmentId]) {
    return;
  }

  if (appointmentId in consultationsByAppointmentId.value) {
    return;
  }

  consultationLoadingByAppointmentId.value = {
    ...consultationLoadingByAppointmentId.value,
    [appointmentId]: true,
  };

  consultationErrorByAppointmentId.value = {
    ...consultationErrorByAppointmentId.value,
    [appointmentId]: "",
  };

  try {
    const consultation = await fetchByAppointment(appointmentId);
    consultationsByAppointmentId.value = {
      ...consultationsByAppointmentId.value,
      [appointmentId]: consultation,
    };
  } catch (error) {
    const status =
      typeof error === "object" &&
      error !== null &&
      "status" in error &&
      typeof (error as { status?: unknown }).status === "number"
        ? (error as { status: number }).status
        : undefined;
    const isNotFound = status === 404;

    consultationsByAppointmentId.value = {
      ...consultationsByAppointmentId.value,
      [appointmentId]: null,
    };

    consultationErrorByAppointmentId.value = {
      ...consultationErrorByAppointmentId.value,
      [appointmentId]: isNotFound
        ? ""
        : error instanceof Error
          ? error.message
          : "Impossible de charger la consultation",
    };
  } finally {
    consultationLoadingByAppointmentId.value = {
      ...consultationLoadingByAppointmentId.value,
      [appointmentId]: false,
    };
  }
};

const openConsultation = (appointment: Appointment) => {
  consultationAppointment.value = appointment;
  consultationVeterinarian.value = null;
  consultationSummary.value = "";
  consultationPrescription.value = "";
  consultationError.value = "";
};

const closeConsultation = () => {
  consultationAppointment.value = null;
};

const submitConsultation = async () => {
  const appointment = consultationAppointment.value;
  const veterinarian = veterinarians.value.find(
    (vet) =>
      `${vet.first_name} ${vet.last_name}` === consultationVeterinarian.value,
  );

  if (!appointment || !veterinarian) {
    consultationError.value = "Le vétérinaire est obligatoire";
    return;
  }
  if (
    !consultationSummary.value.trim() ||
    !consultationPrescription.value.trim()
  ) {
    consultationError.value = "Le résumé et la prescription sont obligatoires";
    return;
  }

  isSubmittingConsultation.value = true;
  consultationError.value = "";
  try {
    const createdConsultation = await createConsultation({
      veterinarian_id: veterinarian.id,
      summary: consultationSummary.value.trim(),
      prescription: consultationPrescription.value.trim(),
      appointment_id: appointment.id,
    });

    consultationsByAppointmentId.value = {
      ...consultationsByAppointmentId.value,
      [appointment.id]: createdConsultation,
    };

    const updated = await apiFetch<Appointment>(
      `/appointments/${appointment.id}/completed`,
      { method: "PATCH", body: { isCompleted: true } },
    );
    appointment.is_completed = updated.is_completed;

    closeConsultation();
  } catch (error) {
    consultationError.value =
      error instanceof Error
        ? error.message
        : "Impossible d'enregistrer la consultation";
  } finally {
    isSubmittingConsultation.value = false;
  }
};

const acceptAppointment = async (appointment: Appointment) => {
  updatingId.value = appointment.id;
  try {
    const updated = await apiFetch<Appointment>(
      `/appointments/${appointment.id}/accepted`,
      { method: "PATCH" },
    );
    appointment.is_accepted = updated.is_accepted;
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : "Acceptation impossible";
  } finally {
    updatingId.value = null;
  }
};

const refuseAppointment = async (appointment: Appointment) => {
  updatingId.value = appointment.id;
  try {
    const updated = await apiFetch<Appointment>(
      `/appointments/${appointment.id}/refused`,
      { method: "PATCH" },
    );
    appointment.is_refused = updated.is_refused;
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : "Refus impossible";
  } finally {
    updatingId.value = null;
  }
};

const cancelAppointment = async (appointment: Appointment) => {
  updatingId.value = appointment.id;
  try {
    const updated = await apiFetch<Appointment>(
      `/appointments/${appointment.id}/cancelled`,
      { method: "PATCH" },
    );
    appointment.is_cancelled = updated.is_cancelled;
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : "Annulation impossible";
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

    <div class="flex flex-wrap gap-2">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="rounded-full px-4 py-2 text-sm font-bold transition-colors duration-200"
        :class="
          activeTab === tab.key
            ? 'bg-[#15D98B] text-white'
            : 'bg-gray-200 text-black'
        "
        @click="activeTab = tab.key as 'pending' | 'upcoming' | 'past'"
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
        class="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
      >
        <div
          class="flex cursor-pointer items-center justify-between p-4"
          @click="toggleDetail(appt.id)"
        >
          <div>
            <p class="text-lg font-bold">{{ reasonLabel(appt.reason_id) }}</p>
            <p class="text-sm text-gray-400">
              {{ getDatePart(appt.date) }} à {{ appt.time.slice(0, 5) }}
            </p>
          </div>
          <div class="flex flex-col items-end gap-2">
            <span
              class="rounded-full px-3 py-1 text-xs font-bold text-white"
              :class="statusClass(appt)"
            >
              {{ statusLabel(appt) }}
            </span>
            <Icon
              :name="
                selectedAppointment === appt.id
                  ? 'material-symbols:keyboard-arrow-up'
                  : 'material-symbols:keyboard-arrow-down'
              "
              class="size-5 text-gray-400"
            />
          </div>
        </div>

        <div
          v-if="selectedAppointment === appt.id"
          class="space-y-3 border-t border-gray-100 px-4 pt-3 pb-4"
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

          <div
            v-if="consultationLoadingByAppointmentId[appt.id]"
            class="text-sm text-gray-400"
          >
            Chargement de la consultation...
          </div>

          <div
            v-else-if="consultationErrorByAppointmentId[appt.id]"
            class="text-sm text-red-500"
          >
            {{ consultationErrorByAppointmentId[appt.id] }}
          </div>

          <div
            v-else-if="consultationsByAppointmentId[appt.id]"
            class="space-y-2 rounded-xl border border-gray-100 bg-gray-50 p-3"
          >
            <div>
              <p class="text-sm text-gray-400">Résumé</p>
              <p class="text-sm font-bold">
                {{ consultationsByAppointmentId[appt.id]?.summary }}
              </p>
            </div>

            <div>
              <p class="text-sm text-gray-400">Prescription</p>
              <p class="text-sm font-bold">
                {{ consultationsByAppointmentId[appt.id]?.prescription }}
              </p>
            </div>
          </div>

          <div
            v-if="!appt.is_accepted && !isSettled(appt)"
            class="flex gap-2 pt-1"
          >
            <button
              :disabled="updatingId === appt.id"
              class="rounded-full bg-[#15D98B] px-4 py-2 text-sm font-bold text-white transition-transform duration-200 hover:scale-105 disabled:opacity-50"
              @click="acceptAppointment(appt)"
            >
              Accepter
            </button>
            <button
              :disabled="updatingId === appt.id"
              class="rounded-full bg-red-500 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-red-600 disabled:opacity-50"
              @click="refuseAppointment(appt)"
            >
              Refuser
            </button>
          </div>

          <div
            v-else-if="appt.is_accepted && !isSettled(appt)"
            class="flex gap-2 pt-1"
          >
            <button
              :disabled="updatingId === appt.id"
              class="rounded-full bg-[#15D98B] px-4 py-2 text-sm font-bold text-white transition-transform duration-200 hover:scale-105 disabled:opacity-50"
              @click="openConsultation(appt)"
            >
              Réaliser le RDV
            </button>
            <button
              :disabled="updatingId === appt.id"
              class="rounded-full bg-red-500 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-red-600 disabled:opacity-50"
              @click="cancelAppointment(appt)"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>

      <p
        v-if="!isLoading && filtered.length === 0"
        class="text-center text-gray-400"
      >
        Aucun rendez-vous dans cette catégorie.
      </p>
    </div>

    <BasePopup
      :model-value="!!consultationAppointment"
      fit
      @update:model-value="closeConsultation"
    >
      <form @submit.prevent="submitConsultation" class="w-72 space-y-4">
        <p class="text-center font-bold">Réaliser le rendez-vous</p>

        <BaseSelect
          id="consultation-vet"
          v-model="consultationVeterinarian"
          label="Vétérinaire"
          :options="veterinarianLabels"
        />

        <div>
          <label class="mb-1 block text-center text-sm">Résumé</label>
          <textarea
            v-model="consultationSummary"
            rows="3"
            class="w-full resize-none rounded-2xl border px-3 py-2 text-sm outline-none focus:border-[#15D98B]"
          />
        </div>

        <div>
          <label class="mb-1 block text-center text-sm">Prescription</label>
          <textarea
            v-model="consultationPrescription"
            rows="3"
            class="w-full resize-none rounded-2xl border px-3 py-2 text-sm outline-none focus:border-[#15D98B]"
          />
        </div>

        <p v-if="consultationError" class="text-center text-sm text-red-500">
          {{ consultationError }}
        </p>
        <BaseButton
          type="submit"
          :disabled="isSubmittingConsultation"
          class="flex w-full justify-center"
        >
          {{ isSubmittingConsultation ? "Enregistrement..." : "Valider" }}
        </BaseButton>
      </form>
    </BasePopup>
  </div>
</template>
