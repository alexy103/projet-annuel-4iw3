<script setup lang="ts">
type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

type Animal = {
  id: number;
  name: string;
  breed: string;
  birth_date: string;
  adoption_date: string;
  sex: string;
  species_id: number;
  color?: string | null;
  is_sterilized?: boolean;
  allergies?: string | null;
  is_shared?: boolean;
  is_deceased?: boolean;
  microship_id?: string | null;
  profile_picture?: string | null;
};

type Species = {
  id: number;
  name: string;
};

const config = useRuntimeConfig();
const route = useRoute();
const router = useRouter();

const showInfo = ref(false);
const showQr = ref(false);
const showEdit = ref(false);

const animal = ref<Animal | null>(null);
const species = ref<Species[]>([]);

const isLoading = ref(true);
const isSubmitting = ref(false);
const errorMessage = ref("");

const editName = ref("");
const editSpecies = ref("");
const editBreed = ref("");
const editBirth = ref("");
const editPicture = ref<File | null>(null);

const animalId = computed(() => {
  const param = route.params.animalId || route.params.id;
  return Array.isArray(param) ? param[0] : param;
});

const authHeaders = computed(() => {
  const headers: Record<string, string> = {
    "x-api-key": config.public.apiKey,
  };

  if (import.meta.client) {
    const accessToken = localStorage.getItem("accessToken");

    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }
  }

  return headers;
});

const animalPictureUrl = computed(() => {
  const path = animal.value?.profile_picture;

  if (!path) {
    return "/kyky.jpg";
  }

  if (path.startsWith("http")) {
    return path;
  }

  return `${config.public.backendUrl}${path}`;
});

const qrValue = computed(() => {
  if (import.meta.client) {
    return window.location.href;
  }

  return "";
});

const animalAge = computed(() => {
  if (!animal.value?.birth_date) {
    return "";
  }

  const birthDate = new Date(animal.value.birth_date);
  const today = new Date();

  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();

  if (today.getDate() < birthDate.getDate()) {
    months--;
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  if (years <= 0) {
    return `${months} mois`;
  }

  if (months <= 0) {
    return `${years} an${years > 1 ? "s" : ""}`;
  }

  return `${years} an${years > 1 ? "s" : ""} et ${months} mois`;
});

const sexIcon = computed(() => {
  if (animal.value?.sex === "female") {
    return "material-symbols:female";
  }

  return "material-symbols:male";
});

const sexIconClass = computed(() => {
  if (animal.value?.sex === "female") {
    return "size-6 text-pink-700";
  }

  return "size-6 text-blue-700";
});

const formatDate = (date?: string) => {
  if (!date) {
    return "";
  }

  return new Date(date).toLocaleDateString("fr-FR");
};

const fetchCurrentAnimal = async () => {
  if (!animalId.value) {
    errorMessage.value = "Animal introuvable.";
    return;
  }

  try {
    const response = await $fetch<ApiResponse<Animal>>(
      `${config.public.apiUrl}/animals/${animalId.value}`,
      {
        headers: authHeaders.value,
      },
    );

    animal.value = response.data;

    editName.value = response.data.name;
    editSpecies.value = String(response.data.species_id);
    editBreed.value = response.data.breed;
    editBirth.value = response.data.birth_date.slice(0, 10);
  } catch (error) {
    console.error(error);
    errorMessage.value = "Impossible de charger cet animal.";
  }
};

const fetchSpecies = async () => {
  try {
    const response = await $fetch<ApiResponse<Species[]>>(
      `${config.public.apiUrl}/species`,
      {
        headers: authHeaders.value,
      },
    );

    species.value = response.data;
  } catch (error) {
    console.error(error);
    errorMessage.value = "Impossible de charger les espèces.";
  }
};

const submitEdit = async () => {
  if (!animal.value || !animalId.value) {
    return;
  }

  try {
    isSubmitting.value = true;
    errorMessage.value = "";

    await $fetch(`${config.public.apiUrl}/animals/${animalId.value}`, {
      method: "PUT",
      headers: {
        ...authHeaders.value,
        "Content-Type": "application/json",
      },
      body: {
        name: editName.value,
        breed: editBreed.value,
        birth_date: editBirth.value,
        adoption_date: animal.value.adoption_date,
        sex: animal.value.sex,
        species_id: Number(editSpecies.value),
        color: animal.value.color,
        is_sterilized: animal.value.is_sterilized,
        allergies: animal.value.allergies,
        is_shared: animal.value.is_shared,
        is_deceased: animal.value.is_deceased,
        microship_id: animal.value.microship_id,
      },
    });

    if (editPicture.value) {
      const formData = new FormData();

      formData.append("profile_picture", editPicture.value);

      await $fetch(
        `${config.public.apiUrl}/animals/${animalId.value}/profile-picture`,
        {
          method: "PATCH",
          headers: authHeaders.value,
          body: formData,
        },
      );
    }

    await fetchCurrentAnimal();

    editPicture.value = null;
    showEdit.value = false;
  } catch (error) {
    console.error(error);
    errorMessage.value = "Impossible de modifier cet animal.";
  } finally {
    isSubmitting.value = false;
  }
};

const deleteAnimal = async () => {
  if (!animalId.value) {
    return;
  }

  try {
    isSubmitting.value = true;
    errorMessage.value = "";

    await $fetch(`${config.public.apiUrl}/animals/${animalId.value}`, {
      method: "DELETE",
      headers: authHeaders.value,
    });

    await router.push("/");
  } catch (error) {
    console.error(error);
    errorMessage.value = "Impossible de supprimer cet animal.";
  } finally {
    isSubmitting.value = false;
  }
};

const handlePictureChange = (event: Event) => {
  const input = event.target as HTMLInputElement;

  editPicture.value = input.files?.[0] || null;
};

onMounted(async () => {
  isLoading.value = true;

  await Promise.all([fetchCurrentAnimal(), fetchSpecies()]);

  isLoading.value = false;
});
</script>

<template>
  <div v-if="isLoading">Chargement...</div>

  <div v-else-if="errorMessage && !animal">
    <p class="text-center text-red-600">{{ errorMessage }}</p>
  </div>

  <div v-else-if="animal">
    <figure class="mb-4 flex flex-col items-center justify-center">
      <div class="mb-2 flex flex-col items-center">
        <div class="flex items-center">
          <h1 class="text-2xl font-bold">{{ animal.name }}</h1>
          <Icon :name="sexIcon" :class="sexIconClass" />
        </div>

        <span class="text-grey-700 italic">{{ animal.breed }}</span>
      </div>

      <div class="relative mb-5">
        <img
          :src="animalPictureUrl"
          :alt="animal.name"
          class="size-50 rounded-full object-cover"
        />

        <ul>
          <li
            class="absolute top-0 -right-3 flex w-fit cursor-pointer items-center justify-center rounded-full bg-green-300 p-1"
            @click="showQr = true"
          >
            <Icon
              name="material-symbols:qr-code-rounded"
              class="size-6 text-black"
            />
          </li>

          <li
            class="absolute -right-3 bottom-0 flex w-fit cursor-pointer items-center justify-center rounded-full bg-green-300 p-1"
            @click="showInfo = true"
          >
            <Icon
              name="material-symbols:info-i-rounded"
              class="size-6 text-black"
            />
          </li>

          <li
            class="absolute bottom-0 -left-3 flex w-fit cursor-pointer items-center justify-center rounded-full bg-green-300 p-1"
            @click="showEdit = true"
          >
            <Icon
              name="material-symbols:edit-outline-rounded"
              class="size-6 text-black"
            />
          </li>
        </ul>
      </div>

      <div class="flex items-center gap-1">
        <Icon name="material-symbols:calendar-today-rounded" class="size-6" />
        <p>{{ animalAge }}</p>
      </div>
    </figure>

    <BaseSection title="À venir" action="Tout voir" link="/calendar">
      <div class="-mx-4 flex gap-2 overflow-x-auto px-4">
        <Appointment v-for="i in 4" :key="i" />
      </div>
    </BaseSection>

    <div class="md:flex md:items-stretch md:gap-16">
      <BaseSection title="Carnet de santé" color="blue">
        <div class="grid grid-cols-2 justify-items-center gap-4 md:w-fit">
          <AnimalHealthGraph type="weight" />
          <AnimalHealthData type="weight" />
          <AnimalHealthData type="size" />
          <AnimalHealthGraph type="size" />
        </div>
      </BaseSection>

      <BaseSection
        title="Évolution"
        action="Nouvelle mesure"
        plus
        class="md:flex md:flex-1 md:flex-col md:items-stretch"
      >
        <div class="md:flex md:flex-1 md:flex-col md:items-stretch">
          <div class="bg-grey-500 mb-2 h-40 w-full rounded-xl md:flex-1"></div>

          <AnimalStatsToggle
            class="mx-auto"
            left-label="Nouvelle mesure"
            right-label="Ancienne mesure"
          />
        </div>
      </BaseSection>
    </div>

    <BaseSection title="Images" color="blue">
      <div class="grid grid-cols-2 gap-3">
        <img v-for="i in 4" :key="i" src="/kyky2.jpg" alt="" />
      </div>
    </BaseSection>
  </div>

  <BasePopup v-model="showInfo">
    <h2 class="mb-2 text-center font-bold">Informations supplémentaires</h2>

    <p>Date de naissance : {{ formatDate(animal?.birth_date) }}</p>
    <p>Date d'adoption : {{ formatDate(animal?.adoption_date) }}</p>

    <button
      class="button-sm mx-auto mt-4 border shadow"
      :disabled="isSubmitting"
      @click="deleteAnimal"
    >
      <Icon
        name="material-symbols:add-2-rounded"
        class="text-red size-6 rotate-45"
      />
      Supprimer cet animal
    </button>
  </BasePopup>

  <BasePopup v-model="showQr" fit>
    <div class="flex w-full items-center justify-center">
      <div class="size-64 h-fit lg:size-80">
        <Qrcode :value="qrValue" />
      </div>
    </div>
  </BasePopup>

  <BasePopup v-model="showEdit">
    <form @submit.prevent="submitEdit">
      <h2 class="mb-2 text-center font-bold">Modifier les informations</h2>

      <p v-if="errorMessage" class="mb-2 text-center text-sm text-red-600">
        {{ errorMessage }}
      </p>

      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-1">
          <label for="name" class="text-sm font-medium">Nom</label>
          <input
            id="name"
            v-model="editName"
            type="text"
            class="border-grey-300 rounded-lg border bg-white px-3 py-2 focus:border-green-700 focus:outline-none"
          />
        </div>

        <div class="flex flex-col gap-1">
          <label for="species" class="text-sm font-medium">Espèce</label>
          <select
            id="species"
            v-model="editSpecies"
            class="border-grey-300 rounded-lg border bg-white px-3 py-2 focus:border-green-700 focus:outline-none"
          >
            <option
              v-for="specie in species"
              :key="specie.id"
              :value="String(specie.id)"
            >
              {{ specie.name }}
            </option>
          </select>
        </div>

        <div class="flex flex-col gap-1">
          <label for="breed" class="text-sm font-medium">Race</label>
          <input
            id="breed"
            v-model="editBreed"
            type="text"
            class="border-grey-300 rounded-lg border bg-white px-3 py-2 focus:border-green-700 focus:outline-none"
          />
        </div>

        <!-- birth date -->
        <div class="flex flex-col gap-1">
          <label for="birth" class="text-sm font-medium">
            Date de naissance
          </label>
          <input
            id="birth"
            v-model="editBirth"
            type="date"
            class="border-grey-300 rounded-lg border bg-white px-3 py-2 focus:border-green-700 focus:outline-none"
          />
        </div>

        <div class="flex flex-col gap-1">
          <label for="picture" class="text-sm font-medium">
            Nouvelle photo
          </label>
          <input
            id="picture"
            type="file"
            accept="image/*"
            class="border-grey-300 rounded-lg border bg-white px-3 py-2 focus:border-green-700 focus:outline-none"
            @change="handlePictureChange"
          />
        </div>

        <button
          type="submit"
          class="cursor-pointer rounded-lg bg-green-700 px-4 py-2 font-medium text-white transition-colors hover:bg-green-900 disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="isSubmitting"
        >
          {{ isSubmitting ? "Enregistrement..." : "Enregistrer" }}
        </button>
      </div>
    </form>
  </BasePopup>
</template>
