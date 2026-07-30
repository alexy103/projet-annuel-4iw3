<script setup lang="ts">
import type { Clinic } from "~/types/clinic";
import type { Veterinarian } from "~/types/veterinarian";

definePageMeta({
  layout: "default",
});

const { fetchClinics } = useClinics();
const { fetchByClinic, createVeterinarian, setPresence, deleteVeterinarian } =
  useVeterinarians();

const clinicId = ref<number | null>(null);
const veterinarians = ref<Veterinarian[]>([]);
const isLoading = ref(false);
const errorMessage = ref("");

const currentPage = ref(1);
const perPage = 5;

const showAddPopup = ref(false);
const newFirstName = ref("");
const newLastName = ref("");
const isSubmitting = ref(false);
const formError = ref("");

const totalPages = computed(() =>
  Math.max(1, Math.ceil(veterinarians.value.length / perPage)),
);

const paginated = computed(() =>
  veterinarians.value.slice(
    (currentPage.value - 1) * perPage,
    currentPage.value * perPage,
  ),
);

const loadVeterinarians = async () => {
  isLoading.value = true;
  errorMessage.value = "";
  try {
    const clinics = await fetchClinics();
    const clinic: Clinic | undefined = clinics[0];
    if (!clinic) return;
    clinicId.value = clinic.id;
    veterinarians.value = await fetchByClinic(clinic.id);
  } catch (error) {
    errorMessage.value =
      error instanceof Error
        ? error.message
        : "Impossible de charger les vétérinaires";
  } finally {
    isLoading.value = false;
  }
};

const addVeterinarian = async () => {
  if (!clinicId.value) return;
  formError.value = "";
  isSubmitting.value = true;
  try {
    const created = await createVeterinarian({
      first_name: newFirstName.value,
      last_name: newLastName.value,
      clinic_id: clinicId.value,
    });
    veterinarians.value.push(created);
    newFirstName.value = "";
    newLastName.value = "";
    showAddPopup.value = false;
  } catch (error) {
    formError.value =
      error instanceof Error ? error.message : "Ajout impossible";
  } finally {
    isSubmitting.value = false;
  }
};

const togglePresence = async (vet: Veterinarian) => {
  try {
    const updated = await setPresence(vet.id, !vet.is_present);
    vet.is_present = updated.is_present;
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : "Mise à jour impossible";
  }
};

const removeVeterinarian = async (vet: Veterinarian) => {
  try {
    await deleteVeterinarian(vet.id);
    veterinarians.value = veterinarians.value.filter((v) => v.id !== vet.id);
    if (currentPage.value > totalPages.value) {
      currentPage.value = totalPages.value;
    }
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : "Suppression impossible";
  }
};

onMounted(loadVeterinarians);
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <NuxtLink to="/clinic">
          <Icon name="material-symbols:arrow-back" class="size-6 text-black" />
        </NuxtLink>
        <h1 class="text-2xl font-bold">Nos vétérinaires</h1>
      </div>
      <button
        class="flex cursor-pointer items-center gap-2 rounded-full bg-[#15D98B] px-4 py-2 text-sm font-bold text-white transition-transform duration-200 hover:scale-[1.02]"
        @click="showAddPopup = true"
      >
        <Icon name="material-symbols:add-rounded" class="size-5" />
        Ajouter
      </button>
    </div>

    <p v-if="errorMessage" class="text-sm text-red-500">{{ errorMessage }}</p>
    <p v-if="isLoading" class="text-center text-sm text-gray-400">
      Chargement...
    </p>

    <div v-else class="space-y-4">
      <div
        v-for="vet in paginated"
        :key="vet.id"
        class="flex items-center gap-4 rounded-full bg-[#15D98B] px-4 py-3 text-white"
      >
        <div
          class="flex size-16 shrink-0 items-center justify-center rounded-full bg-gray-300"
        >
          <Icon name="material-symbols:person" class="size-8 text-white" />
        </div>
        <div class="flex-1">
          <p class="text-lg font-bold">
            {{ vet.first_name }} {{ vet.last_name }}
          </p>
          <p class="text-sm">{{ vet.is_present ? "Présent" : "Absent" }}</p>
        </div>
        <div class="flex flex-col gap-2">
          <button
            class="cursor-pointer rounded-full bg-white/20 px-3 py-1 text-xs font-bold transition-colors hover:bg-white/30"
            @click="togglePresence(vet)"
          >
            {{ vet.is_present ? "Marquer absent" : "Marquer présent" }}
          </button>
          <button
            class="cursor-pointer rounded-full bg-red-500 px-3 py-1 text-xs font-bold transition-colors hover:bg-red-600"
            @click="removeVeterinarian(vet)"
          >
            Supprimer
          </button>
        </div>
      </div>

      <p
        v-if="!isLoading && veterinarians.length === 0"
        class="text-center text-gray-400"
      >
        Aucun vétérinaire pour le moment.
      </p>
    </div>

    <div v-if="totalPages > 1" class="flex items-center justify-center gap-3">
      <button
        v-for="page in totalPages"
        :key="page"
        class="flex size-8 cursor-pointer items-center justify-center rounded-full text-sm font-bold transition-all duration-200 hover:scale-110"
        :class="
          page === currentPage
            ? 'bg-[#15D98B] text-white'
            : 'bg-gray-200 text-black'
        "
        @click="currentPage = page"
      >
        {{ page }}
      </button>
    </div>

    <BasePopup v-model="showAddPopup" fit>
      <form @submit.prevent="addVeterinarian" class="w-72 space-y-4">
        <p class="text-center font-bold">Ajouter un vétérinaire</p>
        <BaseInput v-model="newFirstName" label="Prénom" />
        <BaseInput v-model="newLastName" label="Nom" />
        <p v-if="formError" class="text-center text-sm text-red-500">
          {{ formError }}
        </p>
        <BaseButton
          type="submit"
          :disabled="isSubmitting"
          class="flex w-full justify-center"
        >
          {{ isSubmitting ? "Ajout..." : "Ajouter" }}
        </BaseButton>
      </form>
    </BasePopup>
  </div>
</template>
