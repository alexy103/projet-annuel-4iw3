<script setup lang="ts">
definePageMeta({
  layout: "default",
});

const stats = ref([
  { label: "RDV aujourd'hui", value: 8, icon: "material-symbols:calendar-today" },
  { label: "En cours", value: 2, icon: "material-symbols:pending-actions" },
  { label: "Vétérinaires", value: 5, icon: "material-symbols:stethoscope" },
]);

const quickLinks = [
  {
    label: "Gestion des RDV",
    description: "Voir et gérer les rendez-vous",
    icon: "material-symbols:calendar-month",
    to: "/clinic/appointments",
    color: "bg-[#15D98B]",
  },
  {
    label: "Nos vétérinaires",
    description: "Gérer l'équipe médicale",
    icon: "material-symbols:stethoscope",
    to: "/clinic/veterinarians",
    color: "bg-[#31C6D0]",
  },
  {
    label: "Paramètres",
    description: "Modifier les infos de la clinique",
    icon: "material-symbols:settings",
    to: "/clinic/settings",
    color: "bg-[#CCE8DD]",
  },
];

const upcomingAppointments = ref([
  { id: 1, time: "09h00", owner: "Jean Dupuis", animal: "Rex", reason: "Vaccination" },
  { id: 2, time: "10h00", owner: "Marie Curie", animal: "Luna", reason: "Contrôle annuel" },
  { id: 3, time: "14h00", owner: "Paul Martin", animal: "Milo", reason: "Consultation" },
]);
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold">Tableau de bord</h1>
      <p class="text-sm text-gray-400">Clinique Paul Picquet</p>
    </div>

    <div class="grid grid-cols-3 gap-3">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="rounded-2xl bg-white border border-gray-100 shadow-sm p-4 flex flex-col items-center gap-1 text-center"
      >
        <Icon :name="stat.icon" class="size-6 text-[#15D98B]" />
        <p class="text-2xl font-bold">{{ stat.value }}</p>
        <p class="text-xs text-gray-400">{{ stat.label }}</p>
      </div>
    </div>

    <div class="space-y-3">
      <h2 class="text-lg font-bold">Accès rapide</h2>
      <div class="space-y-3">
        <NuxtLink
          v-for="link in quickLinks"
          :key="link.to"
          :to="link.to"
          class="flex items-center gap-4 rounded-2xl p-4 text-white transition-transform duration-200 hover:scale-[1.02] cursor-pointer"
          :class="link.color"
        >
          <Icon :name="link.icon" class="size-8 shrink-0" :class="link.color === 'bg-[#CCE8DD]' ? 'text-[#15D98B]' : 'text-white'" />
          <div>
            <p class="font-bold" :class="link.color === 'bg-[#CCE8DD]' ? 'text-black' : 'text-white'">{{ link.label }}</p>
            <p class="text-sm" :class="link.color === 'bg-[#CCE8DD]' ? 'text-gray-500' : 'text-white/80'">{{ link.description }}</p>
          </div>
          <Icon name="material-symbols:arrow-forward" class="ml-auto size-5" :class="link.color === 'bg-[#CCE8DD]' ? 'text-[#15D98B]' : 'text-white'" />
        </NuxtLink>
      </div>
    </div>

    <div class="space-y-3">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-bold">RDV du jour</h2>
        <NuxtLink to="/clinic/appointments" class="text-sm font-bold text-[#15D98B]">Tout voir</NuxtLink>
      </div>
      <div class="space-y-2">
        <div
          v-for="appt in upcomingAppointments"
          :key="appt.id"
          class="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm"
        >
          <div class="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#CCE8DD]">
            <p class="text-xs font-bold text-[#15D98B]">{{ appt.time }}</p>
          </div>
          <div>
            <p class="font-bold text-sm">{{ appt.owner }}</p>
            <p class="text-xs text-gray-400">{{ appt.animal }} — {{ appt.reason }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>