<script setup lang="ts">
definePageMeta({
  layout: "default",
});

const currentPage = ref(1);
const perPage = 5;

const veterinarians = ref([
  { id: 1, name: "Dr Dupont", specialty: "Chirurgie", cabinet: "Cabinet A", availability: "Lun - Ven", contact: "01 23 45 67 89", photo: null },
  { id: 2, name: "Dr Martin", specialty: "Dermatologie", cabinet: "Cabinet B", availability: "Mar - Sam", contact: "01 23 45 67 90", photo: null },
  { id: 3, name: "Dr Bernard", specialty: "Cardiologie", cabinet: "Cabinet A", availability: "Lun - Mer", contact: "01 23 45 67 91", photo: null },
  { id: 4, name: "Dr Leroy", specialty: "Ophtalmologie", cabinet: "Cabinet C", availability: "Mer - Ven", contact: "01 23 45 67 92", photo: null },
  { id: 5, name: "Dr Moreau", specialty: "Orthopédie", cabinet: "Cabinet B", availability: "Lun - Ven", contact: "01 23 45 67 93", photo: null },
  { id: 6, name: "Dr Simon", specialty: "Neurologie", cabinet: "Cabinet A", availability: "Mar - Jeu", contact: "01 23 45 67 94", photo: null },
  { id: 7, name: "Dr Laurent", specialty: "Oncologie", cabinet: "Cabinet C", availability: "Lun - Sam", contact: "01 23 45 67 95", photo: null },
]);

const totalPages = computed(() => Math.ceil(veterinarians.value.length / perPage));

const paginated = computed(() =>
  veterinarians.value.slice((currentPage.value - 1) * perPage, currentPage.value * perPage)
);
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center gap-3">
      <NuxtLink to="/clinic">
        <Icon name="material-symbols:arrow-back" class="size-6 text-black" />
      </NuxtLink>
      <h1 class="text-2xl font-bold">Nos vétérinaires</h1>
    </div>

    <div class="space-y-4">
      <div
        v-for="vet in paginated"
        :key="vet.id"
        class="flex items-center gap-4 rounded-full bg-[#15D98B] px-4 py-3 text-white"
      >
        <div class="size-16 shrink-0 overflow-hidden rounded-full bg-gray-300">
          <img
            v-if="vet.photo"
            :src="vet.photo"
            :alt="vet.name"
            class="size-full object-cover"
          />
          <div v-else class="flex size-full items-center justify-center">
            <Icon name="material-symbols:person" class="size-8 text-white" />
          </div>
        </div>
        <div class="flex-1">
          <p class="text-lg font-bold">{{ vet.name }}</p>
          <p class="text-sm">Spécialité : {{ vet.specialty }}</p>
          <p class="text-sm">Cabinet : {{ vet.cabinet }}</p>
          <p class="text-sm">Disponibilités : {{ vet.availability }}</p>
          <p class="text-sm">Contact : {{ vet.contact }}</p>
        </div>
      </div>
    </div>

    <div class="flex items-center justify-center gap-3">
      <button
        v-for="page in totalPages"
        :key="page"
        class="flex size-8 items-center justify-center rounded-full text-sm font-bold transition-colors"
        :class="page === currentPage ? 'bg-[#15D98B] text-white' : 'bg-gray-200 text-black'"
        @click="currentPage = page"
      >
        {{ page }}
      </button>
    </div>
  </div>
</template>