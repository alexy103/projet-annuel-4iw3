<script setup lang="ts">
const route = useRoute();

const appointment = reactive({
  id: route.params.id,
  animal: "Scooby",
  type: "Vaccin",
  date: "15/07/2026",
  time: "16h00",
  clinic: "Clinique Paul Picquet",
  address: "12 rue Paul Picquet, 67000 Strasbourg",
  veterinarian: "Dr Martin",
  status: "En attente",
  notes: "Opération réussie, repos 2 semaines.",
});

const isEditing = ref(false);

const editedDate = ref("");
const editedTime = ref("");

const appointmentDate = computed(() => {
  const [day, month, year] = appointment.date.split("/");
  const [hour, minute] = appointment.time.replace("h", ":").split(":");

  return new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
  );
});

const isFinishedAppointment = computed(() => {
  return appointmentDate.value.getTime() < new Date().getTime();
});

const appointmentStatus = computed(() => {
  if (isFinishedAppointment.value) {
    return "Terminé";
  }

  return appointment.status;
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

const canEditAppointment = computed(() => {
  return appointmentStatus.value === "En attente";
});

const canCancelAppointment = computed(() => {
  return appointmentStatus.value !== "Terminé";
});

const startEditing = () => {
  if (!canEditAppointment.value) {
    return;
  }

  isEditing.value = true;
  editedDate.value = appointment.date.split("/").reverse().join("-");
  editedTime.value = appointment.time.replace("h", ":");
};

const saveAppointment = () => {
  appointment.date = editedDate.value.split("-").reverse().join("/");
  appointment.time = editedTime.value.replace(":", "h");
  isEditing.value = false;
};

const cancelEditing = () => {
  isEditing.value = false;
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

    <section class="rounded-2xl bg-green-300 p-5">
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

        <div
          v-if="appointmentStatus === 'Terminé'"
          class="rounded-xl bg-white p-4"
        >
          <p class="text-sm text-gray-500">Notes</p>
          <p class="font-bold">{{ appointment.notes }}</p>
        </div>
      </div>
    </section>

    <section
      v-if="canEditAppointment || canCancelAppointment"
      class="mt-6 flex flex-col items-center gap-4 lg:flex-row lg:gap-8"
    >
      <button
        v-if="!isEditing && canEditAppointment"
        class="text-background flex w-full cursor-pointer items-center justify-center rounded-xl bg-green-700 px-4 py-3 font-bold shadow-lg transition-colors hover:bg-green-900 lg:basis-2/3"
        @click="startEditing"
      >
        Modifier la date et l'heure
      </button>

      <div v-else-if="isEditing" class="flex w-full gap-3 lg:basis-2/3">
        <button
          class="text-background flex basis-2/3 cursor-pointer items-center justify-center rounded-xl bg-green-700 px-4 py-3 font-bold shadow-lg transition-colors hover:bg-green-900"
          @click="saveAppointment"
        >
          Enregistrer
        </button>

        <button
          class="flex basis-1/3 cursor-pointer items-center justify-center rounded-xl bg-gray-100 px-4 py-3 font-bold shadow-lg transition-colors hover:bg-gray-200"
          @click="cancelEditing"
        >
          Retour
        </button>
      </div>

      <button
        v-if="canCancelAppointment"
        class="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-red-50 px-4 py-3 font-bold shadow-lg transition-colors hover:bg-red-100 lg:flex-1"
      >
        <Icon name="material-symbols:delete-outline" class="text-red size-5" />
        Annuler le rendez-vous
      </button>
    </section>
  </main>
</template>
