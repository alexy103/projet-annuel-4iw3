<script setup lang="ts">
const userStore = useUserStore();

const showNewApt = ref(false);
const isReady = ref(false);

const profileLink = computed(() => {
  return userStore.userId ? `/profile/${userStore.userId}` : "";
});

onMounted(async () => {
  userStore.loadUserFromStorage();

  await userStore.fetchAnimals();

  isReady.value = true;
});
</script>

<template>
  <div>
    <div class="font-alt">
      <div class="relative flex items-center justify-between py-4">
        <NuxtLink to="/" class="absolute left-1/2 -translate-x-1/2 text-2xl">
          <h1>PawTracker</h1>
        </NuxtLink>

        <NuxtLink :to="profileLink">
          <Icon name="solar:user-outline" class="size-8 text-black" />
        </NuxtLink>

        <Icon
          name="solar:calendar-add-outline"
          class="ml-2 size-8 cursor-pointer text-black"
          @click="showNewApt = true"
        />
      </div>

      <ul
        v-if="isReady"
        class="-mx-4 flex items-center gap-2 overflow-x-auto px-4"
      >
        <li
          v-for="animal in userStore.animals"
          :key="animal.id"
          class="shrink-0"
        >
          <NuxtLink
            :to="'/animal/' + animal.id"
            class="flex h-16 w-16 items-center justify-center rounded-full bg-green-300 text-sm font-bold text-black"
          >
            <img
              v-if="animal.image"
              :src="animal.image"
              :alt="animal.name"
              class="h-16 w-16 rounded-full object-cover"
            />

            <span v-else>
              {{ animal.name.charAt(0).toUpperCase() }}
            </span>
          </NuxtLink>
        </li>

        <li class="shrink-0">
          <NuxtLink to="/add-animal">
            <button
              type="button"
              class="bg-grey-500 flex h-14 w-14 cursor-pointer items-center justify-center rounded-full text-sm font-bold text-black"
            >
              <Icon name="material-symbols:add-rounded" class="size-6" />
            </button>
          </NuxtLink>
        </li>
      </ul>
    </div>

    <BasePopup v-model="showNewApt" fit>
      <div class="w-full max-w-sm">
        <h2 class="mb-4 text-center font-bold">Prendre un rendez-vous</h2>

        <div class="mb-4 flex gap-4">
          <BaseInput label="Date" type="date" />
          <BaseInput label="Heure" type="time" />
        </div>

        <BaseSelect
          class="mb-4"
          id="species"
          label="Espèce"
          :options="['1', '2']"
          addClass="w-full"
        />

        <label class="mb-1 block text-center text-sm">Motif</label>
        <textarea
          class="input bg-background min-h-24 w-full resize-none rounded-xl! px-4 py-2 text-sm font-normal shadow placeholder:text-gray-400 focus:outline-none"
          rows="3"
        />

        <button
          type="button"
          class="text-background mt-4 flex w-full cursor-pointer items-center justify-center rounded-xl bg-green-700 py-1 font-bold shadow-lg transition-colors hover:bg-green-900"
        >
          Confirmer
        </button>
      </div>
    </BasePopup>
  </div>
</template>
