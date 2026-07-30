<script setup lang="ts">
type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

type Animal = {
  id: number;
  user_id: number;
  name: string;
  breed: string;
  birth_date: string;
  adoption_date: string;
  sex: string;
  species_id: number;
  color?: string | null;
  is_sterilized?: boolean;
  allergies?: string | null;
  is_shared?: boolean;
  is_deceased?: boolean;
  microship_id?: string | null;
  profile_picture?: string | null;
};

type Species = {
  id: number;
  name: string;
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
};

type ApiClinic = {
  id: number;
  name: string;
};

type ApiAppointmentReason = {
  id: number;
  label: string;
};

type ApiTreatment = {
  id: number;
  date: string;
  note?: string | null;
  quantity?: number | null;
  treatment_type_id: number;
  medicine_id?: number | null;
  animal_id: number;
};

type ApiTreatmentType = {
  id: number;
  user_id: number;
  name: string;
};

type ApiReminderFrequency = {
  id: number;
  frequency: string;
};

type ApiTreatmentReminder = {
  treatment_id: number;
  reminder_frequency_id: number;
  amount: number;
};

type TreatmentCard = {
  id: number;
  typeName: string;
  date: string;
  note: string;
  quantityText: string;
  frequencyText: string;
};

type UpcomingAppointmentCard = {
  id: number;
  animal: string;
  type: string;
  date: string;
  time: string;
  clinic: string;
  isToday: boolean;
};

const config = useRuntimeConfig();
const route = useRoute();
const router = useRouter();

const showInfo = ref(false);
const showQr = ref(false);
const showEdit = ref(false);
const showNewMeasurement = ref(false);
const showNewTreatment = ref(false);

const animal = ref<Animal | null>(null);
const species = ref<Species[]>([]);

const isLoading = ref(true);
const isSubmitting = ref(false);
const errorMessage = ref("");
const newMeasurementError = ref("");

const editName = ref("");
const editSpecies = ref("");
const editBreed = ref("");
const editBirth = ref("");
const editAdoption = ref("");
const editPicture = ref<File | null>(null);

const getTodayDateInputValue = () => {
  const now = new Date();
  const timezoneOffsetInMs = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - timezoneOffsetInMs)
    .toISOString()
    .slice(0, 10);
};

const newMeasurementDate = ref(getTodayDateInputValue());
const newMeasurementWeight = ref<number | null>(null);
const newMeasurementSize = ref<number | null>(null);
const healthDataRefreshKey = ref(0);
const isLoadingAppointments = ref(false);
const appointmentsErrorMessage = ref("");
const appointments = ref<ApiAppointment[]>([]);
const clinics = ref<ApiClinic[]>([]);
const appointmentReasons = ref<ApiAppointmentReason[]>([]);
const evolutionType = ref<"weight" | "size">("weight");
const treatments = ref<ApiTreatment[]>([]);
const treatmentTypes = ref<ApiTreatmentType[]>([]);
const reminderFrequencies = ref<ApiReminderFrequency[]>([]);
const treatmentRemindersByTreatmentId = ref<
  Record<number, ApiTreatmentReminder[]>
>({});
const isLoadingTreatments = ref(false);
const treatmentsErrorMessage = ref("");
const newTreatmentError = ref("");

const newTreatmentDate = ref(getTodayDateInputValue());
const newTreatmentTypeId = ref<number | null>(null);
const newTreatmentFrequencyId = ref<number | null>(null);
const newTreatmentFrequencyAmount = ref<number>(1);
const newTreatmentQuantity = ref<number | null>(null);
const newTreatmentNote = ref("");

const animalId = computed(() => {
  const param = route.params.animalId || route.params.id;
  return Array.isArray(param) ? param[0] : param;
});

const currentUserId = computed<number | null>(() => {
  if (!import.meta.client) {
    return null;
  }

  const rawUserId = localStorage.getItem("userId");
  const parsedUserId = Number(rawUserId);

  if (!Number.isInteger(parsedUserId) || parsedUserId <= 0) {
    return null;
  }

  return parsedUserId;
});

const currentRoleId = computed<number | null>(() => {
  if (!import.meta.client) {
    return null;
  }

  const rawRoleId = localStorage.getItem("roleId");
  const parsedRoleId = Number(rawRoleId);

  if (!Number.isInteger(parsedRoleId) || parsedRoleId <= 0) {
    return null;
  }

  return parsedRoleId;
});

const isAdmin = computed(() => currentRoleId.value === 1);

const isAnimalOwner = computed(() => {
  if (!animal.value || currentUserId.value === null) {
    return false;
  }

  return animal.value.user_id === currentUserId.value;
});

const canEditAnimal = computed(() => isAdmin.value || isAnimalOwner.value);

const parsedAnimalId = computed<number | null>(() => {
  const value = Number(animalId.value);

  if (!Number.isInteger(value) || value <= 0) {
    return null;
  }

  return value;
});

const authHeaders = computed(() => {
  const headers: Record<string, string> = {
    "x-api-key": config.public.apiKey,
  };

  if (import.meta.client) {
    const accessToken = localStorage.getItem("accessToken");

    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }
  }

  return headers;
});

const animalPictureUrl = computed(() => {
  const path = animal.value?.profile_picture;

  if (!path) {
    return "/kyky.jpg";
  }

  if (path.startsWith("http")) {
    return path;
  }

  return `${config.public.backendUrl}${path}`;
});

const qrValue = computed(() => {
  if (import.meta.client) {
    return window.location.href;
  }

  return "";
});

const animalAge = computed(() => {
  if (!animal.value?.birth_date) {
    return "";
  }

  const birthDate = new Date(animal.value.birth_date);
  const today = new Date();

  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();

  if (today.getDate() < birthDate.getDate()) {
    months--;
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  if (years <= 0) {
    return `${months} mois`;
  }

  if (months <= 0) {
    return `${years} an${years > 1 ? "s" : ""}`;
  }

  return `${years} an${years > 1 ? "s" : ""} et ${months} mois`;
});

const sexIcon = computed(() => {
  if (animal.value?.sex === "female") {
    return "material-symbols:female";
  }

  return "material-symbols:male";
});

const sexIconClass = computed(() => {
  if (animal.value?.sex === "female") {
    return "size-6 text-pink-700";
  }

  return "size-6 text-blue-700";
});

const isAnimalShared = computed(() => Boolean(animal.value?.is_shared));

const formatDate = (date?: string) => {
  if (!date) {
    return "";
  }

  return new Date(date).toLocaleDateString("fr-FR");
};

const getDatePart = (rawDate: string): string => {
  return rawDate.includes("T") ? (rawDate.split("T")[0] ?? rawDate) : rawDate;
};

const buildAppointmentDateTime = (rawDate: string, rawTime: string): Date => {
  const [year = 1970, month = 1, day = 1] = getDatePart(rawDate)
    .split("-")
    .map(Number);
  const [hours = 0, minutes = 0] = rawTime.split(":").map(Number);

  return new Date(year, month - 1, day, hours, minutes);
};

const isSameDay = (a: Date, b: Date): boolean => {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
};

const formatDateFr = (rawDate: string): string => {
  const [year = 1970, month = 1, day = 1] = getDatePart(rawDate)
    .split("-")
    .map(Number);

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
};

const formatTimeFr = (rawTime: string): string => {
  const [hours = "00", minutes = "00"] = rawTime.split(":");
  return `${hours}h${minutes}`;
};

const formatReminderFrequencyText = (
  amount: number,
  frequencyLabel: string,
): string => {
  switch (frequencyLabel) {
    case "Jour(s)":
      return amount === 1 ? "Tous les jours" : `Tous les ${amount} jours`;
    case "Semaine(s)":
      return amount === 1
        ? "Toutes les semaines"
        : `Toutes les ${amount} semaines`;
    case "Mois":
      return amount === 1 ? "Tous les mois" : `Tous les ${amount} mois`;
    case "An(s)":
      return amount === 1 ? "Tous les ans" : `Tous les ${amount} ans`;
    default:
      return amount === 1
        ? `Tous les ${frequencyLabel}`
        : `Tous les ${amount} ${frequencyLabel}`;
  }
};

const upcomingAppointments = computed<UpcomingAppointmentCard[]>(() => {
  if (!parsedAnimalId.value) {
    return [];
  }

  const now = new Date();
  const reasonsById = new Map(
    appointmentReasons.value.map((reason) => [reason.id, reason.label]),
  );
  const clinicsById = new Map(
    clinics.value.map((clinic) => [clinic.id, clinic.name]),
  );

  return appointments.value
    .filter((appointment) => {
      return (
        appointment.animal_id === parsedAnimalId.value &&
        !appointment.is_completed
      );
    })
    .map((appointment) => {
      const startsAt = buildAppointmentDateTime(
        appointment.date,
        appointment.time,
      );

      return {
        appointment,
        startsAt,
      };
    })
    .filter(({ startsAt }) => startsAt.getTime() >= now.getTime())
    .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime())
    .slice(0, 10)
    .map(({ appointment, startsAt }) => ({
      id: appointment.id,
      animal: animal.value?.name ?? `Animal #${appointment.animal_id}`,
      type:
        reasonsById.get(appointment.reason_id) ??
        `Motif #${appointment.reason_id}`,
      date: formatDateFr(appointment.date),
      time: formatTimeFr(appointment.time),
      clinic:
        clinicsById.get(appointment.clinic_id) ??
        `Clinique #${appointment.clinic_id}`,
      isToday: isSameDay(startsAt, now),
    }));
});

const treatmentTypeOptions = computed(() => {
  return treatmentTypes.value.map((type) => ({
    value: String(type.id),
    label: type.name,
  }));
});

const reminderFrequencyOptions = computed(() => {
  return reminderFrequencies.value.map((frequency) => ({
    value: String(frequency.id),
    label: frequency.frequency,
  }));
});

const treatmentCards = computed<TreatmentCard[]>(() => {
  const treatmentTypesById = new Map(
    treatmentTypes.value.map((type) => [type.id, type.name]),
  );
  const frequenciesById = new Map(
    reminderFrequencies.value.map((frequency) => [
      frequency.id,
      frequency.frequency,
    ]),
  );

  return treatments.value
    .map((treatment) => {
      const reminders =
        treatmentRemindersByTreatmentId.value[treatment.id] ?? [];
      const frequencyText =
        reminders.length > 0
          ? reminders
              .map((reminder) => {
                const frequencyLabel =
                  frequenciesById.get(reminder.reminder_frequency_id) ??
                  `Frequence #${reminder.reminder_frequency_id}`;
                return formatReminderFrequencyText(
                  reminder.amount,
                  frequencyLabel,
                );
              })
              .join(" • ")
          : "";

      return {
        id: treatment.id,
        typeName:
          treatmentTypesById.get(treatment.treatment_type_id) ??
          `Type #${treatment.treatment_type_id}`,
        date: formatDateFr(treatment.date),
        note: treatment.note?.trim() || "",
        quantityText:
          treatment.quantity && treatment.quantity > 0
            ? `${treatment.quantity}`
            : "",
        frequencyText,
      };
    })
    .sort((a, b) => {
      const dateA = a.date.split("/").reverse().join("-");
      const dateB = b.date.split("/").reverse().join("-");
      return dateB.localeCompare(dateA);
    });
});

const getApiErrorMessage = (error: unknown, fallbackMessage: string) => {
  if (
    typeof error === "object" &&
    error !== null &&
    "data" in error &&
    typeof (error as { data?: unknown }).data === "object" &&
    (error as { data?: unknown }).data !== null &&
    "error" in
      ((error as { data?: unknown }).data as Record<string, unknown>) &&
    typeof ((error as { data?: unknown }).data as Record<string, unknown>)
      .error === "string"
  ) {
    return ((error as { data?: unknown }).data as { error: string }).error;
  }

  return fallbackMessage;
};

const fetchCurrentAnimal = async () => {
  if (!animalId.value) {
    errorMessage.value = "Animal introuvable.";
    return;
  }

  try {
    const response = await $fetch<ApiResponse<Animal>>(
      `${config.public.apiUrl}/animals/${animalId.value}`,
      {
        headers: authHeaders.value,
      },
    );

    animal.value = response.data;

    editName.value = response.data.name;
    editSpecies.value = String(response.data.species_id);
    editBreed.value = response.data.breed;
    editBirth.value = response.data.birth_date.slice(0, 10);
    editAdoption.value = response.data.adoption_date.slice(0, 10);
  } catch (error) {
    console.error(error);
    errorMessage.value = "Impossible de charger cet animal.";
  }
};

const fetchSpecies = async () => {
  try {
    const response = await $fetch<ApiResponse<Species[]>>(
      `${config.public.apiUrl}/species`,
      {
        headers: authHeaders.value,
      },
    );

    species.value = response.data;
  } catch (error) {
    console.error(error);
    errorMessage.value = "Impossible de charger les espèces.";
  }
};

const fetchAppointmentsData = async () => {
  appointmentsErrorMessage.value = "";
  isLoadingAppointments.value = true;

  try {
    const [appointmentsResponse, clinicsResponse, reasonsResponse] =
      await Promise.all([
        fetch(`${config.public.apiUrl}/appointments`, {
          method: "GET",
          headers: {
            ...authHeaders.value,
            "Content-Type": "application/json",
          },
        }),
        fetch(`${config.public.apiUrl}/clinics`, {
          method: "GET",
          headers: {
            ...authHeaders.value,
            "Content-Type": "application/json",
          },
        }),
        fetch(`${config.public.apiUrl}/appointment-reasons`, {
          method: "GET",
          headers: {
            ...authHeaders.value,
            "Content-Type": "application/json",
          },
        }),
      ]);

    const appointmentsResult =
      (await appointmentsResponse.json()) as ApiResponse<ApiAppointment[]>;
    const clinicsResult = (await clinicsResponse.json()) as ApiResponse<
      ApiClinic[]
    >;
    const reasonsResult = (await reasonsResponse.json()) as ApiResponse<
      ApiAppointmentReason[]
    >;

    if (!appointmentsResponse.ok || !appointmentsResult.success) {
      throw new Error(
        appointmentsResult.message ||
          "Impossible de charger les rendez-vous de cet animal.",
      );
    }

    if (!clinicsResponse.ok || !clinicsResult.success) {
      throw new Error(
        clinicsResult.message || "Impossible de charger les cliniques.",
      );
    }

    if (!reasonsResponse.ok || !reasonsResult.success) {
      throw new Error(
        reasonsResult.message || "Impossible de charger les motifs.",
      );
    }

    appointments.value = appointmentsResult.data;
    clinics.value = clinicsResult.data;
    appointmentReasons.value = reasonsResult.data;
  } catch (error) {
    appointmentsErrorMessage.value = getApiErrorMessage(
      error,
      "Impossible de charger les rendez-vous.",
    );
  } finally {
    isLoadingAppointments.value = false;
  }
};

const fetchTreatmentsData = async () => {
  if (!parsedAnimalId.value) {
    treatments.value = [];
    treatmentTypes.value = [];
    reminderFrequencies.value = [];
    treatmentRemindersByTreatmentId.value = {};
    return;
  }

  treatmentsErrorMessage.value = "";
  isLoadingTreatments.value = true;

  try {
    const [treatmentsResponse, treatmentTypesResponse, frequenciesResponse] =
      await Promise.all([
        fetch(
          `${config.public.apiUrl}/treatments/animal/${parsedAnimalId.value}`,
          {
            method: "GET",
            headers: {
              ...authHeaders.value,
              "Content-Type": "application/json",
            },
          },
        ),
        fetch(`${config.public.apiUrl}/treatment-types`, {
          method: "GET",
          headers: {
            ...authHeaders.value,
            "Content-Type": "application/json",
          },
        }),
        fetch(`${config.public.apiUrl}/reminder-frequencies`, {
          method: "GET",
          headers: {
            ...authHeaders.value,
            "Content-Type": "application/json",
          },
        }),
      ]);

    const treatmentsResult = (await treatmentsResponse.json()) as ApiResponse<
      ApiTreatment[]
    >;
    const treatmentTypesResult =
      (await treatmentTypesResponse.json()) as ApiResponse<ApiTreatmentType[]>;
    const frequenciesResult = (await frequenciesResponse.json()) as ApiResponse<
      ApiReminderFrequency[]
    >;

    if (!treatmentsResponse.ok || !treatmentsResult.success) {
      throw new Error(
        treatmentsResult.message || "Impossible de charger les traitements.",
      );
    }

    if (!treatmentTypesResponse.ok || !treatmentTypesResult.success) {
      throw new Error(
        treatmentTypesResult.message ||
          "Impossible de charger les types de traitement.",
      );
    }

    if (!frequenciesResponse.ok || !frequenciesResult.success) {
      throw new Error(
        frequenciesResult.message ||
          "Impossible de charger les frequences de rappel.",
      );
    }

    treatments.value = treatmentsResult.data;
    treatmentTypes.value = treatmentTypesResult.data;
    reminderFrequencies.value = frequenciesResult.data;

    const remindersEntries = await Promise.all(
      treatmentsResult.data.map(async (treatment) => {
        const response = await fetch(
          `${config.public.apiUrl}/treatment-reminders/treatment/${treatment.id}`,
          {
            method: "GET",
            headers: {
              ...authHeaders.value,
              "Content-Type": "application/json",
            },
          },
        );

        const result = (await response.json()) as ApiResponse<
          ApiTreatmentReminder[]
        >;

        if (!response.ok || !result.success) {
          throw new Error(
            result.message ||
              `Impossible de charger les rappels du traitement #${treatment.id}.`,
          );
        }

        return [treatment.id, result.data] as const;
      }),
    );

    treatmentRemindersByTreatmentId.value =
      Object.fromEntries(remindersEntries);
  } catch (error) {
    treatmentsErrorMessage.value = getApiErrorMessage(
      error,
      "Impossible de charger les traitements.",
    );
  } finally {
    isLoadingTreatments.value = false;
  }
};

const submitNewTreatment = async () => {
  if (!canEditAnimal.value) {
    newTreatmentError.value =
      "Seul le proprietaire ou un admin peut modifier cet animal.";
    return;
  }

  if (!parsedAnimalId.value) {
    newTreatmentError.value = "Animal introuvable.";
    return;
  }

  if (!newTreatmentDate.value || !newTreatmentTypeId.value) {
    newTreatmentError.value =
      "La date et le type de traitement sont obligatoires.";
    return;
  }

  if (
    newTreatmentQuantity.value !== null &&
    (!Number.isInteger(newTreatmentQuantity.value) ||
      newTreatmentQuantity.value <= 0)
  ) {
    newTreatmentError.value =
      "La quantité doit être un entier strictement positif.";
    return;
  }

  if (
    newTreatmentFrequencyId.value !== null &&
    (!Number.isInteger(newTreatmentFrequencyAmount.value) ||
      newTreatmentFrequencyAmount.value < 1 ||
      newTreatmentFrequencyAmount.value > 20)
  ) {
    newTreatmentError.value =
      "Le nombre pour la frequence doit etre un entier entre 1 et 20.";
    return;
  }

  try {
    isSubmitting.value = true;
    newTreatmentError.value = "";

    const body: {
      date: string;
      treatment_type_id: number;
      animal_id: number;
      quantity?: number;
      note?: string;
    } = {
      date: newTreatmentDate.value,
      treatment_type_id: newTreatmentTypeId.value,
      animal_id: parsedAnimalId.value,
    };

    if (newTreatmentQuantity.value !== null) {
      body.quantity = newTreatmentQuantity.value;
    }

    const trimmedNote = newTreatmentNote.value.trim();
    if (trimmedNote.length > 0) {
      body.note = trimmedNote;
    }

    const createdTreatmentResponse = await $fetch<ApiResponse<ApiTreatment>>(
      `${config.public.apiUrl}/treatments`,
      {
        method: "POST",
        headers: {
          ...authHeaders.value,
          "Content-Type": "application/json",
        },
        body,
      },
    );

    if (newTreatmentFrequencyId.value !== null) {
      await $fetch(`${config.public.apiUrl}/treatment-reminders`, {
        method: "POST",
        headers: {
          ...authHeaders.value,
          "Content-Type": "application/json",
        },
        body: {
          treatment_id: createdTreatmentResponse.data.id,
          reminder_frequency_id: newTreatmentFrequencyId.value,
          amount: newTreatmentFrequencyAmount.value,
        },
      });
    }

    await fetchTreatmentsData();

    showNewTreatment.value = false;
    newTreatmentDate.value = getTodayDateInputValue();
    newTreatmentTypeId.value = null;
    newTreatmentFrequencyId.value = null;
    newTreatmentFrequencyAmount.value = 1;
    newTreatmentQuantity.value = null;
    newTreatmentNote.value = "";
  } catch (error) {
    console.error(error);
    newTreatmentError.value = getApiErrorMessage(
      error,
      "Impossible d'enregistrer le traitement.",
    );
  } finally {
    isSubmitting.value = false;
  }
};

const submitEdit = async () => {
  if (!canEditAnimal.value) {
    errorMessage.value =
      "Seul le proprietaire ou un admin peut modifier cet animal.";
    return;
  }

  if (!animal.value || !animalId.value) {
    return;
  }

  try {
    isSubmitting.value = true;
    errorMessage.value = "";

    await $fetch(`${config.public.apiUrl}/animals/${animalId.value}`, {
      method: "PUT",
      headers: {
        ...authHeaders.value,
        "Content-Type": "application/json",
      },
      body: {
        name: editName.value,
        breed: editBreed.value,
        birth_date: editBirth.value,
        adoption_date: editAdoption.value,
        sex: animal.value.sex,
        species_id: Number(editSpecies.value),
        color: animal.value.color,
        is_sterilized: animal.value.is_sterilized,
        allergies: animal.value.allergies,
        is_shared: animal.value.is_shared,
        is_deceased: animal.value.is_deceased,
        microship_id: animal.value.microship_id,
      },
    });

    if (editPicture.value) {
      const formData = new FormData();

      formData.append("profile_picture", editPicture.value);

      await $fetch(
        `${config.public.apiUrl}/animals/${animalId.value}/profile-picture`,
        {
          method: "PATCH",
          headers: authHeaders.value,
          body: formData,
        },
      );
    }

    await fetchCurrentAnimal();

    editPicture.value = null;
    showEdit.value = false;
  } catch (error) {
    console.error(error);
    errorMessage.value = "Impossible de modifier cet animal.";
  } finally {
    isSubmitting.value = false;
  }
};

const toggleAnimalShared = async () => {
  if (!canEditAnimal.value) {
    errorMessage.value =
      "Seul le proprietaire ou un admin peut modifier cet animal.";
    return;
  }

  if (!animal.value || !animalId.value) {
    return;
  }

  const nextIsShared = !Boolean(animal.value.is_shared);

  try {
    isSubmitting.value = true;
    errorMessage.value = "";

    await $fetch(`${config.public.apiUrl}/animals/${animalId.value}/shared`, {
      method: "PATCH",
      headers: {
        ...authHeaders.value,
        "Content-Type": "application/json",
      },
      body: {
        isShared: nextIsShared,
      },
    });

    animal.value = {
      ...animal.value,
      is_shared: nextIsShared,
    };

    if (!nextIsShared) {
      showQr.value = false;
    }
  } catch (error) {
    console.error(error);
    errorMessage.value = "Impossible de modifier le partage de cet animal.";
  } finally {
    isSubmitting.value = false;
  }
};

const deleteAnimal = async () => {
  if (!canEditAnimal.value) {
    errorMessage.value =
      "Seul le proprietaire ou un admin peut modifier cet animal.";
    return;
  }

  if (!animalId.value) {
    return;
  }

  if (import.meta.client) {
    const confirmed = window.confirm(
      "Es-tu sûr de vouloir supprimer cet animal ? Cette action est irréversible.",
    );

    if (!confirmed) {
      return;
    }
  }

  try {
    isSubmitting.value = true;
    errorMessage.value = "";

    await $fetch(`${config.public.apiUrl}/animals/${animalId.value}`, {
      method: "DELETE",
      headers: authHeaders.value,
    });

    await router.push("/");
  } catch (error) {
    console.error(error);
    errorMessage.value = getApiErrorMessage(
      error,
      "Impossible de supprimer cet animal.",
    );
  } finally {
    isSubmitting.value = false;
  }
};

const handlePictureChange = (event: Event) => {
  const input = event.target as HTMLInputElement;

  editPicture.value = input.files?.[0] || null;
};

const submitNewMeasurement = async () => {
  if (!canEditAnimal.value) {
    newMeasurementError.value =
      "Seul le proprietaire ou un admin peut modifier cet animal.";
    return;
  }

  if (!animalId.value) {
    newMeasurementError.value = "Animal introuvable.";
    return;
  }

  const parsedAnimalId = Number(animalId.value);
  if (!Number.isInteger(parsedAnimalId) || parsedAnimalId <= 0) {
    newMeasurementError.value = "Identifiant animal invalide.";
    return;
  }

  const weightValue = newMeasurementWeight.value;
  const sizeValue = newMeasurementSize.value;

  const hasWeight = weightValue !== null && Number.isFinite(weightValue);
  const hasSize = sizeValue !== null && Number.isFinite(sizeValue);

  if (!hasWeight && !hasSize) {
    newMeasurementError.value =
      "Renseigne au moins une mesure (poids ou taille).";
    return;
  }

  if (hasWeight && (!Number.isInteger(weightValue) || weightValue <= 0)) {
    newMeasurementError.value =
      "Le poids doit être un entier strictement positif.";
    return;
  }

  if (hasSize && (!Number.isInteger(sizeValue) || sizeValue <= 0)) {
    newMeasurementError.value =
      "La taille doit être un entier strictement positif.";
    return;
  }

  try {
    isSubmitting.value = true;
    newMeasurementError.value = "";

    const headers = {
      ...authHeaders.value,
      "Content-Type": "application/json",
    };

    const requests: Promise<unknown>[] = [];

    if (hasWeight && weightValue !== null) {
      requests.push(
        $fetch(`${config.public.apiUrl}/weight-records`, {
          method: "POST",
          headers,
          body: {
            date: newMeasurementDate.value,
            weight: weightValue,
            animal_id: parsedAnimalId,
          },
        }),
      );
    }

    if (hasSize && sizeValue !== null) {
      requests.push(
        $fetch(`${config.public.apiUrl}/height-records`, {
          method: "POST",
          headers,
          body: {
            date: newMeasurementDate.value,
            height: sizeValue,
            animal_id: parsedAnimalId,
          },
        }),
      );
    }

    await Promise.all(requests);
    healthDataRefreshKey.value += 1;

    showNewMeasurement.value = false;
    newMeasurementDate.value = getTodayDateInputValue();
    newMeasurementWeight.value = null;
    newMeasurementSize.value = null;
  } catch (error) {
    console.error(error);
    newMeasurementError.value = "Impossible d'enregistrer la mesure.";
  } finally {
    isSubmitting.value = false;
  }
};

watch(showNewMeasurement, (isOpen) => {
  if (!isOpen) {
    return;
  }

  newMeasurementDate.value = getTodayDateInputValue();
  newMeasurementError.value = "";
});

watch(showInfo, (isOpen) => {
  if (isOpen) {
    errorMessage.value = "";
  }
});

watch(canEditAnimal, (canEdit) => {
  if (canEdit) {
    return;
  }

  showEdit.value = false;
  showNewMeasurement.value = false;
  showNewTreatment.value = false;
});

watch(
  () => animal.value?.is_shared,
  (isShared) => {
    if (!isShared) {
      showQr.value = false;
    }
  },
);

onMounted(async () => {
  isLoading.value = true;

  await Promise.all([
    fetchCurrentAnimal(),
    fetchSpecies(),
    fetchAppointmentsData(),
    fetchTreatmentsData(),
  ]);

  isLoading.value = false;
});

watch(showNewTreatment, (isOpen) => {
  if (!isOpen) {
    return;
  }

  newTreatmentDate.value = getTodayDateInputValue();
  newTreatmentFrequencyId.value = null;
  newTreatmentFrequencyAmount.value = 1;
  newTreatmentError.value = "";
});
</script>

<template>
  <div v-if="isLoading">
    <Icon name="eos-icons:loading" class="text-grey-500 size-10 animate-spin" />
  </div>

  <div v-else-if="errorMessage && !animal">
    <p class="text-center text-red-600">{{ errorMessage }}</p>
  </div>

  <div v-else-if="animal">
    <figure class="mb-4 flex flex-col items-center justify-center">
      <div class="mb-2 flex flex-col items-center">
        <div class="flex items-center">
          <h1 class="text-2xl font-bold">{{ animal.name }}</h1>
          <Icon :name="sexIcon" :class="sexIconClass" />
        </div>

        <span class="text-grey-700 italic">{{ animal.breed }}</span>
      </div>

      <div class="relative mb-5">
        <img
          :src="animalPictureUrl"
          :alt="animal.name"
          class="size-50 rounded-full object-cover"
        />

        <ul>
          <li
            v-if="canEditAnimal"
            class="absolute top-0 -left-3 flex w-fit cursor-pointer items-center justify-center rounded-full p-1"
            :class="isAnimalShared ? 'bg-green-300' : 'bg-grey-500'"
            @click="toggleAnimalShared"
          >
            <Icon
              :name="
                isAnimalShared
                  ? 'material-symbols:share-outline'
                  : 'material-symbols:share-off-outline-rounded'
              "
              class="size-6 text-black"
            />
          </li>

          <li
            v-if="isAnimalShared"
            class="absolute top-0 -right-3 flex w-fit cursor-pointer items-center justify-center rounded-full bg-green-300 p-1"
            @click="showQr = true"
          >
            <Icon
              name="material-symbols:qr-code-rounded"
              class="size-6 text-black"
            />
          </li>

          <li
            class="absolute -right-3 bottom-0 flex w-fit cursor-pointer items-center justify-center rounded-full bg-green-300 p-1"
            @click="showInfo = true"
          >
            <Icon
              name="material-symbols:info-i-rounded"
              class="size-6 text-black"
            />
          </li>

          <li
            v-if="canEditAnimal"
            class="absolute bottom-0 -left-3 flex w-fit cursor-pointer items-center justify-center rounded-full bg-green-300 p-1"
            @click="showEdit = true"
          >
            <Icon
              name="material-symbols:edit-outline-rounded"
              class="size-6 text-black"
            />
          </li>
        </ul>
      </div>

      <div class="flex items-center gap-1">
        <Icon name="material-symbols:calendar-today-rounded" class="size-6" />
        <p>{{ animalAge }}</p>
      </div>

      <p v-if="!canEditAnimal" class="mt-2 text-sm text-gray-600">
        Consultation en lecture seule.
      </p>
    </figure>

    <BaseSection title="À venir" action="Tout voir" link="/calendar">
      <div class="-mx-4 flex gap-2 overflow-x-auto px-4">
        <div v-if="isLoadingAppointments" class="py-2 text-sm text-gray-600">
          Chargement des rendez-vous...
        </div>

        <div
          v-else-if="appointmentsErrorMessage"
          class="py-2 text-sm text-red-600"
        >
          {{ appointmentsErrorMessage }}
        </div>

        <template v-else-if="upcomingAppointments.length > 0">
          <Appointment
            v-for="appointment in upcomingAppointments"
            :key="appointment.id"
            compact
            hide-animal
            :id="appointment.id"
            :animal="appointment.animal"
            :type="appointment.type"
            :date="appointment.date"
            :time="appointment.time"
            :clinic="appointment.clinic"
            :today="appointment.isToday"
          />
        </template>

        <p v-else class="py-2 text-sm text-gray-600">
          Aucun rendez-vous à venir.
        </p>
      </div>
    </BaseSection>

    <div class="flex flex-col gap-6 xl:flex-row xl:items-stretch xl:gap-16">
      <BaseSection title="Carnet de santé" color="blue">
        <div class="grid grid-cols-2 justify-items-center gap-4 md:w-fit">
          <AnimalHealthGraph
            type="weight"
            :animal-id="animal.id"
            :refresh-key="healthDataRefreshKey"
          />
          <AnimalHealthData
            type="weight"
            :animal-id="animal.id"
            :refresh-key="healthDataRefreshKey"
          />
          <AnimalHealthData
            type="size"
            :animal-id="animal.id"
            :refresh-key="healthDataRefreshKey"
          />
          <AnimalHealthGraph
            type="size"
            :animal-id="animal.id"
            :refresh-key="healthDataRefreshKey"
          />
        </div>
      </BaseSection>

      <BaseSection
        title="Évolution"
        :action="canEditAnimal ? 'Nouvelle mesure' : undefined"
        :plus="canEditAnimal"
        @action-click="showNewMeasurement = true"
        class="xl:flex xl:flex-1 xl:flex-col xl:items-stretch"
      >
        <div class="xl:flex xl:flex-1 xl:flex-col xl:items-stretch">
          <AnimalHealthEvolution
            :animal-id="animal.id"
            :type="evolutionType"
            :refresh-key="healthDataRefreshKey"
          />

          <AnimalStatsToggle
            class="mx-auto"
            v-model="evolutionType"
            left-label="Taille"
            right-label="Poids"
            left-value="size"
            right-value="weight"
          />
        </div>
      </BaseSection>
    </div>

    <BaseSection
      title="Traitements"
      :action="canEditAnimal ? 'Nouveau traitement' : undefined"
      :plus="canEditAnimal"
      @action-click="showNewTreatment = true"
    >
      <div class="space-y-2">
        <p v-if="isLoadingTreatments" class="text-sm text-gray-600">
          Chargement des traitements...
        </p>

        <p v-else-if="treatmentsErrorMessage" class="text-sm text-red-600">
          {{ treatmentsErrorMessage }}
        </p>

        <p
          v-else-if="treatmentCards.length === 0"
          class="text-sm text-gray-600"
        >
          Aucun traitement enregistré pour cet animal.
        </p>

        <div v-else class="space-y-2">
          <article
            v-for="treatment in treatmentCards"
            :key="treatment.id"
            class="rounded-xl bg-green-300 p-3 shadow"
          >
            <div class="flex items-center justify-between gap-3">
              <p class="font-bold">{{ treatment.typeName }}</p>
              <p class="text-sm font-semibold">{{ treatment.date }}</p>
            </div>

            <div class="mt-1 space-y-1 text-sm">
              <p v-if="treatment.quantityText" class="text-gray-700">
                Quantité: {{ treatment.quantityText }}
              </p>
              <p v-if="treatment.frequencyText" class="text-gray-700">
                Fréquence: {{ treatment.frequencyText }}
              </p>
              <p v-if="treatment.note" class="text-gray-600 italic">
                {{ treatment.note }}
              </p>
            </div>
          </article>
        </div>
      </div>
    </BaseSection>
  </div>

  <BasePopup v-model="showInfo">
    <h2 class="mb-2 text-center font-bold">Informations supplémentaires</h2>

    <p>Date de naissance : {{ formatDate(animal?.birth_date) }}</p>
    <p>Date d'adoption : {{ formatDate(animal?.adoption_date) }}</p>
    <p v-if="errorMessage" class="mt-2 text-center text-sm text-red-600">
      {{ errorMessage }}
    </p>

    <button
      v-if="canEditAnimal"
      class="button-sm mx-auto mt-4 border shadow"
      :disabled="isSubmitting"
      @click="deleteAnimal"
    >
      <Icon
        name="material-symbols:add-2-rounded"
        class="text-red size-6 rotate-45"
      />
      Supprimer cet animal
    </button>
  </BasePopup>

  <BasePopup v-model="showQr" fit>
    <div class="flex w-full items-center justify-center">
      <div v-if="isAnimalShared" class="size-64 h-fit lg:size-80">
        <Qrcode :value="qrValue" />
      </div>
    </div>
  </BasePopup>

  <BasePopup v-if="canEditAnimal" v-model="showEdit">
    <form @submit.prevent="submitEdit">
      <h2 class="mb-2 text-center font-bold">Modifier les informations</h2>

      <p v-if="errorMessage" class="mb-2 text-center text-sm text-red-600">
        {{ errorMessage }}
      </p>

      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-1">
          <label for="name" class="text-sm font-medium">Nom</label>
          <input
            id="name"
            v-model="editName"
            type="text"
            class="border-grey-300 rounded-lg border bg-white px-3 py-2 focus:border-green-700 focus:outline-none"
          />
        </div>

        <div class="flex flex-col gap-1">
          <label for="species" class="text-sm font-medium">Espèce</label>
          <select
            id="species"
            v-model="editSpecies"
            class="border-grey-300 rounded-lg border bg-white px-3 py-2 focus:border-green-700 focus:outline-none"
          >
            <option
              v-for="specie in species"
              :key="specie.id"
              :value="String(specie.id)"
            >
              {{ specie.name }}
            </option>
          </select>
        </div>

        <div class="flex flex-col gap-1">
          <label for="breed" class="text-sm font-medium">Race</label>
          <input
            id="breed"
            v-model="editBreed"
            type="text"
            class="border-grey-300 rounded-lg border bg-white px-3 py-2 focus:border-green-700 focus:outline-none"
          />
        </div>

        <!-- birth date -->
        <div class="flex flex-col gap-1">
          <label for="birth" class="text-sm font-medium">
            Date de naissance
          </label>
          <input
            id="birth"
            v-model="editBirth"
            type="date"
            class="border-grey-300 rounded-lg border bg-white px-3 py-2 focus:border-green-700 focus:outline-none"
          />
        </div>

        <div class="flex flex-col gap-1">
          <label for="adoption" class="text-sm font-medium">
            Date d'adoption
          </label>
          <input
            id="adoption"
            v-model="editAdoption"
            type="date"
            class="border-grey-300 rounded-lg border bg-white px-3 py-2 focus:border-green-700 focus:outline-none"
          />
        </div>

        <div class="flex flex-col gap-1">
          <label for="picture" class="text-sm font-medium">
            Nouvelle photo
          </label>
          <input
            id="picture"
            type="file"
            accept="image/*"
            class="border-grey-300 rounded-lg border bg-white px-3 py-2 focus:border-green-700 focus:outline-none"
            @change="handlePictureChange"
          />
        </div>

        <button
          type="submit"
          class="cursor-pointer rounded-lg bg-green-700 px-4 py-2 font-medium text-white transition-colors hover:bg-green-900 disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="isSubmitting"
        >
          {{ isSubmitting ? "Enregistrement..." : "Enregistrer" }}
        </button>
      </div>
    </form>
  </BasePopup>

  <BasePopup v-if="canEditAnimal" v-model="showNewMeasurement">
    <form class="flex flex-col gap-4" @submit.prevent="submitNewMeasurement">
      <h2 class="text-center font-bold">Nouvelle mesure</h2>

      <p v-if="newMeasurementError" class="text-center text-sm text-red-600">
        {{ newMeasurementError }}
      </p>

      <div class="flex flex-col gap-1">
        <label for="measurement-date" class="text-sm font-medium">Date</label>
        <input
          id="measurement-date"
          v-model="newMeasurementDate"
          type="date"
          required
          class="border-grey-300 rounded-lg border bg-white px-3 py-2 focus:border-green-700 focus:outline-none"
        />
      </div>

      <div class="flex flex-col gap-1">
        <label for="measurement-weight" class="text-sm font-medium"
          >Poids (kg)</label
        >
        <input
          id="measurement-weight"
          v-model.number="newMeasurementWeight"
          type="number"
          min="0"
          step="1"
          class="border-grey-300 rounded-lg border bg-white px-3 py-2 focus:border-green-700 focus:outline-none"
        />
      </div>

      <div class="flex flex-col gap-1">
        <label for="measurement-size" class="text-sm font-medium"
          >Taille (cm)</label
        >
        <input
          id="measurement-size"
          v-model.number="newMeasurementSize"
          type="number"
          min="0"
          step="1"
          class="border-grey-300 rounded-lg border bg-white px-3 py-2 focus:border-green-700 focus:outline-none"
        />
      </div>

      <button
        type="submit"
        class="cursor-pointer rounded-lg bg-green-700 px-4 py-2 font-medium text-white transition-colors hover:bg-green-900 disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="isSubmitting"
      >
        {{ isSubmitting ? "Enregistrement..." : "Enregistrer la mesure" }}
      </button>
    </form>
  </BasePopup>

  <BasePopup v-if="canEditAnimal" v-model="showNewTreatment">
    <form class="flex flex-col gap-4" @submit.prevent="submitNewTreatment">
      <h2 class="text-center font-bold">Nouveau traitement</h2>

      <p v-if="newTreatmentError" class="text-center text-sm text-red-600">
        {{ newTreatmentError }}
      </p>

      <div class="flex flex-col gap-1">
        <label for="treatment-date" class="text-sm font-medium">Date</label>
        <input
          id="treatment-date"
          v-model="newTreatmentDate"
          type="date"
          required
          class="border-grey-300 rounded-lg border bg-white px-3 py-2 focus:border-green-700 focus:outline-none"
        />
      </div>

      <div class="flex flex-col gap-1">
        <label for="treatment-type" class="text-sm font-medium"
          >Type de traitement</label
        >
        <select
          id="treatment-type"
          v-model="newTreatmentTypeId"
          required
          class="border-grey-300 rounded-lg border bg-white px-3 py-2 focus:border-green-700 focus:outline-none"
        >
          <option :value="null" disabled>Choisir un type</option>
          <option
            v-for="option in treatmentTypeOptions"
            :key="option.value"
            :value="Number(option.value)"
          >
            {{ option.label }}
          </option>
        </select>
      </div>

      <div class="flex flex-col gap-1">
        <label for="treatment-frequency" class="text-sm font-medium"
          >Frequence (optionnel)</label
        >
        <select
          id="treatment-frequency"
          v-model="newTreatmentFrequencyId"
          class="border-grey-300 rounded-lg border bg-white px-3 py-2 focus:border-green-700 focus:outline-none"
        >
          <option :value="null">Aucune frequence</option>
          <option
            v-for="option in reminderFrequencyOptions"
            :key="option.value"
            :value="Number(option.value)"
          >
            {{ option.label }}
          </option>
        </select>
      </div>

      <div v-if="newTreatmentFrequencyId !== null" class="flex flex-col gap-1">
        <label for="treatment-frequency-amount" class="text-sm font-medium">
          Tous les (1 a 20)
        </label>
        <input
          id="treatment-frequency-amount"
          v-model.number="newTreatmentFrequencyAmount"
          type="number"
          min="1"
          max="20"
          step="1"
          required
          class="border-grey-300 rounded-lg border bg-white px-3 py-2 focus:border-green-700 focus:outline-none"
        />
      </div>

      <div class="flex flex-col gap-1">
        <label for="treatment-quantity" class="text-sm font-medium"
          >Quantité (optionnel)</label
        >
        <input
          id="treatment-quantity"
          v-model.number="newTreatmentQuantity"
          type="number"
          min="1"
          step="1"
          class="border-grey-300 rounded-lg border bg-white px-3 py-2 focus:border-green-700 focus:outline-none"
        />
      </div>

      <div class="flex flex-col gap-1">
        <label for="treatment-note" class="text-sm font-medium"
          >Note (optionnel)</label
        >
        <textarea
          id="treatment-note"
          v-model="newTreatmentNote"
          rows="3"
          class="border-grey-300 rounded-lg border bg-white px-3 py-2 focus:border-green-700 focus:outline-none"
        />
      </div>

      <button
        type="submit"
        class="cursor-pointer rounded-lg bg-green-700 px-4 py-2 font-medium text-white transition-colors hover:bg-green-900 disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="isSubmitting"
      >
        {{ isSubmitting ? "Enregistrement..." : "Enregistrer le traitement" }}
      </button>
    </form>
  </BasePopup>
</template>
