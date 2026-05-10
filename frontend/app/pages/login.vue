<script setup lang="ts">
definePageMeta({
  layout: "auth",
});
</script>

<template>
  <div>
    <div class="relative flex h-screen flex-col items-center justify-center">
      <div class="space-y-4">
        <BaseInput label="Nom d'utilisateur" />
        <BaseInput label="Mot de passe" type="password" />
        <NuxtLink to="/profile/1">
          <BaseButton class="flex justify-center">Connexion</BaseButton>
        </NuxtLink>
      </div>
      <div class="absolute bottom-8 flex items-center justify-center gap-4">
        <NuxtLink to="/register">
          <BaseButton>Créer un compte</BaseButton>
        </NuxtLink>
        <NuxtLink to="/forgot-password">
          <BaseButton color="blue" class="shrink-0"
            >Mot de passe oublié</BaseButton
          >
        </NuxtLink>
      </div>
    </div>
    <NuxtImg
      src="/logo.svg"
      alt=""
      class="absolute top-1/2 left-1/2 -z-10 size-120 -translate-1/2 opacity-50"
    />
  </div>
</template>
