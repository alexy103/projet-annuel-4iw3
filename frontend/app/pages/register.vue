<script setup lang="ts">
definePageMeta({
  layout: "auth",
});

const firstName = ref("");
const lastName = ref("");
const email = ref("");
const password = ref("");
const confirmPassword = ref("");

const errorMessage = ref("");
const successMessage = ref("");
const isLoading = ref(false);

const handleRegister = async () => {
  errorMessage.value = "";
  successMessage.value = "";

  if (!firstName.value || !lastName.value || !email.value || !password.value) {
    errorMessage.value = "Tous les champs sont obligatoires";
    return;
  }

  if (password.value !== confirmPassword.value) {
    errorMessage.value = "Les mots de passe ne correspondent pas";
    return;
  }

  isLoading.value = true;

  try {
    const config = useRuntimeConfig();

    const response = await fetch(`${config.public.apiUrl}/auth/register`, {
      method: "POST",
      headers: {
        "x-api-key": config.public.apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        first_name: firstName.value,
        last_name: lastName.value,
        email: email.value,
        password: password.value,
      }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || "Erreur lors de la création du compte");
    }

    sessionStorage.setItem("registerEmail", email.value);
    sessionStorage.setItem("registerPassword", password.value);
    sessionStorage.setItem("registerFirstName", firstName.value);
    sessionStorage.setItem("registerLastName", lastName.value);

    await navigateTo("/verify-code");
  } catch (error) {
    errorMessage.value =
      error instanceof Error
        ? error.message
        : "Erreur lors de la création du compte";
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div>
    <div class="relative flex h-screen flex-col items-center justify-center">
      <form class="mb-8 space-y-4" @submit.prevent="handleRegister">
        <BaseInput v-model="firstName" label="Prénom" />
        <BaseInput v-model="lastName" label="Nom" />
        <BaseInput v-model="email" label="Adresse e-mail" />
        <BaseInput v-model="password" label="Mot de passe" type="password" />
        <BaseInput
          v-model="confirmPassword"
          label="Confirmer le mot de passe"
          type="password"
        />

        <p v-if="errorMessage" class="text-center text-sm text-red-500">
          {{ errorMessage }}
        </p>

        <p v-if="successMessage" class="text-center text-sm text-green-600">
          {{ successMessage }}
        </p>

        <BaseButton class="flex justify-center" type="submit">
          {{ isLoading ? "Création..." : "Créer mon compte" }}
        </BaseButton>
      </form>
    </div>
  </div>
</template>
