<script setup lang="ts">
const showNewAnimalForm = ref(false);
</script>

<template>
  <div>
    <div class="font-alt">
      <div class="relative flex items-center justify-between py-4">
        <NuxtLink to="/" class="absolute left-1/2 -translate-x-1/2 text-2xl">
          <h1>PawTracker</h1>
        </NuxtLink>
        <Icon name="solar:user-outline" class="size-8 text-black" />
        <Icon
          name="solar:calendar-add-outline"
          class="ml-2 size-8 text-black"
        />
      </div>
      <ul class="-mx-4 flex items-center gap-2 overflow-x-auto px-4">
        <li class="shrink-0">
          <NuxtLink
            to="/animal/1"
            class="flex h-16 w-16 items-center justify-center rounded-full bg-green-300 text-sm font-bold text-black"
          >
            <img
              src="/kyky.jpg"
              alt=""
              class="h-16 w-16 rounded-full object-cover"
            />
          </NuxtLink>
        </li>
        <li v-for="i in 10" class="shrink-0">
          <NuxtLink
            to="/animal/1"
            class="flex h-16 w-16 items-center justify-center rounded-full bg-green-300 text-sm font-bold text-black"
          >
            <img
              src="/scooby.png"
              alt=""
              class="h-16 w-16 rounded-full object-cover"
            />
          </NuxtLink>
        </li>
        <li>
          <button
            type="button"
            class="bg-grey-500 flex h-14 w-14 cursor-pointer items-center justify-center rounded-full text-sm font-bold text-black"
            @click="showNewAnimalForm = true"
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
