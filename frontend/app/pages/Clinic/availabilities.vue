<script setup lang="ts">
import type { Clinic } from "~/types/clinic";
import type { Availability } from "~/types/availability";

definePageMeta({
  layout: "default",
});

// Le backend compare les jours en anglais (voir appointments.service.ts), on
// affiche le français mais on envoie/lit toujours la valeur anglaise.
const DAY_OPTIONS = [
  { label: "Lundi", value: "Monday" },
  { label: "Mardi", value: "Tuesday" },
  { label: "Mercredi", value: "Wednesday" },
  { label: "Jeudi", value: "Thursday" },
  { label: "Vendredi", value: "Friday" },
  { label: "Samedi", value: "Saturday" },
  { label: "Dimanche", value: "Sunday" },
];

const dayLabels = DAY_OPTIONS.map((option) => option.label);

const dayLabel = (value: string) =>
  DAY_OPTIONS.find(
    (option) => option.value.toLowerCase() === value.toLowerCase(),
  )?.label ?? value;

const { fetchClinics } = useClinics();
const { fetchByClinic, createAvailability, deleteAvailability } =
  useAvailabilities();

const clinicId = ref<number | null>(null);
const availabilities = ref<Availability[]>([]);
const isLoading = ref(false);
const errorMessage = ref("");

const showAddPopup = ref(false);
const isSubmitting = ref(false);
const formError = ref("");

const newDayLabel = ref<string | null>(null);
const newOpening = ref("9");
const newClosing = ref("18");
const newBreakStart = ref("12");
const newBreakEnd = ref("13");
const newInterval = ref("15");
const newCapacity = ref("1");

const dayIndex = (day: string) =>
  DAY_OPTIONS.findIndex(
    (option) => option.value.toLowerCase() === day.toLowerCase(),
  );

const sortedAvailabilities = computed(() =>
  [...availabilities.value].sort((a, b) => dayIndex(a.day) - dayIndex(b.day)),
);

const formatHour = (hour: number) => `${String(hour).padStart(2, "0")}h`;

const loadAvailabilities = async () => {
  isLoading.value = true;
  errorMessage.value = "";
  try {
    const clinics = await fetchClinics();
    const clinic: Clinic | undefined = clinics[0];
    if (!clinic) return;
    clinicId.value = clinic.id;
    availabilities.value = await fetchByClinic(clinic.id);
  } catch (error) {
    errorMessage.value =
      error instanceof Error
        ? error.message
        : "Impossible de charger les disponibilités";
  } finally {
    isLoading.value = false;
  }
};

const resetForm = () => {
  newDayLabel.value = null;
  newOpening.value = "9";
  newClosing.value = "18";
  newBreakStart.value = "12";
  newBreakEnd.value = "13";
  newInterval.value = "15";
  newCapacity.value = "1";
};

const addAvailability = async () => {
  const englishDay = DAY_OPTIONS.find(
    (option) => option.label === newDayLabel.value,
  )?.value;

  if (!clinicId.value || !englishDay) {
    formError.value = "Le jour est obligatoire";
    return;
  }

  formError.value = "";
  isSubmitting.value = true;
  try {
    const created = await createAvailability({
      clinic_id: clinicId.value,
      day: englishDay,
      opening: Number(newOpening.value),
      closing: Number(newClosing.value),
      slot_rules: {
        interval: Number(newInterval.value),
        capacity: Number(newCapacity.value),
        break: {
          start: Number(newBreakStart.value),
          end: Number(newBreakEnd.value),
        },
      },
    });
    availabilities.value.push(created);
    resetForm();
    showAddPopup.value = false;
  } catch (error) {
    formError.value =
      error instanceof Error ? error.message : "Ajout impossible";
  } finally {
    isSubmitting.value = false;
  }
};

const removeAvailability = async (availability: Availability) => {
  try {
    await deleteAvailability(availability.id);
    availabilities.value = availabilities.value.filter(
      (item) => item.id !== availability.id,
    );
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : "Suppression impossible";
  }
};

onMounted(loadAvailabilities);
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <NuxtLink to="/clinic">
          <Icon name="material-symbols:arrow-back" class="size-6 text-black" />
        </NuxtLink>
        <h1 class="text-2xl font-bold">Horaires d'ouverture</h1>
      </div>
      <button
        class="flex cursor-pointer items-center gap-2 rounded-full bg-[#15D98B] px-4 py-2 text-sm font-bold text-white transition-transform duration-200 hover:scale-[1.02]"
        @click="showAddPopup = true"
      >
        <Icon name="material-symbols:add-rounded" class="size-5" />
        Ajouter
      </button>
    </div>

    <p v-if="errorMessage" class="text-sm text-red-500">{{ errorMessage }}</p>
    <p v-if="isLoading" class="text-center text-sm text-gray-400">
      Chargement...
    </p>

    <div v-else class="space-y-3">
      <div
        v-for="availability in sortedAvailabilities"
        :key="availability.id"
        class="flex items-center gap-4 rounded-2xl bg-[#15D98B] px-4 py-3 text-white"
      >
        <div class="flex-1">
          <p class="text-lg font-bold">{{ dayLabel(availability.day) }}</p>
          <p class="text-sm">
            {{ formatHour(availability.opening) }} -
            {{ formatHour(availability.closing) }}
            <span v-if="availability.slot_rules?.break">
              (pause {{ formatHour(availability.slot_rules.break.start) }} -
              {{ formatHour(availability.slot_rules.break.end) }})
            </span>
          </p>
          <p class="text-xs text-white/80">
            Créneaux de {{ availability.slot_rules?.interval }} min ·
            {{ availability.slot_rules?.capacity ?? 1 }} rdv/créneau
          </p>
        </div>
        <button
          class="cursor-pointer rounded-full bg-red-500 px-3 py-1 text-xs font-bold transition-colors hover:bg-red-600"
          @click="removeAvailability(availability)"
        >
          Supprimer
        </button>
      </div>

      <p
        v-if="!isLoading && availabilities.length === 0"
        class="text-center text-gray-400"
      >
        Aucun horaire configuré pour le moment.
      </p>
    </div>

    <BasePopup v-model="showAddPopup" fit>
      <form @submit.prevent="addAvailability" class="w-72 space-y-4">
        <p class="text-center font-bold">Ajouter un horaire</p>

        <BaseSelect
          id="availability-day"
          v-model="newDayLabel"
          label="Jour"
          :options="dayLabels"
        />

        <div class="flex gap-3">
          <BaseInput
            v-model="newOpening"
            label="Ouverture (h)"
            type="number"
            small
          />
          <BaseInput
            v-model="newClosing"
            label="Fermeture (h)"
            type="number"
            small
          />
        </div>

        <div class="flex gap-3">
          <BaseInput
            v-model="newBreakStart"
            label="Pause début (h)"
            type="number"
            small
          />
          <BaseInput
            v-model="newBreakEnd"
            label="Pause fin (h)"
            type="number"
            small
          />
        </div>

        <div class="flex gap-3">
          <BaseInput
            v-model="newInterval"
            label="Intervalle (min)"
            type="number"
            small
          />
          <BaseInput
            v-model="newCapacity"
            label="Capacité/créneau"
            type="number"
            small
          />
        </div>

        <p v-if="formError" class="text-center text-sm text-red-500">
          {{ formError }}
        </p>
        <BaseButton
          type="submit"
          :disabled="isSubmitting"
          class="flex w-full justify-center"
        >
          {{ isSubmitting ? "Ajout..." : "Ajouter" }}
        </BaseButton>
      </form>
    </BasePopup>
  </div>
</template>
