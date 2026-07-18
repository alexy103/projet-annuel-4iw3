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
};

type ApiClinic = {
  id: number;
  name: string;
};

type ApiAppointmentReason = {
  id: number;
  label: string;
};

type AppointmentCard = {
  id: number;
  animal: string;
  type: string;
  date: string;
  time: string;
  clinic: string;
  isToday: boolean;
};

type AppointmentWithDate = {
  appointment: ApiAppointment;
  startsAt: Date;
};

const userStore = useUserStore();

const isLoading = ref(false);
const errorMessage = ref("");

const appointments = ref<ApiAppointment[]>([]);
const clinics = ref<ApiClinic[]>([]);
const appointmentReasons = ref<ApiAppointmentReason[]>([]);
const { openWithPrefilledDate } = useAppointmentBookingPopup();

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

const appointmentsWithDate = computed<AppointmentWithDate[]>(() => {
  return appointments.value.map((appointment) => ({
    appointment,
    startsAt: buildAppointmentDateTime(appointment.date, appointment.time),
  }));
});

const appointmentDatesForCalendar = computed<string[]>(() => {
  return appointments.value.map((appointment) => getDatePart(appointment.date));
});

const mapToCard = (
  appointment: ApiAppointment,
  startsAt: Date,
  now: Date,
): AppointmentCard => {
  const animalsById = new Map(
    userStore.animals.map((animal) => [animal.id, animal.name]),
  );
  const clinicsById = new Map(
    clinics.value.map((clinic) => [clinic.id, clinic.name]),
  );
  const reasonsById = new Map(
    appointmentReasons.value.map((reason) => [reason.id, reason.label]),
  );

  return {
    id: appointment.id,
    animal:
      animalsById.get(appointment.animal_id) ??
      `Animal #${appointment.animal_id}`,
    type:
      reasonsById.get(appointment.reason_id) ??
      `Motif #${appointment.reason_id}`,
    date: formatDateFr(appointment.date),
    time: formatTimeFr(appointment.time),
    clinic:
      clinicsById.get(appointment.clinic_id) ??
      `Clinique #${appointment.clinic_id}`,
    isToday: isSameDay(startsAt, now),
  };
};

const upcomingAppointments = computed<AppointmentCard[]>(() => {
  const now = new Date();

  return appointmentsWithDate.value
    .filter(({ appointment, startsAt }) => {
      return !appointment.is_completed && startsAt.getTime() >= now.getTime();
    })
    .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime())
    .map(({ appointment, startsAt }) => mapToCard(appointment, startsAt, now));
});

const pastAppointments = computed<AppointmentCard[]>(() => {
  const now = new Date();

  return appointmentsWithDate.value
    .filter(({ appointment, startsAt }) => {
      return appointment.is_completed || startsAt.getTime() < now.getTime();
    })
    .sort((a, b) => b.startsAt.getTime() - a.startsAt.getTime())
    .map(({ appointment, startsAt }) => mapToCard(appointment, startsAt, now));
});

const fetchCalendarData = async () => {
  errorMessage.value = "";
  isLoading.value = true;

  try {
    await userStore.fetchAnimals();

    const config = useRuntimeConfig();

    const [appointmentsResponse, clinicsResponse, reasonsResponse] =
      await Promise.all([
        fetch(`${config.public.apiUrl}/appointments`, {
          method: "GET",
          headers: getAuthHeaders(),
        }),
        fetch(`${config.public.apiUrl}/clinics`, {
          method: "GET",
          headers: getAuthHeaders(),
        }),
        fetch(`${config.public.apiUrl}/appointment-reasons`, {
          method: "GET",
          headers: getAuthHeaders(),
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
        appointmentsResult.error || "Impossible de charger les rendez-vous",
      );
    }

    if (!clinicsResponse.ok || !clinicsResult.success) {
      throw new Error(
        clinicsResult.error || "Impossible de charger les cliniques",
      );
    }

    if (!reasonsResponse.ok || !reasonsResult.success) {
      throw new Error(
        reasonsResult.error || "Impossible de charger les motifs",
      );
    }

    appointments.value = appointmentsResult.data;
    clinics.value = clinicsResult.data;
    appointmentReasons.value = reasonsResult.data;
  } catch (error) {
    errorMessage.value =
      error instanceof Error
        ? error.message
        : "Impossible de charger le calendrier";
  } finally {
    isLoading.value = false;
  }
};

const handleCalendarDayClick = (date: string) => {
  openWithPrefilledDate(date);
};

onMounted(async () => {
  await fetchCalendarData();
});
</script>

<template>
  <BaseSection title="Mes prochains RDV" class="space-y-2">
    <p v-if="isLoading" class="text-sm text-gray-600">Chargement...</p>
    <p v-else-if="errorMessage" class="text-sm text-red-600">
      {{ errorMessage }}
    </p>
    <p
      v-else-if="upcomingAppointments.length === 0"
      class="text-sm text-gray-600"
    >
      Aucun rendez-vous à venir.
    </p>
    <Appointment
      v-for="appointment in upcomingAppointments"
      v-else
      :key="appointment.id"
      :id="appointment.id"
      :animal="appointment.animal"
      :type="appointment.type"
      :date="appointment.date"
      :time="appointment.time"
      :clinic="appointment.clinic"
      :today="appointment.isToday"
    />
  </BaseSection>
  <BaseSection title="Calendrier" class="space-y-2" color="blue">
    <Calendar
      :appointment-dates="appointmentDatesForCalendar"
      @day-click="handleCalendarDayClick"
    />
  </BaseSection>
  <BaseSection title="Mes RDV passés" class="space-y-2">
    <p v-if="isLoading" class="text-sm text-gray-600">Chargement...</p>
    <p v-else-if="errorMessage" class="text-sm text-red-600">
      {{ errorMessage }}
    </p>
    <p v-else-if="pastAppointments.length === 0" class="text-sm text-gray-600">
      Aucun rendez-vous passé.
    </p>
    <Appointment
      v-for="appointment in pastAppointments"
      v-else
      :key="appointment.id"
      :id="appointment.id"
      :animal="appointment.animal"
      :type="appointment.type"
      :date="appointment.date"
      :time="appointment.time"
      :clinic="appointment.clinic"
      :today="appointment.isToday"
    />
  </BaseSection>
</template>
