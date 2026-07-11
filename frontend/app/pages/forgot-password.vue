<script setup lang="ts">
definePageMeta({
  layout: "auth",
});

const email = ref("");
const showPasswordReset = ref(false);
const errorMessage = ref("");
const isLoading = ref(false);

const handleForgotPassword = async () => {
  errorMessage.value = "";

  if (!email.value) {
    errorMessage.value = "Adresse e-mail obligatoire";
    return;
  }

  isLoading.value = true;

  try {
    const config = useRuntimeConfig();

    const response = await fetch(
      `${config.public.apiUrl}/auth/reset-password`,
      {
        method: "POST",
        headers: {
          "x-api-key": config.public.apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.value,
        }),
      },
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || "Erreur lors de la réinitialisation");
    }

    sessionStorage.setItem("resetPasswordEmail", email.value);

    showPasswordReset.value = true;
  } catch (error) {
    errorMessage.value =
      error instanceof Error
        ? error.message
        : "Erreur lors de la réinitialisation";
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div>
    <div class="flex h-screen flex-col items-center justify-center gap-8">
      <h1 class="text-xl font-bold">Mot de passe oublié ?</h1>

      <form class="space-y-4" @submit.prevent="handleForgotPassword">
        <BaseInput v-model="email" label="Adresse e-mail" />

        <p v-if="errorMessage" class="text-center text-sm text-red-500">
          {{ errorMessage }}
        </p>

        <BaseButton type="submit" class="flex justify-center">
          {{ isLoading ? "Envoi..." : "Envoyer" }}
        </BaseButton>
      </form>
    </div>

    <BasePopup v-model="showPasswordReset">
      <p class="mb-4 text-center">
        Si un compte est associé à cette adresse, un e-mail contenant un mot de
        passe provisoire vous a été envoyé.
      </p>

      <NuxtLink to="/reset-password">
        <BaseButton class="flex justify-center">
          Redéfinir mon mot de passe
        </BaseButton>
      </NuxtLink>
    </BasePopup>
  </div>
</template>
