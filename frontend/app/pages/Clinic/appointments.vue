<script setup lang="ts">
definePageMeta({
  layout: "default",
});

const activeTab = ref<"upcoming" | "ongoing" | "past">("upcoming");
const selectedAppointment = ref<number | null>(null);

const veterinarians = [
  { id: 1, name: "Dr Dupont" },
  { id: 2, name: "Dr Martin" },
  { id: 3, name: "Dr Bernard" },
];

const appointments = ref([
  { id: 1, date: "2026-05-20", time: "09h00", owner: "Jean Dupuis", animal: "Rex", reason: "Vaccination", status: "upcoming", assignedVet: null, notes: "" },
  { id: 2, date: "2026-05-20", time: "10h00", owner: "Marie Curie", animal: "Luna", reason: "Contrôle annuel", status: "upcoming", assignedVet: null, notes: "" },
  { id: 3, date: "2026-05-17", time: "14h00", owner: "Paul Martin", animal: "Milo", reason: "Consultation", status: "ongoing", assignedVet: null, notes: "" },
  { id: 4, date: "2026-05-10", time: "11h00", owner: "Sophie Bernard", animal: "Nala", reason: "Chirurgie", status: "past", assignedVet: "Dr Dupont", notes: "Opération réussie, repos 2 semaines." },
  { id: 5, date: "2026-05-08", time: "15h30", owner: "Lucas Petit", animal: "Oscar", reason: "Vaccination", status: "past", assignedVet: "Dr Martin", notes: "Rappel dans 1 an." },
]);

const filtered = computed(() => appointments.value.filter(a => a.status === activeTab.value));

const toggleDetail = (id: number) => {
  selectedAppointment.value = selectedAppointment.value === id ? null : id;
};

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
        class="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden"
      >
        <div
          class="flex items-center justify-between p-4 cursor-pointer"
          @click="toggleDetail(appt.id)"
        >
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
            <Icon
              :name="selectedAppointment === appt.id ? 'material-symbols:keyboard-arrow-up' : 'material-symbols:keyboard-arrow-down'"
              class="size-5 text-gray-400"
            />
          </div>
        </div>

        <div v-if="selectedAppointment === appt.id" class="border-t border-gray-100 px-4 pb-4 pt-3 space-y-3">
          <div class="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p class="text-gray-400">Propriétaire</p>
              <p class="font-bold">{{ appt.owner }}</p>
            </div>
            <div>
              <p class="text-gray-400">Animal</p>
              <p class="font-bold">{{ appt.animal }}</p>
            </div>
            <div>
              <p class="text-gray-400">Motif</p>
              <p class="font-bold">{{ appt.reason }}</p>
            </div>
            <div>
              <p class="text-gray-400">Date & heure</p>
              <p class="font-bold">{{ appt.date }} à {{ appt.time }}</p>
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
            <p class="text-sm font-bold">Notes / compte-rendu</p>
            <textarea
              v-model="appt.notes"
              placeholder="Ajouter des notes..."
              class="w-full rounded-2xl border border-gray-300 px-4 py-2 text-sm outline-none resize-none"
              rows="3"
            />
          </div>

          <div v-if="appt.status === 'past'" class="space-y-1 text-sm">
            <p class="text-gray-400">Suivi par</p>
            <p class="font-bold">{{ appt.assignedVet ?? 'Non renseigné' }}</p>
            <p class="text-gray-400 mt-2">Notes</p>
            <p class="font-bold">{{ appt.notes || 'Aucune note.' }}</p>
          </div>

          <div class="flex gap-2 pt-1">
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
      </div>

      <p v-if="filtered.length === 0" class="text-center text-gray-400">
        Aucun rendez-vous dans cette catégorie.
      </p>
    </div>
  </div>
</template>