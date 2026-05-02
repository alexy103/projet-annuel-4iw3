<script setup lang="ts">
const props = defineProps<{
  src: string;
}>();
</script>

<template>
  <NuxtLink
    to="/animal/1"
    class="h-48 min-h-48 w-full rounded-2xl md:h-64 lg:h-72 xl:w-3/4"
  >
    <img :src="src" alt="" class="h-full w-full rounded-2xl object-cover" />
  </NuxtLink>
</template>
