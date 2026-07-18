<script setup lang="ts">
const userStore = useUserStore();
const profilePicture = ref<string | null>(null);
const profilePictureFile = ref<File | null>(null);

const firstName = ref(userStore.firstName);
const lastName = ref(userStore.lastName);

definePageMeta({
  layout: "onboarding",
});

const onboardingError = ref("");
const isCompleting = ref(false);

const completeOnboarding = async () => {
  onboardingError.value = "";
  isCompleting.value = true;
  try {
    await userStore.completeOnboarding({
      firstName: firstName.value,
      lastName: lastName.value,
      profilePictureFile: profilePictureFile.value ?? undefined,
    });
    setPageLayout("default");
  } catch (error) {
    onboardingError.value = error instanceof Error ? error.message : "Erreur lors de la sauvegarde";
  } finally {
    isCompleting.value = false;
  }
};

const handleProfilePictureUpload = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  profilePictureFile.value = file;
  profilePicture.value = URL.createObjectURL(file);
};
</script>

<template>
  <div v-if="userStore.onboardingCompleted && userStore.animals.length > 0">
    <h1 class="mt-2 mb-4 text-2xl font-bold">
      Bienvenue, {{ userStore.firstName }} !
    </h1>

    <BaseSection title="À venir" action="Tout voir" link="/calendar">
      <div class="-mx-4 flex gap-2 overflow-x-auto px-4">
        <Appointment v-for="i in 4" :key="i" />
      </div>
    </BaseSection>

    <BaseSection title="Mes animaux" action="Ajouter un animal" color="blue">
      <div class="grid w-full grid-cols-2 justify-items-center gap-4">
        <AnimalCard v-for="i in 4" :key="i" src="/kyky.jpg" />
      </div>
    </BaseSection>
  </div>

  <div
    v-else-if="userStore.onboardingCompleted"
    class="absolute top-1/2 left-1/2 min-w-90 -translate-1/2 space-y-4 text-center lg:space-y-8"
  >
    <h2 class="text-xl font-bold">
      Il semble que vous n'ayez pas encore ajouté d'animal à votre compte...
    </h2>

    <NuxtLink to="/add-animal">
      <BaseButton class="flex justify-center">
        Ajouter mon premier animal
      </BaseButton>
    </NuxtLink>
  </div>

  <div v-else class="space-y-4">
    <h1 class="mt-2 text-2xl font-bold">Bienvenue par minous !</h1>

    <h2 class="text-xl font-bold">Faisons connaissance...</h2>

    <div class="flex items-center justify-around gap-4">
      <BaseInput label="Prénom" v-model="firstName" />
      <BaseInput label="Nom" v-model="lastName" />
    </div>

    <h2 class="text-xl font-bold">Une photo ?</h2>

    <label
      for="profile-picture"
      class="bg-grey-500 mx-auto flex size-20 cursor-pointer items-center justify-center overflow-hidden rounded-full"
    >
      <img
        v-if="profilePicture"
        :src="profilePicture"
        alt="Photo de profil"
        class="size-full object-cover"
      />

      <Icon v-else name="material-symbols:upload" class="size-10 text-black" />
    </label>

    <input
      id="profile-picture"
      type="file"
      class="hidden"
      accept="image/*"
      @change="handleProfilePictureUpload"
    />

    <h2 class="text-xl font-bold">Vos préférences</h2>

    <div class="flex items-center justify-between gap-4">
      <p>Notifications push</p>
      <BaseToggle v-model="userStore.notificationsPush" />
    </div>

    <div class="flex items-center justify-between gap-4">
      <p>Mode nuit</p>
      <BaseToggle v-model="userStore.nightMode" />
    </div>

    <p v-if="onboardingError" class="text-center text-sm text-red-500">{{ onboardingError }}</p>

    <BaseButton class="flex justify-center" :disabled="isCompleting" @click="completeOnboarding">
      {{ isCompleting ? "Enregistrement..." : "Terminer" }}
    </BaseButton>
  </div>
</template>
