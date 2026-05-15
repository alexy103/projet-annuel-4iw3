<script setup lang="ts">
import {
  animalBreedsBySpecies,
  animalSpeciesOptions,
  type AnimalBreed,
  type AnimalGender,
  type AnimalSpecies,
} from "~/types/animal";

const profilePicture = ref<string | null>(null);

const handleProfilePictureUpload = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  if (!file) return;

  profilePicture.value = URL.createObjectURL(file);
};

const gender = ref<AnimalGender | null>(null);

const speciesOptions = animalSpeciesOptions;

const species = ref<AnimalSpecies | null>(null);

const breedOptions = computed<AnimalBreed[]>(() => {
  if (!species.value) return [];

  return [...animalBreedsBySpecies[species.value]];
});

const isSpeciesEmpty = computed(() => {
  return species.value === null;
});

const getDefaultBreed = (species: AnimalSpecies | null): AnimalBreed | null => {
  if (!species) return null;

  return animalBreedsBySpecies[species][0] ?? null;
};

const breed = ref<AnimalBreed | null>(getDefaultBreed(species.value));

watch(species, (newSpecies) => {
  breed.value = getDefaultBreed(newSpecies);
});
</script>

<template>
  <div class="space-y-6">
    <h1 class="mt-2 text-2xl font-bold">Qui rejoint la famille ?</h1>

    <div class="flex items-center justify-around gap-4">
      <BaseInput label="Nom" />
      <div class="flex items-center justify-between gap-2">
        <button
          class="flex size-12 cursor-pointer items-center justify-center rounded-full"
          :class="gender === 'male' ? 'bg-green-300' : 'bg-grey-500'"
          @click="gender = 'male'"
        >
          <Icon name="material-symbols:male" class="w-full p-4 text-blue-700" />
        </button>
        <button
          class="flex size-12 cursor-pointer items-center justify-center rounded-full"
          :class="gender === 'female' ? 'bg-green-300' : 'bg-grey-500'"
          @click="gender = 'female'"
        >
          <Icon name="material-symbols:female" class="text-pink w-full p-4" />
        </button>
      </div>
    </div>

    <div class="flex items-center justify-around gap-4">
      <BaseSelect
        id="species"
        label="Espèce"
        v-model="species"
        :options="speciesOptions"
      />

      <BaseSelect
        id="breed"
        label="Race"
        v-model="breed"
        :options="breedOptions"
        :disabled="isSpeciesEmpty"
      />
    </div>

    <div class="space-y-2">
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

        <Icon
          v-else
          name="material-symbols:upload"
          class="size-10 text-black"
        />
      </label>

      <input
        id="profile-picture"
        type="file"
        class="hidden"
        accept="image/*"
        @change="handleProfilePictureUpload"
      />
    </div>

    <div class="space-y-2">
      <h2 class="text-xl font-bold">Quelques informations</h2>

      <div class="flex items-center justify-between">
        <p>Date de naissance</p>
        <BaseInput type="date" />
      </div>

      <div class="flex items-center justify-between">
        <p>Date d'adoption</p>
        <BaseInput type="date" />
      </div>

      <div class="flex items-center justify-between">
        <p>Poids</p>
        <div class="flex gap-2">
          <BaseInput type="number" small />
          <span class="min-w-5">kg</span>
        </div>
      </div>

      <div class="flex items-center justify-between">
        <p>Taille</p>
        <div class="flex gap-2">
          <BaseInput type="number" small />
          <span class="min-w-5">cm</span>
        </div>
      </div>
    </div>

    <BaseButton class="flex justify-center">Terminer</BaseButton>
  </div>
</template>
