<script setup lang="ts">
import type { Clinic } from "~/types/clinic";

definePageMeta({
  layout: "default",
});

const { fetchClinics, updateClinic } = useClinics();

const clinicId = ref<number | null>(null);
const form = ref({
  name: "",
  address: "",
  city: "",
  postcode: "",
  phone_number: "",
});

const isLoading = ref(false);
const isSaving = ref(false);
const saved = ref(false);
const errorMessage = ref("");

const loadClinic = async () => {
  isLoading.value = true;
  errorMessage.value = "";
  try {
    const clinics = await fetchClinics();
    const clinic: Clinic | undefined = clinics[0];
    if (!clinic) return;
    clinicId.value = clinic.id;
    form.value = {
      name: clinic.name,
      address: clinic.address,
      city: clinic.city,
      postcode: clinic.postcode,
      phone_number: clinic.phone_number,
    };
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : "Impossible de charger la clinique";
  } finally {
    isLoading.value = false;
  }
};

const save = async () => {
  if (!clinicId.value) return;
  errorMessage.value = "";
  isSaving.value = true;
  try {
    await updateClinic(clinicId.value, { ...form.value });
    saved.value = true;
    setTimeout(() => (saved.value = false), 2500);
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : "Enregistrement impossible";
  } finally {
    isSaving.value = false;
  }
};

onMounted(loadClinic);
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center gap-3">
      <NuxtLink to="/clinic">
        <Icon name="material-symbols:arrow-back" class="size-6 text-black" />
      </NuxtLink>
      <h1 class="text-2xl font-bold">Paramètres de la clinique</h1>
    </div>

    <p v-if="isLoading" class="text-center text-sm text-gray-400">
      Chargement...
    </p>

    <div v-else class="space-y-4">
      <h2 class="text-lg font-bold">Informations générales</h2>

      <div class="space-y-3">
        <div class="space-y-1">
          <label class="text-sm text-gray-500">Nom de la clinique</label>
          <input
            v-model="form.name"
            type="text"
            class="w-full rounded-full border border-gray-300 px-4 py-2 text-sm outline-none focus:border-[#15D98B]"
          />
        </div>
        <div class="space-y-1">
          <label class="text-sm text-gray-500">Adresse</label>
          <input
            v-model="form.address"
            type="text"
            class="w-full rounded-full border border-gray-300 px-4 py-2 text-sm outline-none focus:border-[#15D98B]"
          />
        </div>
        <div class="space-y-1">
          <label class="text-sm text-gray-500">Ville</label>
          <input
            v-model="form.city"
            type="text"
            class="w-full rounded-full border border-gray-300 px-4 py-2 text-sm outline-none focus:border-[#15D98B]"
          />
        </div>
        <div class="space-y-1">
          <label class="text-sm text-gray-500">Code postal</label>
          <input
            v-model="form.postcode"
            type="text"
            class="w-full rounded-full border border-gray-300 px-4 py-2 text-sm outline-none focus:border-[#15D98B]"
          />
        </div>
        <div class="space-y-1">
          <label class="text-sm text-gray-500">Téléphone</label>
          <input
            v-model="form.phone_number"
            type="tel"
            class="w-full rounded-full border border-gray-300 px-4 py-2 text-sm outline-none focus:border-[#15D98B]"
          />
        </div>
      </div>
    </div>

    <p v-if="errorMessage" class="text-center text-sm text-red-500">
      {{ errorMessage }}
    </p>

    <button
      :disabled="isSaving || isLoading"
      class="w-full rounded-full bg-[#15D98B] py-3 font-bold text-white transition-transform duration-200 hover:scale-[1.02] disabled:opacity-50"
      @click="save"
    >
      {{ saved ? '✓ Enregistré !' : isSaving ? 'Enregistrement...' : 'Enregistrer les modifications' }}
    </button>
  </div>
</template>
