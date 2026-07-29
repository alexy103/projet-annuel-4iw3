<script setup lang="ts">
type ApiResponse<T> = {
  success: boolean;
  data: T;
  error?: string;
};

type ApiAppointment = {
  id: number;
  date: string;
  time: string;
  reason_id: number;
  is_completed: boolean;
  is_cancelled: boolean;
  user_id: number;
  animal_id: number;
  clinic_id: number;
  remark?: string;
};

type ApiAnimal = {
  id: number;
  name: string;
};

type ApiClinic = {
  id: number;
  name: string;
  address: string;
  city: string;
  postcode: string;
};

type ApiAppointmentReason = {
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

type AppointmentDetails = {
  id: number;
  animal: string;
  type: string;
  date: string;
  time: string;
  clinic: string;
  address: string;
  veterinarian: string;
  status: "En attente" | "Terminé" | "Annulé";
  notes: string;
};

const route = useRoute();

const appointment = ref<AppointmentDetails | null>(null);
const rawAppointment = ref<ApiAppointment | null>(null);
const isLoading = ref(true);
const isSaving = ref(false);
const errorMessage = ref("");
const saveErrorMessage = ref("");
const isCancelling = ref(false);
const cancelErrorMessage = ref("");

const isEditing = ref(false);
const editedDate = ref("");
const editedTime = ref("");
const editedRemark = ref("");
const editTimeSlots = ref<TimeSlot[]>([]);
const isLoadingEditTimeSlots = ref(false);

const availableEditTimeSlots = computed(() => {
  return editTimeSlots.value.filter((slot) => !slot.isFull);
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

const getDatePart = (rawDate: string): string => {
  return rawDate.includes("T") ? (rawDate.split("T")[0] ?? rawDate) : rawDate;
};

const normalizeTimeToHourMinute = (rawTime: string): string => {
  const [hours = "00", minutes = "00"] = rawTime.split(":");
  return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
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

const refreshEditTimeSlots = async () => {
  editTimeSlots.value = [];

  if (!isEditing.value || !rawAppointment.value || !editedDate.value) {
    return;
  }

  isLoadingEditTimeSlots.value = true;

  try {
    const config = useRuntimeConfig();
    const clinicId = rawAppointment.value.clinic_id;
    const selectedDate = getDatePart(editedDate.value);

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
      editTimeSlots.value = [];
      editedTime.value = "";
      return;
    }

    const slotRules = parseSlotRules(availability.slot_rules);
    if (!slotRules) {
      editTimeSlots.value = [];
      editedTime.value = "";
      return;
    }

    const bookedByTime = new Map<string, number>();

    appointmentsResult.data
      .filter((item) => {
        return (
          item.id !== rawAppointment.value?.id &&
          item.clinic_id === clinicId &&
          getDatePart(item.date) === selectedDate
        );
      })
      .forEach((item) => {
        const normalizedTime = normalizeTimeToHourMinute(item.time);
        const count = bookedByTime.get(normalizedTime) ?? 0;
        bookedByTime.set(normalizedTime, count + 1);
      });

    editTimeSlots.value = buildTimeSlots(availability, slotRules, bookedByTime);

    const normalizedEditedTime = normalizeTimeToHourMinute(editedTime.value);
    const exists = editTimeSlots.value.some(
      (slot) => slot.time === normalizedEditedTime,
    );

    if (!exists) {
      editedTime.value = "";
    } else {
      editedTime.value = normalizedEditedTime;
    }
  } catch (error) {
    saveErrorMessage.value =
      error instanceof Error
        ? error.message
        : "Impossible de calculer les créneaux disponibles";
  } finally {
    isLoadingEditTimeSlots.value = false;
  }
};

const formatDateFr = (rawDate: string): string => {
  const datePart = getDatePart(rawDate);
  const [year = 1970, month = 1, day = 1] = datePart.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

const formatTimeFr = (rawTime: string): string => {
  const [hours = "00", minutes = "00"] = rawTime.split(":");
  return `${hours}h${minutes}`;
};

const buildAppointmentDateTime = (rawDate: string, rawTime: string): Date => {
  const datePart = getDatePart(rawDate);
  const [year = 1970, month = 1, day = 1] = datePart.split("-").map(Number);
  const [hours = 0, minutes = 0] = rawTime.split(":").map(Number);

  return new Date(year, month - 1, day, hours, minutes);
};

const fetchAppointmentDetails = async () => {
  errorMessage.value = "";
  saveErrorMessage.value = "";
  isLoading.value = true;

  try {
    const appointmentId = Number(route.params.id);
    if (!Number.isInteger(appointmentId) || appointmentId <= 0) {
      throw new Error("Identifiant de rendez-vous invalide");
    }

    const config = useRuntimeConfig();

    const appointmentResponse = await fetch(
      `${config.public.apiUrl}/appointments/${appointmentId}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      },
    );

    const appointmentResult =
      (await appointmentResponse.json()) as ApiResponse<ApiAppointment>;

    if (!appointmentResponse.ok || !appointmentResult.success) {
      throw new Error(
        appointmentResult.error || "Impossible de charger le rendez-vous",
      );
    }

    const appointmentData = appointmentResult.data;
    rawAppointment.value = appointmentData;

    const [animalResult, clinicResult, reasonResult] = await Promise.allSettled(
      [
        fetch(`${config.public.apiUrl}/animals/${appointmentData.animal_id}`, {
          method: "GET",
          headers: getAuthHeaders(),
        }),
        fetch(`${config.public.apiUrl}/clinics/${appointmentData.clinic_id}`, {
          method: "GET",
          headers: getAuthHeaders(),
        }),
        fetch(
          `${config.public.apiUrl}/appointment-reasons/${appointmentData.reason_id}`,
          {
            method: "GET",
            headers: getAuthHeaders(),
          },
        ),
      ],
    );

    let animalName = `Animal #${appointmentData.animal_id}`;
    if (animalResult.status === "fulfilled") {
      const animalJson =
        (await animalResult.value.json()) as ApiResponse<ApiAnimal>;
      if (animalResult.value.ok && animalJson.success) {
        animalName = animalJson.data.name;
      }
    }

    let clinicName = `Clinique #${appointmentData.clinic_id}`;
    let clinicAddress = "Adresse non disponible";
    if (clinicResult.status === "fulfilled") {
      const clinicJson =
        (await clinicResult.value.json()) as ApiResponse<ApiClinic>;
      if (clinicResult.value.ok && clinicJson.success) {
        clinicName = clinicJson.data.name;
        clinicAddress = `${clinicJson.data.address}, ${clinicJson.data.postcode} ${clinicJson.data.city}`;
      }
    }

    let reasonLabel = `Motif #${appointmentData.reason_id}`;
    if (reasonResult.status === "fulfilled") {
      const reasonJson =
        (await reasonResult.value.json()) as ApiResponse<ApiAppointmentReason>;
      if (reasonResult.value.ok && reasonJson.success) {
        reasonLabel = reasonJson.data.label;
      }
    }

    const startsAt = buildAppointmentDateTime(
      appointmentData.date,
      appointmentData.time,
    );
    const isFinished =
      appointmentData.is_completed || startsAt.getTime() < new Date().getTime();

    appointment.value = {
      id: appointmentData.id,
      animal: animalName,
      type: reasonLabel,
      date: formatDateFr(appointmentData.date),
      time: formatTimeFr(appointmentData.time),
      clinic: clinicName,
      address: clinicAddress,
      veterinarian: "Non renseigné",
      status: appointmentData.is_cancelled
        ? "Annulé"
        : isFinished
          ? "Terminé"
          : "En attente",
      notes: appointmentData.remark || "",
    };

    isEditing.value = false;
  } catch (error) {
    errorMessage.value =
      error instanceof Error
        ? error.message
        : "Impossible de charger le rendez-vous";
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  await fetchAppointmentDetails();
});

const isFinishedAppointment = computed(() => {
  if (!appointment.value) {
    return false;
  }

  return appointment.value.status === "Terminé";
});

const isCancelledAppointment = computed(() => {
  return appointment.value?.status === "Annulé";
});

const canEditAppointment = computed(() => {
  return (
    !isFinishedAppointment.value &&
    !isCancelledAppointment.value &&
    !isSaving.value
  );
});

const canCancelAppointment = computed(() => {
  return (
    !isFinishedAppointment.value &&
    !isCancelledAppointment.value &&
    !isCancelling.value
  );
});

const appointmentStatus = computed(() => {
  if (!appointment.value) {
    return "En attente";
  }

  if (isFinishedAppointment.value) {
    return "Terminé";
  }

  return appointment.value.status;
});

const appointmentStatusClass = computed(() => {
  if (appointmentStatus.value === "Terminé") {
    return "bg-gray-400";
  }

  if (appointmentStatus.value === "Annulé") {
    return "bg-red-500";
  }

  if (appointmentStatus.value === "En attente") {
    return "bg-blue-500";
  }

  return "bg-green-500";
});

const startEditing = () => {
  if (!canEditAppointment.value || !rawAppointment.value) {
    return;
  }

  editedDate.value = getDatePart(rawAppointment.value.date);
  editedTime.value = rawAppointment.value.time.slice(0, 5);
  editedRemark.value = rawAppointment.value.remark || "";
  saveErrorMessage.value = "";
  isEditing.value = true;

  void refreshEditTimeSlots();
};

const cancelEditing = () => {
  isEditing.value = false;
  saveErrorMessage.value = "";
  editTimeSlots.value = [];
};

watch(editedDate, async () => {
  if (!isEditing.value) {
    return;
  }

  await refreshEditTimeSlots();
});

const saveAppointment = async () => {
  if (!rawAppointment.value) {
    return;
  }

  if (!editedDate.value || !editedTime.value) {
    saveErrorMessage.value = "Date et heure sont obligatoires";
    return;
  }

  isSaving.value = true;
  saveErrorMessage.value = "";

  try {
    const config = useRuntimeConfig();

    const payload: {
      date: string;
      time: string;
      remark?: string;
    } = {
      date: editedDate.value,
      time: editedTime.value,
    };

    const trimmedRemark = editedRemark.value.trim();
    if (trimmedRemark.length > 0) {
      payload.remark = trimmedRemark;
    }

    const response = await fetch(
      `${config.public.apiUrl}/appointments/${rawAppointment.value.id}`,
      {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      },
    );

    const result = (await response.json()) as ApiResponse<ApiAppointment>;

    if (!response.ok || !result.success) {
      throw new Error(result.error || "Impossible de modifier le rendez-vous");
    }

    await fetchAppointmentDetails();
  } catch (error) {
    saveErrorMessage.value =
      error instanceof Error
        ? error.message
        : "Impossible de modifier le rendez-vous";
  } finally {
    isSaving.value = false;
  }
};

const cancelAppointment = async () => {
  if (!rawAppointment.value || !canCancelAppointment.value) {
    return;
  }

  isCancelling.value = true;
  cancelErrorMessage.value = "";

  try {
    const config = useRuntimeConfig();
    const response = await fetch(
      `${config.public.apiUrl}/appointments/${rawAppointment.value.id}/cancelled`,
      {
        method: "PATCH",
        headers: getAuthHeaders(),
      },
    );

    const result = (await response.json()) as ApiResponse<ApiAppointment>;

    if (!response.ok || !result.success) {
      throw new Error(result.error || "Impossible d'annuler le rendez-vous");
    }

    await fetchAppointmentDetails();
  } catch (error) {
    cancelErrorMessage.value =
      error instanceof Error
        ? error.message
        : "Impossible d'annuler le rendez-vous";
  } finally {
    isCancelling.value = false;
  }
};
</script>

<template>
  <main class="min-h-screen bg-white px-4 py-6">
    <NuxtLink
      to="/calendar"
      class="mb-6 inline-flex items-center gap-2 font-bold"
    >
      <Icon name="material-symbols:arrow-back-rounded" class="size-6" />
    </NuxtLink>

    <div v-if="isLoading" class="flex justify-center py-8">
      <Icon
        name="eos-icons:loading"
        class="text-grey-500 size-10 animate-spin"
      />
    </div>

    <div v-else-if="errorMessage" class="py-4">
      <p class="text-center text-red-600">{{ errorMessage }}</p>
    </div>

    <section v-else-if="appointment" class="rounded-2xl bg-green-300 p-5">
      <div class="mb-6 flex items-start justify-between gap-4">
        <div>
          <p class="text-sm font-bold text-green-900 uppercase">Rendez-vous</p>
          <h1 class="text-2xl font-bold">
            {{ appointment.type }}
          </h1>
        </div>

        <span
          class="text-background button cursor-default! whitespace-nowrap shadow"
          :class="appointmentStatusClass"
        >
          {{ appointmentStatus }}
        </span>
      </div>

      <div class="space-y-4">
        <div class="rounded-xl bg-white p-4">
          <p class="text-sm text-gray-500">Animal</p>
          <p class="text-lg font-bold">{{ appointment.animal }}</p>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="rounded-xl bg-white p-4">
            <p class="text-sm text-gray-500">Date</p>

            <input
              v-if="isEditing"
              v-model="editedDate"
              type="date"
              class="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 font-bold outline-none focus:border-green-600"
            />

            <p v-else class="font-bold">{{ appointment.date }}</p>
          </div>

          <div class="rounded-xl bg-white p-4">
            <p class="text-sm text-gray-500">Heure</p>

            <div v-if="isEditing" class="mt-1">
              <p v-if="isLoadingEditTimeSlots" class="text-sm text-gray-500">
                Chargement des créneaux...
              </p>

              <div v-else class="flex flex-wrap gap-2">
                <button
                  v-for="slot in availableEditTimeSlots"
                  :key="slot.time"
                  type="button"
                  :disabled="isSaving"
                  class="cursor-pointer rounded-lg px-3 py-1 text-sm font-semibold transition-colors"
                  :class="{
                    'bg-green-700 text-white': editedTime === slot.time,
                    'bg-green-300 text-black hover:bg-green-500':
                      editedTime !== slot.time,
                  }"
                  @click="editedTime = slot.time"
                >
                  {{ slot.time }}
                </button>
              </div>
            </div>

            <p v-else class="font-bold">{{ appointment.time }}</p>
          </div>
        </div>

        <div class="rounded-xl bg-white p-4">
          <p class="text-sm text-gray-500">Clinique</p>
          <p class="font-bold">{{ appointment.clinic }}</p>
          <p class="mt-1 text-sm">{{ appointment.address }}</p>
        </div>

        <div class="rounded-xl bg-white p-4">
          <p class="text-sm text-gray-500">Vétérinaire</p>
          <p class="font-bold">{{ appointment.veterinarian }}</p>
        </div>

        <div class="rounded-xl bg-white p-4">
          <p class="text-sm text-gray-500">Remarque</p>

          <textarea
            v-if="isEditing"
            v-model="editedRemark"
            rows="3"
            class="mt-1 min-h-20 w-full resize-none rounded-lg border border-gray-200 px-3 py-2 font-bold outline-none focus:border-green-600"
          />

          <p v-else class="font-bold">
            {{ appointment.notes || "Aucune remarque" }}
          </p>
        </div>

        <p v-if="saveErrorMessage" class="text-center text-sm text-red-600">
          {{ saveErrorMessage }}
        </p>
        <p v-if="cancelErrorMessage" class="text-center text-sm text-red-600">
          {{ cancelErrorMessage }}
        </p>
      </div>
    </section>

    <section
      v-if="appointment"
      class="mt-6 flex flex-col items-center gap-4 lg:flex-row lg:gap-8"
    >
      <div v-if="!isEditing && canEditAppointment" class="flex w-full gap-3">
        <button
          class="text-background flex basis-2/3 cursor-pointer items-center justify-center rounded-xl bg-green-700 px-4 py-3 font-bold shadow-lg transition-colors hover:bg-green-900"
          @click="startEditing"
        >
          Modifier
        </button>
        <button
          :disabled="isCancelling"
          class="flex basis-1/3 cursor-pointer items-center justify-center rounded-xl bg-red-500 px-4 py-3 font-bold text-white shadow-lg transition-colors hover:bg-red-600"
          :class="{ 'cursor-not-allowed opacity-50': isCancelling }"
          @click="cancelAppointment"
        >
          {{ isCancelling ? "Annulation..." : "Annuler" }}
        </button>
      </div>

      <div v-else-if="isEditing" class="flex w-full gap-3">
        <button
          class="text-background flex basis-2/3 cursor-pointer items-center justify-center rounded-xl bg-green-700 px-4 py-3 font-bold shadow-lg transition-colors hover:bg-green-900"
          :disabled="isSaving"
          :class="{ 'cursor-not-allowed opacity-50': isSaving }"
          @click="saveAppointment"
        >
          {{ isSaving ? "Enregistrement..." : "Enregistrer" }}
        </button>

        <button
          class="flex basis-1/3 cursor-pointer items-center justify-center rounded-xl bg-gray-100 px-4 py-3 font-bold shadow-lg transition-colors hover:bg-gray-200"
          :disabled="isSaving"
          :class="{ 'cursor-not-allowed opacity-50': isSaving }"
          @click="cancelEditing"
        >
          Retour
        </button>
      </div>
    </section>
  </main>
</template>
