<script setup lang="ts">
definePageMeta({
  layout: "auth",
});
</script>

<template>
  <div>
    <div class="relative flex h-screen flex-col items-center justify-center">
      <div class="mb-8 space-y-4">
        <BaseInput label="Nom d'utilisateur" />
        <BaseInput label="Adresse e-mail" />
        <BaseInput label="Mot de passe" type="password" />
        <BaseInput label="Confirmer le mot de passe" type="password" />
      </div>
      <NuxtLink to="/profile/1">
        <BaseButton class="flex justify-center">Créer mon compte</BaseButton>
      </NuxtLink>
    </div>

    <NuxtImg
      src="/logo.svg"
      alt=""
      class="absolute top-1/2 left-1/2 -z-10 size-120 -translate-1/2 opacity-50"
    />
    <button @click="$router.back()">
      <Icon
        name="solar:round-arrow-left-outline"
        class="absolute top-4 right-4 size-7"
      />
    </button>
  </div>
</template>
