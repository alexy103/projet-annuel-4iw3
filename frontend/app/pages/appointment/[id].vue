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

type AppointmentDetails = {
  id: number;
  animal: string;
  type: string;
  date: string;
  time: string;
  clinic: string;
  address: string;
  veterinarian: string;
  status: "En attente" | "Terminé";
  notes: string;
};

const route = useRoute();

const appointment = ref<AppointmentDetails | null>(null);
const rawAppointment = ref<ApiAppointment | null>(null);
const isLoading = ref(true);
const isSaving = ref(false);
const errorMessage = ref("");
const saveErrorMessage = ref("");

const isEditing = ref(false);
const editedDate = ref("");
const editedTime = ref("");
const editedRemark = ref("");

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
      status: isFinished ? "Terminé" : "En attente",
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

const canEditAppointment = computed(() => {
  return !isFinishedAppointment.value && !isSaving.value;
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
};

const cancelEditing = () => {
  isEditing.value = false;
  saveErrorMessage.value = "";
};

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
          class="text-background button cursor-default! shadow"
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

            <input
              v-if="isEditing"
              v-model="editedTime"
              type="time"
              class="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 font-bold outline-none focus:border-green-600"
            />

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
      </div>
    </section>

    <section
      v-if="appointment"
      class="mt-6 flex flex-col items-center gap-4 lg:flex-row lg:gap-8"
    >
      <button
        v-if="!isEditing && canEditAppointment"
        class="text-background flex w-full cursor-pointer items-center justify-center rounded-xl bg-green-700 px-4 py-3 font-bold shadow-lg transition-colors hover:bg-green-900"
        @click="startEditing"
      >
        Modifier
      </button>

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
