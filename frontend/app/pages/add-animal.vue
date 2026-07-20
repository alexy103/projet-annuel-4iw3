<script setup lang="ts">
import {
  animalBreedsBySpecies,
  type AnimalBreed,
  type AnimalGender,
} from "~/types/animal";

type Species = {
  id: number;
  name: string;
};

type BreedSpeciesName = keyof typeof animalBreedsBySpecies;

const userStore = useUserStore();

const profilePicture = ref<string | null>(null);
const profilePictureFile = ref<File | null>(null);

const name = ref("");
const gender = ref<AnimalGender | null>(null);

const speciesList = ref<Species[]>([]);
const species = ref<number | null>(null);

const speciesOptions = computed(() => {
  return speciesList.value.map((species) => species.name);
});

const selectedSpeciesName = computed(() => {
  return (
    speciesList.value.find((item) => item.id === species.value)?.name ?? null
  );
});

const breedOptions = computed<AnimalBreed[]>(() => {
  const speciesName = selectedSpeciesName.value;

  if (!speciesName || !(speciesName in animalBreedsBySpecies)) {
    return [];
  }

  return [...animalBreedsBySpecies[speciesName as BreedSpeciesName]];
});

const hasBreedOptions = computed(() => {
  return breedOptions.value.length > 0;
});

const isSpeciesEmpty = computed(() => {
  return species.value === null;
});

const getDefaultBreed = (speciesName: string | null): AnimalBreed | null => {
  if (!speciesName || !(speciesName in animalBreedsBySpecies)) {
    return null;
  }

  return animalBreedsBySpecies[speciesName as BreedSpeciesName][0] ?? null;
};

const breed = ref<string | null>(null);

const birthDate = ref("");
const adoptionDate = ref("");
const weight = ref("");
const height = ref("");

const errorMessage = ref("");
const isLoading = ref(false);
const isLoadingSpecies = ref(false);

const getAuthHeaders = () => {
  const config = useRuntimeConfig();
  const accessToken = localStorage.getItem("accessToken");

  return {
    "x-api-key": config.public.apiKey,
    Authorization: `Bearer ${accessToken}`,
  };
};

const fetchSpecies = async () => {
  errorMessage.value = "";
  isLoadingSpecies.value = true;

  try {
    const config = useRuntimeConfig();

    const response = await fetch(`${config.public.apiUrl}/species`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || "Erreur lors du chargement des espèces");
    }

    speciesList.value = result.data;
  } catch (error) {
    errorMessage.value =
      error instanceof Error
        ? error.message
        : "Erreur lors du chargement des espèces";
  } finally {
    isLoadingSpecies.value = false;
  }
};

watch(selectedSpeciesName, (newSpeciesName) => {
  breed.value = getDefaultBreed(newSpeciesName);
});

onMounted(async () => {
  await fetchSpecies();
});

onUnmounted(() => {
  if (profilePicture.value) {
    URL.revokeObjectURL(profilePicture.value);
  }
});

const handleProfilePictureUpload = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  if (!file) return;

  if (profilePicture.value) {
    URL.revokeObjectURL(profilePicture.value);
  }

  profilePictureFile.value = file;
  profilePicture.value = URL.createObjectURL(file);
};

const handleSpeciesChange = (speciesName: string | number | null) => {
  const selectedSpecies = speciesList.value.find(
    (item) => item.name === String(speciesName),
  );

  species.value = selectedSpecies?.id ?? null;
};

const handleAddAnimal = async () => {
  errorMessage.value = "";

  if (!name.value || !gender.value || !species.value || !breed.value) {
    errorMessage.value = "Tous les champs obligatoires doivent être remplis";
    return;
  }

  if (!birthDate.value || !adoptionDate.value) {
    errorMessage.value = "Les dates sont obligatoires";
    return;
  }

  const parsedWeight = weight.value ? Number(weight.value) : null;
  const parsedHeight = height.value ? Number(height.value) : null;

  if (
    parsedWeight !== null &&
    (!Number.isInteger(parsedWeight) || parsedWeight <= 0)
  ) {
    errorMessage.value = "Le poids doit etre un entier strictement positif";
    return;
  }

  if (
    parsedHeight !== null &&
    (!Number.isInteger(parsedHeight) || parsedHeight <= 0)
  ) {
    errorMessage.value = "La taille doit etre un entier strictement positif";
    return;
  }

  isLoading.value = true;

  try {
    const config = useRuntimeConfig();

    const createResponse = await fetch(`${config.public.apiUrl}/animals`, {
      method: "POST",
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name.value,
        breed: breed.value,
        birth_date: birthDate.value,
        adoption_date: adoptionDate.value,
        sex: gender.value === "male",
        species_id: species.value,
        is_sterilized: false,
        is_shared: false,
        is_deceased: false,
      }),
    });

    const createResult = await createResponse.json();

    if (!createResponse.ok || !createResult.success) {
      throw new Error(
        createResult.error || "Erreur lors de l'ajout de l'animal",
      );
    }

    const animalId = createResult.data.id;

    const measurementRequests: Promise<Response>[] = [];

    if (parsedWeight !== null) {
      measurementRequests.push(
        fetch(`${config.public.apiUrl}/weight-records`, {
          method: "POST",
          headers: {
            ...getAuthHeaders(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            date: adoptionDate.value,
            weight: parsedWeight,
            animal_id: animalId,
          }),
        }),
      );
    }

    if (parsedHeight !== null) {
      measurementRequests.push(
        fetch(`${config.public.apiUrl}/height-records`, {
          method: "POST",
          headers: {
            ...getAuthHeaders(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            date: adoptionDate.value,
            height: parsedHeight,
            animal_id: animalId,
          }),
        }),
      );
    }

    if (measurementRequests.length > 0) {
      const measurementResponses = await Promise.all(measurementRequests);
      const measurementResults = await Promise.all(
        measurementResponses.map(async (response) => {
          const contentType = response.headers.get("content-type");
          const body = contentType?.includes("application/json")
            ? await response.json()
            : null;

          return { response, body };
        }),
      );

      const failedMeasurement = measurementResults.find(
        ({ response, body }) => !response.ok || !body?.success,
      );

      if (failedMeasurement) {
        throw new Error(
          failedMeasurement.body?.error ||
            "L'animal a ete cree, mais les mesures initiales n'ont pas pu etre enregistrees",
        );
      }
    }

    if (profilePictureFile.value) {
      const formData = new FormData();

      formData.append("profile_picture", profilePictureFile.value);

      const uploadResponse = await fetch(
        `${config.public.apiUrl}/animals/${animalId}/profile-picture`,
        {
          method: "PATCH",
          headers: getAuthHeaders(),
          body: formData,
        },
      );

      const contentType = uploadResponse.headers.get("content-type");
      const uploadResult = contentType?.includes("application/json")
        ? await uploadResponse.json()
        : null;

      if (!uploadResponse.ok || !uploadResult?.success) {
        throw new Error(
          uploadResult?.error ||
            "L'animal a été créé, mais la photo n'a pas pu être envoyée",
        );
      }
    }

    await userStore.fetchAnimals();

    await navigateTo("/");
  } catch (error) {
    errorMessage.value =
      error instanceof Error
        ? error.message
        : "Erreur lors de l'ajout de l'animal";
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <form class="space-y-6" @submit.prevent="handleAddAnimal">
    <h1 class="mt-2 text-2xl font-bold">Qui rejoint la famille ?</h1>

    <div class="grid grid-cols-2 items-start gap-4">
      <div class="w-full max-w-48 justify-self-center">
        <BaseInput v-model="name" label="Nom" />
      </div>

      <div class="flex items-center justify-center gap-2">
        <button
          type="button"
          class="flex size-12 cursor-pointer items-center justify-center rounded-full"
          :class="gender === 'male' ? 'bg-green-300' : 'bg-grey-500'"
          @click="gender = 'male'"
        >
          <Icon name="material-symbols:male" class="w-full p-4 text-blue-700" />
        </button>

        <button
          type="button"
          class="flex size-12 cursor-pointer items-center justify-center rounded-full"
          :class="gender === 'female' ? 'bg-green-300' : 'bg-grey-500'"
          @click="gender = 'female'"
        >
          <Icon name="material-symbols:female" class="text-pink w-full p-4" />
        </button>
      </div>
    </div>

    <div class="grid grid-cols-2 items-start gap-4">
      <div class="w-full max-w-48 justify-self-center">
        <BaseSelect
          id="species"
          label="Espèce"
          :model-value="selectedSpeciesName"
          :options="speciesOptions"
          :disabled="isLoadingSpecies"
          addClass="w-full"
          @update:model-value="handleSpeciesChange"
        />
      </div>

      <div class="w-full max-w-48 justify-self-center">
        <BaseSelect
          v-if="hasBreedOptions"
          id="breed"
          label="Race"
          v-model="breed"
          :options="breedOptions"
          :disabled="isSpeciesEmpty"
          addClass="w-full"
        />

        <BaseInput
          v-else
          v-model="breed"
          label="Race"
          :disabled="isSpeciesEmpty"
        />
      </div>
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
        <BaseInput v-model="birthDate" type="date" />
      </div>

      <div class="flex items-center justify-between">
        <p>Date d'adoption</p>
        <BaseInput v-model="adoptionDate" type="date" />
      </div>

      <div class="flex items-center justify-between">
        <p>Poids (optionnel)</p>
        <div class="flex gap-2">
          <BaseInput v-model="weight" type="number" small />
          <span class="min-w-5">kg</span>
        </div>
      </div>

      <div class="flex items-center justify-between">
        <p>Taille (optionnel)</p>
        <div class="flex gap-2">
          <BaseInput v-model="height" type="number" small />
          <span class="min-w-5">cm</span>
        </div>
      </div>
    </div>

    <p v-if="errorMessage" class="text-center text-sm text-red-500">
      {{ errorMessage }}
    </p>

    <BaseButton class="flex justify-center" type="submit">
      {{ isLoading ? "Ajout..." : "Ajouter" }}
    </BaseButton>
  </form>
</template>
