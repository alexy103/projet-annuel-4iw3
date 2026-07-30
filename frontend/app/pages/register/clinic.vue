<script setup lang="ts">
definePageMeta({
  layout: "auth",
});

const { registerClinic } = useClinics();

const name = ref("");
const address = ref("");
const city = ref("");
const postcode = ref("");
const phoneNumber = ref("");
const errorMessage = ref("");
const isSubmitting = ref(false);
const isRegistered = ref(false);

const submitRegister = async () => {
  errorMessage.value = "";
  isSubmitting.value = true;
  try {
    await registerClinic({
      name: name.value,
      address: address.value,
      city: city.value,
      postcode: postcode.value,
      phone_number: phoneNumber.value,
    });
    isRegistered.value = true;
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : "Inscription impossible";
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="relative flex min-h-screen flex-col items-center justify-center">
    <div v-if="isRegistered" class="w-72 space-y-4 text-center">
      <Icon
        name="material-symbols:check-circle-outline"
        class="mx-auto size-14 text-green-500"
      />
      <p class="font-bold">Demande envoyée</p>
      <p class="text-sm">
        Votre clinique a bien été enregistrée. Elle sera visible après
        validation par un administrateur.
      </p>
      <NuxtLink to="/login" class="block">
        <BaseButton class="flex w-full justify-center">
          Retour à la connexion
        </BaseButton>
      </NuxtLink>
    </div>

    <form
      v-else
      @submit.prevent="submitRegister"
      class="w-72 space-y-4"
    >
      <p class="text-center font-bold">Inscrire ma clinique</p>

      <BaseInput v-model="name" label="Nom de la clinique" />
      <BaseInput v-model="address" label="Adresse" />
      <BaseInput v-model="city" label="Ville" />
      <BaseInput v-model="postcode" label="Code postal" />
      <BaseInput v-model="phoneNumber" label="Téléphone" type="tel" />

      <p v-if="errorMessage" class="text-center text-sm text-red-500">
        {{ errorMessage }}
      </p>

      <BaseButton
        type="submit"
        :disabled="isSubmitting"
        class="flex w-full justify-center"
      >
        {{ isSubmitting ? "Envoi..." : "Envoyer ma demande" }}
      </BaseButton>

      <NuxtLink to="/login" class="block text-center text-sm underline">
        J'ai déjà un compte
      </NuxtLink>
    </form>
  </div>
</template>
