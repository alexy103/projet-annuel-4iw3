<script setup lang="ts">
const { hasChosen, accept, refuse } = useCookieConsent();

const mounted = ref(false);
onMounted(() => {
  mounted.value = true;
});

const visible = computed(() => mounted.value && !hasChosen.value);
</script>

<template>
  <div v-if="visible" class="fixed inset-x-0 bottom-0 z-50 p-4">
    <div
      class="mx-auto max-w-2xl space-y-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-lg"
    >
      <p class="text-sm text-gray-700">
        Nous utilisons des cookies essentiels au fonctionnement du site, ainsi
        que des cookies de mesure d'audience (Umami) pour améliorer votre
        expérience. Vous pouvez accepter ou refuser ces derniers.
        <NuxtLink
          to="/confidentialite"
          class="font-bold text-[#15D98B] underline"
        >
          En savoir plus
        </NuxtLink>
      </p>
      <div class="flex justify-end gap-2">
        <button
          class="cursor-pointer rounded-full bg-gray-200 px-4 py-2 text-sm font-bold text-black transition-transform duration-200 hover:scale-105"
          @click="refuse"
        >
          Refuser
        </button>
        <button
          class="cursor-pointer rounded-full bg-[#15D98B] px-4 py-2 text-sm font-bold text-white transition-transform duration-200 hover:scale-105"
          @click="accept"
        >
          Accepter
        </button>
      </div>
    </div>
  </div>
</template>
