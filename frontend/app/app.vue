<script setup lang="ts">
const authStore = useAuthStore();
const userStore = useUserStore();

const ready = computed(() => !authStore.isAuthenticated || userStore.isReady);
</script>

<template>
  <NuxtLayout>
    <NuxtPage v-if="ready" />
  </NuxtLayout>
</template>
