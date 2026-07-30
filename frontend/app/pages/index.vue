<script setup lang="ts">
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

type UpcomingAppointmentCard = {
  id: number;
  animal: string;
  type: string;
  date: string;
  time: string;
  clinic: string;
  isToday: boolean;
};

const userStore = useUserStore();
const profilePicture = ref<string | null>(null);
const profilePictureFile = ref<File | null>(null);

const firstName = ref(userStore.firstName);
const lastName = ref(userStore.lastName);

const isReady = ref(false);
const isLoadingAppointments = ref(false);
const appointmentsErrorMessage = ref("");

const appointments = ref<ApiAppointment[]>([]);
const clinics = ref<ApiClinic[]>([]);
const appointmentReasons = ref<ApiAppointmentReason[]>([]);

const getDatePart = (rawDate: string): string => {
  return rawDate.includes("T") ? rawDate.split("T")[0] : rawDate;
};

const buildAppointmentDateTime = (rawDate: string, rawTime: string): Date => {
  const datePart = getDatePart(rawDate);
  const [year, month, day] = datePart.split("-").map(Number);
  const [hours, minutes] = rawTime.split(":").map(Number);
  return new Date(year, month - 1, day, hours ?? 0, minutes ?? 0);
};

const isSameDay = (a: Date, b: Date): boolean => {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
};

const formatDateFr = (rawDate: string): string => {
  const datePart = getDatePart(rawDate);
  const [year, month, day] = datePart.split("-").map(Number);
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

const upcomingAppointments = computed<UpcomingAppointmentCard[]>(() => {
  const now = new Date();
  const clinicsById = new Map(
    clinics.value.map((clinic) => [clinic.id, clinic]),
  );
  const reasonsById = new Map(
    appointmentReasons.value.map((reason) => [reason.id, reason]),
  );
  const animalsById = new Map(
    userStore.animals.map((animal) => [animal.id, animal]),
  );

  return appointments.value
    .filter((appointment) => !appointment.is_completed)
    .map((appointment) => ({
      appointment,
      startsAt: buildAppointmentDateTime(appointment.date, appointment.time),
    }))
    .filter(({ startsAt }) => startsAt.getTime() >= now.getTime())
    .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime())
    .slice(0, 10)
    .map(({ appointment, startsAt }) => ({
      id: appointment.id,
      animal:
        animalsById.get(appointment.animal_id)?.name ??
        `Animal #${appointment.animal_id}`,
      type:
        reasonsById.get(appointment.reason_id)?.label ??
        `Motif #${appointment.reason_id}`,
      date: formatDateFr(appointment.date),
      time: formatTimeFr(appointment.time),
      clinic:
        clinicsById.get(appointment.clinic_id)?.name ??
        `Clinique #${appointment.clinic_id}`,
      isToday: isSameDay(startsAt, now),
    }));
});

const fetchAppointmentsData = async () => {
  appointmentsErrorMessage.value = "";
  isLoadingAppointments.value = true;
  try {
    const { apiFetch } = useApi();
    const [appointmentsResult, clinicsResult, reasonsResult] =
      await Promise.all([
        apiFetch<ApiAppointment[]>("/appointments"),
        apiFetch<ApiClinic[]>("/clinics"),
        apiFetch<ApiAppointmentReason[]>("/appointment-reasons"),
      ]);
    appointments.value = appointmentsResult;
    clinics.value = clinicsResult;
    appointmentReasons.value = reasonsResult;
  } catch (error) {
    appointmentsErrorMessage.value =
      error instanceof Error
        ? error.message
        : "Impossible de charger les rendez-vous";
  } finally {
    isLoadingAppointments.value = false;
  }
};

definePageMeta({
  // layout: "onboarding",
});

onMounted(async () => {
  await userStore.fetchAnimals();
  await fetchAppointmentsData();
  isReady.value = true;
});

onUnmounted(() => {
  if (profilePicture.value) {
    URL.revokeObjectURL(profilePicture.value);
  }
});

const onboardingError = ref("");
const isCompleting = ref(false);

const completeOnboarding = async () => {
  onboardingError.value = "";
  isCompleting.value = true;
  try {
    await userStore.completeOnboarding({
      firstName: firstName.value,
      lastName: lastName.value,
      profilePictureFile: profilePictureFile.value ?? undefined,
    });
    setPageLayout("default");
  } catch (error) {
    onboardingError.value =
      error instanceof Error ? error.message : "Erreur lors de la sauvegarde";
  } finally {
    isCompleting.value = false;
  }
};

const handleProfilePictureUpload = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  profilePictureFile.value = file;
  if (profilePicture.value) {
    URL.revokeObjectURL(profilePicture.value);
  }
  profilePicture.value = URL.createObjectURL(file);
};
</script>

<template>
  <div v-if="!isReady" class="flex h-screen items-center justify-center">
    <Icon name="eos-icons:loading" class="text-grey-500 size-10 animate-spin" />
  </div>

  <div
    v-else-if="userStore.onboardingCompleted && userStore.animals.length > 0"
  >
    <h1 class="mt-2 mb-4 text-2xl font-bold">
      Bienvenue, {{ userStore.firstName }} !
    </h1>

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

    <BaseSection
      title="Mes animaux"
      action="Ajouter un animal"
      link="/add-animal"
      color="blue"
    >
      <div class="grid w-full grid-cols-2 justify-items-center gap-4">
        <AnimalCard
          v-for="animal in userStore.animals"
          :key="animal.id"
          :src="animal.image"
          :id="animal.id"
        />
      </div>
    </BaseSection>
  </div>

  <div
    v-else-if="userStore.onboardingCompleted && userStore.animals.length === 0"
    class="flex min-h-[70vh] flex-col items-center justify-center gap-4 text-center lg:gap-8"
  >
    <h2 class="text-xl font-bold">
      Il semble que vous n'ayez pas encore ajouté d'animal à votre compte...
    </h2>

    <NuxtLink to="/add-animal">
      <BaseButton class="flex justify-center">
        Ajouter mon premier animal
      </BaseButton>
    </NuxtLink>
  </div>

  <div v-else-if="userStore.onboardingCompleted === false" class="space-y-4">
    <h1 v-if="userStore.firstName" class="mt-2 text-2xl font-bold">
      Bienvenue par minous, {{ userStore.firstName }}
    </h1>
    <h1 v-else class="mt-2 text-2xl font-bold">Bienvenue par minous !</h1>

    <div class="flex items-center justify-around gap-4">
      <BaseInput label="Prénom" v-model="firstName" />
      <BaseInput label="Nom" v-model="lastName" />
    </div>

    <h2 class="text-xl font-bold">Une photo ?</h2>

    <label
      for="profile-picture"
      class="bg-grey-500 mx-auto flex size-20 cursor-pointer items-center justify-center overflow-hidden rounded-full"
    >
      <img
        v-if="profilePicture"
        :src="profilePicture"
        alt="Photo de profil"
        class="size-full object-cover"
      />

      <Icon v-else name="material-symbols:upload" class="size-10 text-black" />
    </label>

    <input
      id="profile-picture"
      type="file"
      class="hidden"
      accept="image/*"
      @change="handleProfilePictureUpload"
    />

    <h2 class="text-xl font-bold">Vos préférences</h2>

    <div class="flex items-center justify-between gap-4">
      <p>Notifications push</p>
      <BaseToggle v-model="userStore.notificationsPush" />
    </div>

    <div class="flex items-center justify-between gap-4">
      <p>Mode nuit</p>
      <BaseToggle v-model="userStore.nightMode" />
    </div>

    <p v-if="onboardingError" class="text-center text-sm text-red-500">
      {{ onboardingError }}
    </p>

    <BaseButton
      class="flex justify-center"
      :disabled="isCompleting"
      @click="completeOnboarding"
    >
      {{ isCompleting ? "Enregistrement..." : "Terminer" }}
    </BaseButton>
  </div>

  <div v-else class="flex justify-center py-8">
    <Icon name="eos-icons:loading" class="text-grey-500 size-10 animate-spin" />
  </div>
</template>
