<script setup lang="ts">
definePageMeta({
  layout: "auth",
});

const email = ref("");
const password = ref("");
const errorMessage = ref("");
const isLoading = ref(false);

const handleLogin = async () => {
  errorMessage.value = "";
  isLoading.value = true;

  try {
    const config = useRuntimeConfig();

    const response = await fetch(`${config.public.apiUrl}/auth/login`, {
      method: "POST",
      headers: {
        "x-api-key": config.public.apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email.value,
        password: password.value,
      }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || "Erreur lors de la connexion");
    }

    localStorage.setItem("accessToken", result.data.accessToken);
    localStorage.setItem("refreshToken", result.data.refreshToken);
    localStorage.setItem("userId", String(result.data.userId));
    localStorage.setItem("roleId", String(result.data.roleId));

    await navigateTo("/");
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : "Erreur lors de la connexion";
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div>
    <div class="relative flex h-screen flex-col items-center justify-center">
      <form class="space-y-4" @submit.prevent="handleLogin">
        <BaseInput v-model="email" label="Email" />
        <BaseInput v-model="password" label="Mot de passe" type="password" />

        <p v-if="errorMessage" class="text-sm text-red-500">
          {{ errorMessage }}
        </p>

        <BaseButton class="flex justify-center" type="submit">
          {{ isLoading ? "Connexion..." : "Connexion" }}
        </BaseButton>
      </form>

      <div class="absolute bottom-8 flex items-center justify-center gap-4">
        <NuxtLink to="/register">
          <BaseButton>Créer un compte</BaseButton>
        </NuxtLink>
        <NuxtLink to="/forgot-password">
          <BaseButton color="blue" class="shrink-0">
            Mot de passe oublié
          </BaseButton>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
