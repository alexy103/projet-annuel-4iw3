<script setup lang="ts">
const authStore = useAuthStore();
const userStore = useUserStore();
const config = useRuntimeConfig();

const ready = computed(() => !authStore.isAuthenticated || userStore.isReady);

useHead({
  script:
    config.public.umamiWebsiteId && config.public.umamiScriptUrl
      ? [
          {
            src: config.public.umamiScriptUrl,
            defer: true,
            "data-website-id": config.public.umamiWebsiteId,
          },
        ]
      : [],
});
</script>

<template>
  <NuxtLayout>
    <NuxtPage v-if="ready" />
  </NuxtLayout>
</template>
