<script setup lang="ts">
definePageMeta({
  layout: "auth",
});

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const userStore = useUserStore();

const errorMessage = ref("");
const show2FA = ref(false);
const twoFactorCode = ref("");
const twoFactorError = ref("");
const isVerifying = ref(false);

const afterLogin = async () => {
  await userStore.fetchMe();
  await router.push("/");
};

const submitTwoFactor = async () => {
  twoFactorError.value = "";
  isVerifying.value = true;
  try {
    await authStore.verifyTwoFactor(twoFactorCode.value);
    show2FA.value = false;
    await afterLogin();
  } catch (error) {
    twoFactorError.value = error instanceof Error ? error.message : "Code invalide";
  } finally {
    isVerifying.value = false;
  }
};

onMounted(async () => {
  const code = route.query.code;
  const oauthError = route.query.error;

  if (oauthError) {
    errorMessage.value = "Connexion GitHub annulée ou refusée.";
    return;
  }

  if (typeof code !== "string" || !code) {
    errorMessage.value = "Code d'autorisation GitHub manquant.";
    return;
  }

  try {
    const result = await authStore.loginWithGithub(code);
    if (result.requiresTwoFactor) {
      show2FA.value = true;
    } else {
      await afterLogin();
    }
  } catch (error) {
    errorMessage.value =
      error instanceof Error
        ? error.message
        : "Connexion avec GitHub impossible.";
  }
});
</script>

<template>
  <div>
    <div class="flex h-screen flex-col items-center justify-center gap-4">
      <template v-if="errorMessage">
        <p class="text-center text-sm text-red-500">{{ errorMessage }}</p>
        <NuxtLink to="/login">
          <BaseButton class="flex justify-center"
            >Retour à la page de connexion</BaseButton
          >
        </NuxtLink>
      </template>
      <template v-else-if="!show2FA">
        <p class="text-center text-sm">Connexion avec GitHub en cours...</p>
      </template>
    </div>

    <BasePopup v-model="show2FA" fit>
      <form @submit.prevent="submitTwoFactor" class="w-64 space-y-4 text-center">
        <p class="font-bold">Vérification en deux étapes</p>
        <p class="text-sm">
          Entrez le code généré par votre application d'authentification (ou
          un code de récupération).
        </p>
        <BaseInput v-model="twoFactorCode" label="Code" />
        <p v-if="twoFactorError" class="text-sm text-red-500">
          {{ twoFactorError }}
        </p>
        <BaseButton
          type="submit"
          :disabled="isVerifying"
          class="flex w-full justify-center"
        >
          {{ isVerifying ? "Vérification..." : "Valider" }}
        </BaseButton>
      </form>
    </BasePopup>
  </div>
</template>
