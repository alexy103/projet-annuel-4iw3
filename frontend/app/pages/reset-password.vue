<script setup lang="ts">
definePageMeta({
  layout: "auth",
});

const email = ref("");
const tempPassword = ref("");
const newPassword = ref("");
const confirmNewPassword = ref("");

const errorMessage = ref("");
const successMessage = ref("");
const isLoading = ref(false);

onMounted(() => {
  email.value = sessionStorage.getItem("resetPasswordEmail") || "";
});

const handleResetPassword = async () => {
  errorMessage.value = "";
  successMessage.value = "";

  if (
    !email.value ||
    !tempPassword.value ||
    !newPassword.value ||
    !confirmNewPassword.value
  ) {
    errorMessage.value = "Tous les champs sont obligatoires";
    return;
  }

  if (newPassword.value !== confirmNewPassword.value) {
    errorMessage.value = "Les nouveaux mots de passe ne correspondent pas";
    return;
  }

  isLoading.value = true;

  try {
    const config = useRuntimeConfig();

    const changePasswordResponse = await fetch(
      `${config.public.apiUrl}/auth/change-password`,
      {
        method: "POST",
        headers: {
          "x-api-key": config.public.apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.value,
          old_password: tempPassword.value,
          new_password: newPassword.value,
        }),
      },
    );

    const changePasswordResult = await changePasswordResponse.json();

    if (!changePasswordResponse.ok || !changePasswordResult.success) {
      throw new Error(
        changePasswordResult.error ||
          "Erreur lors du changement de mot de passe",
      );
    }

    const loginResponse = await fetch(`${config.public.apiUrl}/auth/login`, {
      method: "POST",
      headers: {
        "x-api-key": config.public.apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email.value,
        password: newPassword.value,
      }),
    });

    const loginResult = await loginResponse.json();

    if (loginResponse.ok && loginResult.success) {
      localStorage.setItem("accessToken", loginResult.data.accessToken);
      localStorage.setItem("refreshToken", loginResult.data.refreshToken);

      sessionStorage.removeItem("resetPasswordEmail");

      await navigateTo("/");
      return;
    }

    sessionStorage.setItem("registerEmail", email.value);
    sessionStorage.setItem("registerPassword", newPassword.value);

    try {
      await fetch(`${config.public.apiUrl}/auth/resend-code`, {
        method: "POST",
        headers: {
          "x-api-key": config.public.apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.value,
        }),
      });
    } catch {
      // Si l'email est déjà vérifié ou si l'envoi échoue, la page verify-code affichera l'erreur au besoin.
    }

    successMessage.value =
      "Mot de passe modifié. Vérifie ton adresse e-mail pour continuer.";

    setTimeout(async () => {
      await navigateTo("/verify-code");
    }, 1000);
  } catch (error) {
    errorMessage.value =
      error instanceof Error
        ? error.message
        : "Erreur lors du changement de mot de passe";
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div>
    <div class="flex h-screen flex-col items-center justify-center gap-8">
      <h1 class="text-xl font-bold">Redéfinir mon mot de passe</h1>

      <form class="space-y-4" @submit.prevent="handleResetPassword">
        <BaseInput v-model="email" label="Adresse e-mail" />
        <BaseInput
          v-model="tempPassword"
          label="Mot de passe temporaire"
          type="password"
        />
        <BaseInput
          v-model="newPassword"
          label="Nouveau mot de passe"
          type="password"
        />
        <BaseInput
          v-model="confirmNewPassword"
          label="Confirmer le nouveau mot de passe"
          type="password"
        />

        <p v-if="errorMessage" class="text-center text-sm text-red-500">
          {{ errorMessage }}
        </p>

        <p v-if="successMessage" class="text-center text-sm text-green-600">
          {{ successMessage }}
        </p>

        <BaseButton type="submit" class="flex justify-center">
          {{ isLoading ? "Modification..." : "Modifier mon mot de passe" }}
        </BaseButton>
      </form>
    </div>
  </div>
</template>
