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
    <NuxtPage />

    <ClientOnly>
      <div
        v-if="!ready"
        class="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm"
      >
        <Icon
          name="eos-icons:loading"
          class="size-10 animate-spin text-gray-500"
        />
      </div>
    </ClientOnly>
  </NuxtLayout>
</template>
