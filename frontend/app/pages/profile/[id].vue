<script setup lang="ts">
const route = useRoute();

const id = route.params.id;

const notificationsPush = ref(true);
const nightMode = ref(false);

const handleLogout = async () => {
  const config = useRuntimeConfig();
  const accessToken = localStorage.getItem("accessToken");

  try {
    if (accessToken) {
      await fetch(`${config.public.apiUrl}/auth/logout`, {
        method: "POST",
        headers: {
          "x-api-key": config.public.apiKey,
          Authorization: `Bearer ${accessToken}`,
        },
      });
    }
  } catch (error) {
    console.error("Erreur lors de la déconnexion", error);
  } finally {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    await navigateTo("/login");
  }
};
</script>

<template>
  <div>
    <h1 class="mt-2 mb-4 text-2xl font-bold">Paramètres</h1>

    <BaseSection title="Mon compte">
      <img
        src="/john.png"
        alt=""
        class="mx-auto size-50 rounded-full object-cover"
      />

      <div class="flex items-center justify-around gap-4">
        <BaseInput label="Prénom" value="John" />
        <BaseInput label="Nom" value="Doe" />
      </div>
    </BaseSection>

    <BaseSection title="Mon application" class="space-y-4" color="blue">
      <div class="flex items-center justify-between gap-4">
        <p>Notifications push</p>
        <BaseToggle v-model="notificationsPush" />
      </div>
      <div class="flex items-center justify-between gap-4">
        <p>Mode nuit</p>
        <BaseToggle v-model="nightMode" />
      </div>
    </BaseSection>

    <div class="flex items-center justify-center gap-4">
      <BaseButton class="flex justify-center">Enregistrer</BaseButton>

      <BaseButton
        class="flex justify-center"
        color="white"
        @click="handleLogout"
      >
        Déconnexion
      </BaseButton>
    </div>
  </div>
</template>
