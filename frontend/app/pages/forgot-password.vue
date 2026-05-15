<script setup lang="ts">
definePageMeta({
  layout: "auth",
});

const showPasswordReset = ref(false);
</script>

<template>
  <div>
    <div class="flex h-screen flex-col items-center justify-center gap-8">
      <h1 class="text-xl font-bold">Mot de passe oublié ?</h1>
      <div class="space-y-4">
        <BaseInput label="Adresse e-mail" />
        <BaseButton
          @click="showPasswordReset = true"
          class="flex justify-center"
          >Envoyer</BaseButton
        >
      </div>
    </div>

    <BasePopup v-model="showPasswordReset">
      <p class="mb-4 text-center">
        Si un compte est associé à cette adresse, un e-mail contenant un mot de
        passe provisoire vous a été envoyé.
      </p>

      <NuxtLink to="/login">
        <BaseButton class="flex justify-center"
          >Retour à la page de connexion</BaseButton
        >
      </NuxtLink>
    </BasePopup>
  </div>
</template>
