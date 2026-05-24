<script setup lang="ts">
defineProps<{
  animal?: string;
  today?: boolean;
}>();
</script>

<template>
  <NuxtLink
    v-if="animal"
    to="/appointment/1"
    class="flex w-full items-center rounded-xl bg-green-300 px-3 py-2"
  >
    <p class="text-lg font-bold">Scooby</p>
    <div class="flex-1 text-center">
      <p v-if="today" class="font-bold">14h30</p>
      <p v-else class="font-bold">15/07/2026</p>
      <p>Clinique Paul Picquet</p>
    </div>
    <p>Vaccin</p>
  </NuxtLink>
  <NuxtLink v-else to="/appointment/1" class="rounded-xl">
    <article class="relative w-45 shrink-0 rounded-xl bg-green-300 p-3">
      <Icon
        name="material-symbols:arrow-right-alt-rounded"
        class="absolute top-3 right-2 size-6"
      />

      <h1 class="font-bold">Vaccin</h1>
      <span class="italic">14/10/2026</span>

      <p class="mt-5">Clinique Paul Picquet</p>
    </article>
  </NuxtLink>
</template>
