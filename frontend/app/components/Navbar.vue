<script setup lang="ts">
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
  </div>
</template>
