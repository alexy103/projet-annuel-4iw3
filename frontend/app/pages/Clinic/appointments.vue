<script setup lang="ts">
definePageMeta({
  layout: "default",
});

const activeTab = ref<"upcoming" | "ongoing" | "past">("upcoming");

const veterinarians = [
  { id: 1, name: "Dr Dupont" },
  { id: 2, name: "Dr Martin" },
  { id: 3, name: "Dr Bernard" },
];

const appointments = ref([
  { id: 1, date: "2026-05-20", time: "09h00", owner: "Jean Dupuis", animal: "Rex", reason: "Vaccination", status: "upcoming", assignedVet: null },
  { id: 2, date: "2026-05-20", time: "10h00", owner: "Marie Curie", animal: "Luna", reason: "Contrôle annuel", status: "upcoming", assignedVet: null },
  { id: 3, date: "2026-05-17", time: "14h00", owner: "Paul Martin", animal: "Milo", reason: "Consultation", status: "ongoing", assignedVet: null },
  { id: 4, date: "2026-05-10", time: "11h00", owner: "Sophie Bernard", animal: "Nala", reason: "Chirurgie", status: "past", assignedVet: "Dr Dupont" },
  { id: 5, date: "2026-05-08", time: "15h30", owner: "Lucas Petit", animal: "Oscar", reason: "Vaccination", status: "past", assignedVet: "Dr Martin" },
]);

const filtered = computed(() => appointments.value.filter(a => a.status === activeTab.value));

const startAppointment = (id: number) => {
  const appt = appointments.value.find(a => a.id === id);
  if (appt) appt.status = "ongoing";
};

const closeAppointment = (id: number) => {
  const appt = appointments.value.find(a => a.id === id);
  if (appt) appt.status = "past";
};

const tabs = [
  { key: "upcoming", label: "À venir" },
  { key: "ongoing", label: "En cours" },
  { key: "past", label: "Passés" },
];
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center gap-3">
      <NuxtLink to="/clinic">
        <Icon name="material-symbols:arrow-back" class="size-6 text-black" />
      </NuxtLink>
      <h1 class="text-2xl font-bold">Gestion des RDV</h1>
    </div>

    <div class="flex gap-2">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="rounded-full px-4 py-2 text-sm font-bold transition-colors duration-200"
        :class="activeTab === tab.key ? 'bg-[#15D98B] text-white' : 'bg-gray-200 text-black'"
        @click="activeTab = tab.key as 'upcoming' | 'ongoing' | 'past'"
      >
        {{ tab.label }}
      </button>
    </div>

    <div class="space-y-4">
      <div
        v-for="appt in filtered"
        :key="appt.id"
        class="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm space-y-3"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="font-bold text-lg">{{ appt.owner }}</p>
            <p class="text-sm text-gray-500">{{ appt.animal }} — {{ appt.reason }}</p>
            <p class="text-sm text-gray-400">{{ appt.date }} à {{ appt.time }}</p>
          </div>
          <div class="flex flex-col items-end gap-2">
            <span
              class="rounded-full px-3 py-1 text-xs font-bold text-white"
              :class="{
                'bg-[#31C6D0]': appt.status === 'upcoming',
                'bg-[#15D98B]': appt.status === 'ongoing',
                'bg-gray-400': appt.status === 'past',
              }"
            >
              {{ appt.status === 'upcoming' ? 'À venir' : appt.status === 'ongoing' ? 'En cours' : 'Terminé' }}
            </span>
          </div>
        </div>

        <div v-if="appt.status === 'ongoing'" class="space-y-2">
          <p class="text-sm font-bold">Médecin assigné</p>
          <select
            v-model="appt.assignedVet"
            class="w-full rounded-full border border-gray-300 px-4 py-2 text-sm outline-none"
          >
            <option value="" disabled>Choisir un médecin</option>
            <option v-for="vet in veterinarians" :key="vet.id" :value="vet.name">
              {{ vet.name }}
            </option>
          </select>
        </div>

        <div v-if="appt.status === 'past' && appt.assignedVet" class="text-sm text-gray-500">
          Suivi par : <span class="font-bold text-black">{{ appt.assignedVet }}</span>
        </div>

        <div class="flex gap-2">
          <button
            v-if="appt.status === 'upcoming'"
            class="rounded-full bg-[#15D98B] px-4 py-2 text-sm font-bold text-white transition-transform duration-200 hover:scale-105"
            @click="startAppointment(appt.id)"
          >
            Commencer
          </button>
          <button
            v-if="appt.status === 'ongoing'"
            class="rounded-full bg-red-500 px-4 py-2 text-sm font-bold text-white transition-transform duration-200 hover:scale-105"
            @click="closeAppointment(appt.id)"
          >
            Clôturer
          </button>
        </div>
      </div>

      <p v-if="filtered.length === 0" class="text-center text-gray-400">
        Aucun rendez-vous dans cette catégorie.
      </p>
    </div>
  </div>
</template>