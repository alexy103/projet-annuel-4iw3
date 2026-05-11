<script setup lang="ts">
const { showNewAnimalForm, openNewAnimalForm } = useNewAnimalForm();
const id = 1;

const userStore = useUserStore();
</script>

<template>
  <div>
    <div class="font-alt">
      <div class="relative flex items-center justify-between py-4">
        <NuxtLink to="/" class="absolute left-1/2 -translate-x-1/2 text-2xl">
          <h1>PawTracker</h1>
        </NuxtLink>
        <NuxtLink :to="'/profile/' + id">
          <Icon name="solar:user-outline" class="size-8 text-black" />
        </NuxtLink>
        <Icon
          name="solar:calendar-add-outline"
          class="ml-2 size-8 text-black"
        />
      </div>
      <ul
        v-if="userStore.animals.length"
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
              :src="animal.image"
              alt=""
              class="h-16 w-16 rounded-full object-cover"
            />
          </NuxtLink>
        </li>
        <li>
          <button
            type="button"
            class="bg-grey-500 flex h-14 w-14 cursor-pointer items-center justify-center rounded-full text-sm font-bold text-black"
            @click="openNewAnimalForm"
          >
            <Icon name="material-symbols:add-rounded" class="size-6" />
          </button>
        </li>
      </ul>
    </div>

    <BasePopup v-model="showNewAnimalForm">
      <h2 class="mb-2 text-center font-bold">Ajouter un nouvel animal</h2>
      <form action="" class="space-y-2">
        <BaseInput label="Nom" placeholder="Kyky" />
        <BaseInput label="Espèce" placeholder="Chat" />
        <BaseInput label="Race" placeholder="European shorthair" />
        <BaseInput
          label="Date de naissance"
          placeholder="01/01/2020"
          type="date"
        />
      </form>

      <button class="button-sm mx-auto mt-4 border shadow">
        <Icon
          name="material-symbols:add-rounded"
          class="size-6 text-green-500"
        />
        Ajouter
      </button>
    </BasePopup>
  </div>
</template>
