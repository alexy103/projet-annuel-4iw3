<script setup lang="ts">
definePageMeta({
  layout: "auth",
});

const route = useRoute();

const email = ref("");
const code = ref("");

onMounted(() => {
  email.value = sessionStorage.getItem("registerEmail") || "";
});

const errorMessage = ref("");
const successMessage = ref("");
const isLoading = ref(false);

const handleVerifyCode = async () => {
  errorMessage.value = "";
  successMessage.value = "";

  if (!email.value) {
    errorMessage.value = "Adresse e-mail manquante";
    return;
  }

  if (!code.value) {
    errorMessage.value = "Code de vérification manquant";
    return;
  }

  isLoading.value = true;

  try {
    const config = useRuntimeConfig();

    const verifyResponse = await fetch(
      `${config.public.apiUrl}/auth/verify-code`,
      {
        method: "POST",
        headers: {
          "x-api-key": config.public.apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.value,
          code: Number(code.value),
        }),
      },
    );

    const verifyResult = await verifyResponse.json();

    if (!verifyResponse.ok || !verifyResult.success) {
      throw new Error(verifyResult.error || "Code de vérification invalide");
    }

    const password = sessionStorage.getItem("registerPassword");

    if (!password) {
      await navigateTo("/login");
      return;
    }

    const loginResponse = await fetch(`${config.public.apiUrl}/auth/login`, {
      method: "POST",
      headers: {
        "x-api-key": config.public.apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email.value,
        password,
      }),
    });

    const loginResult = await loginResponse.json();

    if (!loginResponse.ok || !loginResult.success) {
      throw new Error(loginResult.error || "Erreur lors de la connexion");
    }

    localStorage.setItem("accessToken", loginResult.data.accessToken);
    localStorage.setItem("refreshToken", loginResult.data.refreshToken);

    sessionStorage.removeItem("registerEmail");
    sessionStorage.removeItem("registerPassword");

    await navigateTo("/");
  } catch (error) {
    errorMessage.value =
      error instanceof Error
        ? error.message
        : "Erreur lors de la vérification du code";
  } finally {
    isLoading.value = false;
  }
};

const handleResendCode = async () => {
  errorMessage.value = "";
  successMessage.value = "";

  if (!email.value) {
    errorMessage.value = "Adresse e-mail manquante";
    return;
  }

  isLoading.value = true;

  try {
    const config = useRuntimeConfig();

    const response = await fetch(`${config.public.apiUrl}/auth/resend-code`, {
      method: "POST",
      headers: {
        "x-api-key": config.public.apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email.value,
      }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || "Erreur lors du renvoi du code");
    }

    successMessage.value = "Un nouveau code a été envoyé.";
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : "Erreur lors du renvoi du code";
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div>
    <div class="relative flex h-screen flex-col items-center justify-center">
      <form class="space-y-4" @submit.prevent="handleVerifyCode">
        <BaseInput v-model="email" label="Adresse e-mail" />
        <BaseInput v-model="code" label="Code de vérification" />

        <p v-if="errorMessage" class="text-center text-sm text-red-500">
          {{ errorMessage }}
        </p>

        <p v-if="successMessage" class="text-center text-sm text-green-600">
          {{ successMessage }}
        </p>

        <BaseButton class="flex justify-center" type="submit">
          {{ isLoading ? "Vérification..." : "Vérifier mon compte" }}
        </BaseButton>

        <BaseButton
          class="flex justify-center"
          color="white"
          type="button"
          @click="handleResendCode"
        >
          Renvoyer le code
        </BaseButton>
      </form>
    </div>
  </div>
</template>
