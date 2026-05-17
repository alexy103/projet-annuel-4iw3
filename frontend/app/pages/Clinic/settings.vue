<script setup lang="ts">
definePageMeta({
  layout: "default",
});

const clinic = ref({
  name: "Clinique Paul Picquet",
  address: "12 rue de la Paix",
  city: "Paris",
  phone: "01 23 45 67 89",
  email: "contact@paulpicquet.fr",
  description: "Clinique vétérinaire spécialisée en médecine générale et chirurgie.",
});

const schedules = ref([
  { day: "Lundi", open: true, start: "09:00", end: "19:00" },
  { day: "Mardi", open: true, start: "09:00", end: "19:00" },
  { day: "Mercredi", open: true, start: "09:00", end: "19:00" },
  { day: "Jeudi", open: true, start: "09:00", end: "19:00" },
  { day: "Vendredi", open: true, start: "09:00", end: "18:00" },
  { day: "Samedi", open: true, start: "10:00", end: "16:00" },
  { day: "Dimanche", open: false, start: "09:00", end: "12:00" },
]);

const saved = ref(false);

const save = () => {
  saved.value = true;
  setTimeout(() => (saved.value = false), 2500);
};
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center gap-3">
      <NuxtLink to="/clinic">
        <Icon name="material-symbols:arrow-back" class="size-6 text-black" />
      </NuxtLink>
      <h1 class="text-2xl font-bold">Paramètres de la clinique</h1>
    </div>

    <div class="space-y-4">
      <h2 class="text-lg font-bold">Informations générales</h2>

      <div class="space-y-3">
        <div class="space-y-1">
          <label class="text-sm text-gray-500">Nom de la clinique</label>
          <input
            v-model="clinic.name"
            type="text"
            class="w-full rounded-full border border-gray-300 px-4 py-2 text-sm outline-none focus:border-[#15D98B]"
          />
        </div>
        <div class="space-y-1">
          <label class="text-sm text-gray-500">Adresse</label>
          <input
            v-model="clinic.address"
            type="text"
            class="w-full rounded-full border border-gray-300 px-4 py-2 text-sm outline-none focus:border-[#15D98B]"
          />
        </div>
        <div class="space-y-1">
          <label class="text-sm text-gray-500">Ville</label>
          <input
            v-model="clinic.city"
            type="text"
            class="w-full rounded-full border border-gray-300 px-4 py-2 text-sm outline-none focus:border-[#15D98B]"
          />
        </div>
        <div class="space-y-1">
          <label class="text-sm text-gray-500">Téléphone</label>
          <input
            v-model="clinic.phone"
            type="tel"
            class="w-full rounded-full border border-gray-300 px-4 py-2 text-sm outline-none focus:border-[#15D98B]"
          />
        </div>
        <div class="space-y-1">
          <label class="text-sm text-gray-500">Email</label>
          <input
            v-model="clinic.email"
            type="email"
            class="w-full rounded-full border border-gray-300 px-4 py-2 text-sm outline-none focus:border-[#15D98B]"
          />
        </div>
        <div class="space-y-1">
          <label class="text-sm text-gray-500">Description</label>
          <textarea
            v-model="clinic.description"
            rows="3"
            class="w-full rounded-2xl border border-gray-300 px-4 py-2 text-sm outline-none resize-none focus:border-[#15D98B]"
          />
        </div>
      </div>
    </div>

    <div class="space-y-4">
      <h2 class="text-lg font-bold">Horaires d'ouverture</h2>

      <div class="space-y-3">
        <div
          v-for="schedule in schedules"
          :key="schedule.day"
          class="flex items-center gap-3"
        >
          <div class="w-24 text-sm font-bold">{{ schedule.day }}</div>

          <button
            class="rounded-full px-3 py-1 text-xs font-bold transition-colors duration-200"
            :class="schedule.open ? 'bg-[#15D98B] text-white' : 'bg-gray-200 text-gray-500'"
            @click="schedule.open = !schedule.open"
          >
            {{ schedule.open ? 'Ouvert' : 'Fermé' }}
          </button>

          <template v-if="schedule.open">
            <input
              v-model="schedule.start"
              type="time"
              class="rounded-full border border-gray-300 px-3 py-1 text-sm outline-none focus:border-[#15D98B]"
            />
            <span class="text-sm text-gray-400">→</span>
            <input
              v-model="schedule.end"
              type="time"
              class="rounded-full border border-gray-300 px-3 py-1 text-sm outline-none focus:border-[#15D98B]"
            />
          </template>
        </div>
      </div>
    </div>

    <button
      class="w-full rounded-full bg-[#15D98B] py-3 font-bold text-white transition-transform duration-200 hover:scale-[1.02]"
      @click="save"
    >
      {{ saved ? '✓ Enregistré !' : 'Enregistrer les modifications' }}
    </button>
  </div>
</template>