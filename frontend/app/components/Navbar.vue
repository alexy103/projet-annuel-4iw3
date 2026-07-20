<script setup lang="ts">
import { useAppointmentBookingPopup } from "~/composables/useAppointmentBookingPopup";

type ApiResponse<T> = {
  success: boolean;
  data: T;
  error?: string;
};

type Clinic = {
  id: number;
  name: string;
  city: string;
};

type AppointmentReason = {
  id: number;
  label: string;
};

type Availability = {
  id: number;
  clinic_id: number;
  day: string;
  opening: number;
  closing: number;
  slot_rules: unknown;
};

type ApiAppointment = {
  id: number;
  date: string;
  time: string;
  clinic_id: number;
};

type SlotRules = {
  interval: number;
  capacity?: number;
  break?: {
    start: number;
    end: number;
  };
};

type TimeSlot = {
  time: string;
  remaining: number;
  isFull: boolean;
};

const userStore = useUserStore();
const {
  isOpen: showNewApt,
  prefilledDate,
  open,
  close,
  clearPrefilledDate,
} = useAppointmentBookingPopup();
const isReady = ref(false);
const isSubmittingAppointment = ref(false);
const isLoadingLookups = ref(false);
const appointmentErrorMessage = ref("");
const appointmentSuccessMessage = ref("");
const isLoadingTimeSlots = ref(false);

const clinics = ref<Clinic[]>([]);
const reasons = ref<AppointmentReason[]>([]);
const timeSlots = ref<TimeSlot[]>([]);

const availableTimeSlots = computed(() => {
  return timeSlots.value.filter((slot) => !slot.isFull);
});

const appointmentDate = ref("");
const appointmentTime = ref("");
const selectedAnimalName = ref<string | null>(null);
const selectedClinicLabel = ref<string | null>(null);
const selectedReasonLabel = ref<string | null>(null);
const appointmentRemark = ref("");

const animalOptions = computed(() => {
  return userStore.animals.map((animal) => animal.name);
});

const clinicOptions = computed(() => {
  return clinics.value.map((clinic) => `${clinic.name} - ${clinic.city}`);
});

const selectedClinic = computed(() => {
  return clinics.value.find(
    (clinic) => `${clinic.name} - ${clinic.city}` === selectedClinicLabel.value,
  );
});

const reasonOptions = computed(() => {
  return reasons.value.map((reason) => reason.label);
});

const canSubmitAppointment = computed(() => {
  return (
    !isSubmittingAppointment.value &&
    !isLoadingLookups.value &&
    appointmentDate.value !== "" &&
    appointmentTime.value !== "" &&
    selectedAnimalName.value !== null &&
    selectedClinicLabel.value !== null &&
    selectedReasonLabel.value !== null
  );
});

const profileLink = computed(() => {
  return userStore.id ? `/profile/${userStore.id}` : "";
});

const getAuthHeaders = () => {
  const config = useRuntimeConfig();
  const accessToken = localStorage.getItem("accessToken");

  return {
    "x-api-key": config.public.apiKey,
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };
};

const resetAppointmentForm = () => {
  appointmentDate.value = "";
  appointmentTime.value = "";
  selectedAnimalName.value = null;
  selectedClinicLabel.value = null;
  selectedReasonLabel.value = null;
  appointmentRemark.value = "";
  appointmentErrorMessage.value = "";
  timeSlots.value = [];
};

const getDatePart = (rawDate: string): string => {
  return rawDate.includes("T") ? (rawDate.split("T")[0] ?? rawDate) : rawDate;
};

const parseSlotRules = (rawRules: unknown): SlotRules | null => {
  if (typeof rawRules !== "object" || rawRules === null) {
    return null;
  }

  const interval = Number((rawRules as { interval?: unknown }).interval);
  const capacity = Number((rawRules as { capacity?: unknown }).capacity ?? 1);
  const rawBreak = (rawRules as { break?: unknown }).break;

  if (!Number.isInteger(interval) || interval <= 0) {
    return null;
  }

  const parsedRules: SlotRules = {
    interval,
    capacity: Number.isInteger(capacity) && capacity > 0 ? capacity : 1,
  };

  if (typeof rawBreak === "object" && rawBreak !== null) {
    const breakStart = Number((rawBreak as { start?: unknown }).start);
    const breakEnd = Number((rawBreak as { end?: unknown }).end);

    if (
      Number.isFinite(breakStart) &&
      Number.isFinite(breakEnd) &&
      breakStart < breakEnd
    ) {
      parsedRules.break = {
        start: breakStart,
        end: breakEnd,
      };
    }
  }

  return parsedRules;
};

const formatMinutesAsTime = (minutesFromMidnight: number): string => {
  const hours = Math.floor(minutesFromMidnight / 60)
    .toString()
    .padStart(2, "0");
  const minutes = (minutesFromMidnight % 60).toString().padStart(2, "0");

  return `${hours}:${minutes}`;
};

const normalizeTimeToHourMinute = (rawTime: string): string => {
  const [hours = "00", minutes = "00"] = rawTime.split(":");
  return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
};

const normalizeDayName = (day: string): string => {
  return day
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
};

const getDayCandidates = (date: string): string[] => {
  const [year = 1970, month = 1, day = 1] = getDatePart(date)
    .split("-")
    .map(Number);
  const dayIndex = new Date(year, month - 1, day).getDay();

  const englishDayNames = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  const frenchDayNames = [
    "dimanche",
    "lundi",
    "mardi",
    "mercredi",
    "jeudi",
    "vendredi",
    "samedi",
  ];

  return [englishDayNames[dayIndex] ?? "", frenchDayNames[dayIndex] ?? ""];
};

const buildTimeSlots = (
  availability: Availability,
  rules: SlotRules,
  bookedByTime: Map<string, number>,
): TimeSlot[] => {
  const openMinutes = availability.opening * 60;
  const closeMinutes = availability.closing * 60;
  const breakStart = rules.break ? rules.break.start * 60 : null;
  const breakEnd = rules.break ? rules.break.end * 60 : null;
  const capacity = rules.capacity ?? 1;
  const slots: TimeSlot[] = [];

  for (
    let slotStart = openMinutes;
    slotStart + rules.interval <= closeMinutes;
    slotStart += rules.interval
  ) {
    if (breakStart !== null && breakEnd !== null) {
      const isInBreak = slotStart >= breakStart && slotStart < breakEnd;
      if (isInBreak) {
        continue;
      }
    }

    const slotTime = formatMinutesAsTime(slotStart);
    const booked = bookedByTime.get(slotTime) ?? 0;
    const remaining = Math.max(0, capacity - booked);

    slots.push({
      time: slotTime,
      remaining,
      isFull: remaining <= 0,
    });
  }

  return slots;
};

const refreshTimeSlots = async () => {
  appointmentTime.value = "";
  timeSlots.value = [];

  if (
    !showNewApt.value ||
    !selectedClinic.value?.id ||
    !appointmentDate.value
  ) {
    return;
  }

  isLoadingTimeSlots.value = true;

  try {
    const config = useRuntimeConfig();
    const clinicId = selectedClinic.value.id;
    const selectedDate = getDatePart(appointmentDate.value);

    const [availabilitiesResponse, appointmentsResponse] = await Promise.all([
      fetch(`${config.public.apiUrl}/availabilities/clinic/${clinicId}`, {
        method: "GET",
        headers: getAuthHeaders(),
      }),
      fetch(`${config.public.apiUrl}/appointments/clinic/${clinicId}`, {
        method: "GET",
        headers: getAuthHeaders(),
      }),
    ]);

    const availabilitiesResult =
      (await availabilitiesResponse.json()) as ApiResponse<Availability[]>;
    const appointmentsResult =
      (await appointmentsResponse.json()) as ApiResponse<ApiAppointment[]>;

    if (!availabilitiesResponse.ok || !availabilitiesResult.success) {
      throw new Error(
        availabilitiesResult.error ||
          "Impossible de charger les disponibilités de la clinique",
      );
    }

    if (!appointmentsResponse.ok || !appointmentsResult.success) {
      throw new Error(
        appointmentsResult.error || "Impossible de charger les rendez-vous",
      );
    }

    const dayCandidates = getDayCandidates(selectedDate).map(normalizeDayName);
    const availability = availabilitiesResult.data.find((item) => {
      return dayCandidates.includes(normalizeDayName(item.day));
    });

    if (!availability) {
      timeSlots.value = [];
      return;
    }

    const slotRules = parseSlotRules(availability.slot_rules);

    if (!slotRules) {
      timeSlots.value = [];
      return;
    }

    const bookedByTime = new Map<string, number>();

    appointmentsResult.data
      .filter((appointment) => {
        return (
          appointment.clinic_id === clinicId &&
          getDatePart(appointment.date) === selectedDate
        );
      })
      .forEach((appointment) => {
        const normalizedTime = normalizeTimeToHourMinute(appointment.time);
        const count = bookedByTime.get(normalizedTime) ?? 0;
        bookedByTime.set(normalizedTime, count + 1);
      });

    timeSlots.value = buildTimeSlots(availability, slotRules, bookedByTime);
  } catch (error) {
    appointmentErrorMessage.value =
      error instanceof Error
        ? error.message
        : "Impossible de calculer les créneaux disponibles";
  } finally {
    isLoadingTimeSlots.value = false;
  }
};

const selectTimeSlot = (slotTime: string) => {
  appointmentTime.value = slotTime;
};

const fetchClinics = async () => {
  const config = useRuntimeConfig();

  const response = await fetch(`${config.public.apiUrl}/clinics`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const result = (await response.json()) as ApiResponse<Clinic[]>;

  if (!response.ok || !result.success) {
    throw new Error(result.error || "Impossible de charger les cliniques");
  }

  clinics.value = result.data;
};

const fetchAppointmentReasons = async () => {
  const config = useRuntimeConfig();

  const response = await fetch(`${config.public.apiUrl}/appointment-reasons`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const result = (await response.json()) as ApiResponse<AppointmentReason[]>;

  if (!response.ok || !result.success) {
    throw new Error(result.error || "Impossible de charger les motifs");
  }

  reasons.value = result.data;
};

const loadAppointmentFormData = async () => {
  appointmentErrorMessage.value = "";
  isLoadingLookups.value = true;

  try {
    await Promise.all([fetchClinics(), fetchAppointmentReasons()]);
  } catch (error) {
    appointmentErrorMessage.value =
      error instanceof Error
        ? error.message
        : "Impossible de charger les informations du rendez-vous";
  } finally {
    isLoadingLookups.value = false;
  }
};

const createAppointment = async () => {
  appointmentErrorMessage.value = "";
  appointmentSuccessMessage.value = "";

  if (!canSubmitAppointment.value) {
    appointmentErrorMessage.value = "Tous les champs obligatoires sont requis";
    return;
  }

  const selectedAnimal = userStore.animals.find(
    (animal) => animal.name === selectedAnimalName.value,
  );
  const selectedClinic = clinics.value.find(
    (clinic) => `${clinic.name} - ${clinic.city}` === selectedClinicLabel.value,
  );
  const selectedReason = reasons.value.find(
    (reason) => reason.label === selectedReasonLabel.value,
  );

  if (!selectedAnimal || !selectedClinic || !selectedReason) {
    appointmentErrorMessage.value =
      "Sélection invalide. Veuillez réessayer avec des options valides.";
    return;
  }

  if (!userStore.id) {
    await userStore.fetchMe();
  }

  if (!userStore.id) {
    appointmentErrorMessage.value =
      "Utilisateur non trouvé. Reconnectez-vous puis réessayez.";
    return;
  }

  isSubmittingAppointment.value = true;

  try {
    const config = useRuntimeConfig();

    const response = await fetch(`${config.public.apiUrl}/appointments`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        date: appointmentDate.value,
        time: appointmentTime.value,
        reason_id: selectedReason.id,
        is_completed: false,
        user_id: userStore.id,
        animal_id: selectedAnimal.id,
        clinic_id: selectedClinic.id,
        remark: appointmentRemark.value.trim() || undefined,
      }),
    });

    const result = (await response.json()) as ApiResponse<unknown>;

    if (!response.ok || !result.success) {
      throw new Error(result.error || "Impossible de créer le rendez-vous");
    }

    appointmentSuccessMessage.value = "Rendez-vous créé avec succès";
    resetAppointmentForm();
    close();
  } catch (error) {
    appointmentErrorMessage.value =
      error instanceof Error
        ? error.message
        : "Impossible de créer le rendez-vous";
  } finally {
    isSubmittingAppointment.value = false;
  }
};

onMounted(async () => {
  if (!userStore.id) {
    await userStore.fetchMe();
  }

  await Promise.all([userStore.fetchAnimals(), loadAppointmentFormData()]);

  isReady.value = true;
});

watch(showNewApt, async (isOpen) => {
  if (isOpen) {
    appointmentErrorMessage.value = "";

    if (prefilledDate.value) {
      appointmentDate.value = prefilledDate.value;
    }

    if (clinics.value.length === 0 || reasons.value.length === 0) {
      await loadAppointmentFormData();
    }

    if (userStore.animals.length === 0) {
      await userStore.fetchAnimals();
    }

    await refreshTimeSlots();
    return;
  }

  resetAppointmentForm();
  clearPrefilledDate();
});

watch([selectedClinicLabel, appointmentDate], async () => {
  if (!showNewApt.value) {
    return;
  }

  await refreshTimeSlots();
});
</script>

<template>
  <div>
    <div class="font-alt">
      <div class="relative flex items-center justify-between py-4">
        <NuxtLink to="/" class="absolute left-1/2 -translate-x-1/2 text-2xl">
          <h1>PawTracker</h1>
        </NuxtLink>

        <NuxtLink :to="profileLink">
          <Icon name="solar:user-outline" class="size-8 text-black" />
        </NuxtLink>

        <Icon
          name="solar:calendar-add-outline"
          class="ml-2 size-8 cursor-pointer text-black"
          @click="open"
        />
      </div>

      <ul
        v-if="isReady"
        class="-mx-4 flex items-center gap-2 overflow-x-auto px-4"
      >
        <li
          v-for="animal in userStore.animals"
          :key="animal.id"
          class="shrink-0"
        >
          <NuxtLink
            :to="'/animal/' + animal.id"
            class="flex h-16 w-16 items-center justify-center rounded-full bg-green-300 text-sm font-bold text-black"
          >
            <img
              v-if="animal.image"
              :src="animal.image"
              :alt="animal.name"
              class="h-16 w-16 rounded-full object-cover"
            />

            <span v-else>
              {{ animal.name.charAt(0).toUpperCase() }}
            </span>
          </NuxtLink>
        </li>

        <li class="shrink-0">
          <NuxtLink to="/add-animal">
            <button
              type="button"
              class="bg-grey-500 flex h-14 w-14 cursor-pointer items-center justify-center rounded-full text-sm font-bold text-black"
            >
              <Icon name="material-symbols:add-rounded" class="size-6" />
            </button>
          </NuxtLink>
        </li>
      </ul>
    </div>

    <BasePopup v-model="showNewApt" fit>
      <div class="mx-auto w-[86vw] max-w-[20rem] sm:max-w-sm md:max-w-xl">
        <h2 class="mb-4 text-center font-bold">Prendre un rendez-vous</h2>

        <BaseSelect
          class="mb-4"
          id="animal"
          label="Animal"
          v-model="selectedAnimalName"
          :options="animalOptions"
          :disabled="isLoadingLookups || isSubmittingAppointment"
          addClass="w-full"
        />

        <BaseSelect
          class="mb-4"
          id="reason"
          label="Motif"
          v-model="selectedReasonLabel"
          :options="reasonOptions"
          :disabled="isLoadingLookups || isSubmittingAppointment"
          addClass="w-full"
        />

        <BaseSelect
          class="mb-4"
          id="clinic"
          label="Clinique"
          v-model="selectedClinicLabel"
          :options="clinicOptions"
          :disabled="isLoadingLookups || isSubmittingAppointment"
          addClass="w-full"
        />

        <div class="mb-4">
          <BaseInput v-model="appointmentDate" label="Date" type="date" />

          <div class="mt-3">
            <p
              v-if="isLoadingTimeSlots || availableTimeSlots.length > 0"
              class="mb-2 text-sm"
            >
              Heure
            </p>

            <p v-if="isLoadingTimeSlots" class="text-xs text-gray-500">
              Chargement des créneaux...
            </p>

            <div v-else class="flex flex-wrap gap-2">
              <button
                v-for="slot in availableTimeSlots"
                :key="slot.time"
                type="button"
                :disabled="isSubmittingAppointment"
                class="cursor-pointer rounded-lg px-3 py-1 text-sm font-semibold transition-colors"
                :class="{
                  'bg-green-700 text-white': appointmentTime === slot.time,
                  'bg-green-300 text-black hover:bg-green-500':
                    appointmentTime !== slot.time,
                }"
                @click="selectTimeSlot(slot.time)"
              >
                {{ slot.time }}
              </button>
            </div>
          </div>
        </div>

        <label class="mb-1 block text-center text-sm"
          >Remarque (optionnel)</label
        >
        <textarea
          v-model="appointmentRemark"
          class="input bg-background min-h-24 w-full resize-none rounded-xl! px-4 py-2 text-sm font-normal shadow placeholder:text-gray-400 focus:outline-none"
          rows="3"
          :disabled="isSubmittingAppointment"
        />

        <p
          v-if="appointmentErrorMessage"
          class="mt-2 text-center text-sm text-red-500"
        >
          {{ appointmentErrorMessage }}
        </p>

        <p
          v-if="appointmentSuccessMessage"
          class="mt-2 text-center text-sm text-green-700"
        >
          {{ appointmentSuccessMessage }}
        </p>

        <button
          type="button"
          :disabled="!canSubmitAppointment"
          class="text-background mt-4 flex w-full cursor-pointer items-center justify-center rounded-xl bg-green-700 py-1 font-bold shadow-lg transition-colors hover:bg-green-900"
          :class="{
            'cursor-not-allowed opacity-50': !canSubmitAppointment,
          }"
          @click="createAppointment"
        >
          {{ isSubmittingAppointment ? "Création..." : "Confirmer" }}
        </button>
      </div>
    </BasePopup>
  </div>
</template>
