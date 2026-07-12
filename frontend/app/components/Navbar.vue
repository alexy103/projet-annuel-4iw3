<script setup lang="ts">
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

const userStore = useUserStore();

const showNewApt = ref(false);
const isReady = ref(false);
const isSubmittingAppointment = ref(false);
const isLoadingLookups = ref(false);
const appointmentErrorMessage = ref("");
const appointmentSuccessMessage = ref("");

const clinics = ref<Clinic[]>([]);
const reasons = ref<AppointmentReason[]>([]);

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
  return userStore.userId ? `/profile/${userStore.userId}` : "";
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

  if (!userStore.userId) {
    userStore.loadUserFromStorage();
  }

  if (!userStore.userId) {
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
        user_id: userStore.userId,
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
    showNewApt.value = false;
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
  userStore.loadUserFromStorage();

  await Promise.all([userStore.fetchAnimals(), loadAppointmentFormData()]);

  isReady.value = true;
});

watch(showNewApt, async (isOpen) => {
  if (isOpen) {
    appointmentErrorMessage.value = "";

    if (clinics.value.length === 0 || reasons.value.length === 0) {
      await loadAppointmentFormData();
    }

    if (userStore.animals.length === 0) {
      await userStore.fetchAnimals();
    }
    return;
  }

  resetAppointmentForm();
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
          @click="showNewApt = true"
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
      <div class="w-full max-w-sm">
        <h2 class="mb-4 text-center font-bold">Prendre un rendez-vous</h2>

        <div class="mb-4 flex gap-4">
          <BaseInput v-model="appointmentDate" label="Date" type="date" />
          <BaseInput v-model="appointmentTime" label="Heure" type="time" />
        </div>

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
          id="clinic"
          label="Clinique"
          v-model="selectedClinicLabel"
          :options="clinicOptions"
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
