<script setup lang="ts">
definePageMeta({
  layout: "auth",
});

const router = useRouter();
const authStore = useAuthStore();
const userStore = useUserStore();
const config = useRuntimeConfig();
const requestUrl = useRequestURL();

const email = ref("");
const password = ref("");
const errorMessage = ref("");
const isSubmitting = ref(false);

const show2FA = ref(false);
const twoFactorCode = ref("");
const twoFactorError = ref("");
const isVerifying = ref(false);

const githubRedirectUri = `${requestUrl.origin}/auth/github/callback`;
const githubAuthorizeUrl = computed(() => {
  const params = new URLSearchParams({
    client_id: config.public.githubClientId,
    redirect_uri: githubRedirectUri,
    scope: "read:user user:email",
  });
  return `https://github.com/login/oauth/authorize?${params.toString()}`;
});

const afterLogin = async () => {
  await userStore.fetchMe();
  await router.push("/");
};

const submitLogin = async () => {
  errorMessage.value = "";
  isSubmitting.value = true;
  try {
    const result = await authStore.login(email.value, password.value);
    if (result.requiresTwoFactor) {
      show2FA.value = true;
    } else {
      await afterLogin();
    }
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : "Connexion impossible";
  } finally {
    isSubmitting.value = false;
  }
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
</script>

<template>
  <div>
    <div class="relative flex h-screen flex-col items-center justify-center">
      <form @submit.prevent="submitLogin" class="w-72 space-y-4">
        <BaseInput v-model="email" label="Adresse e-mail" type="email" />
        <BaseInput v-model="password" label="Mot de passe" type="password" />

        <p v-if="errorMessage" class="text-center text-sm text-red-500">
          {{ errorMessage }}
        </p>

        <BaseButton
          type="submit"
          :disabled="isSubmitting"
          class="flex w-full justify-center"
        >
          {{ isSubmitting ? "Connexion..." : "Connexion" }}
        </BaseButton>

        <a :href="githubAuthorizeUrl" class="block">
          <BaseButton
            color="white"
            class="flex w-full items-center justify-center gap-2"
          >
            <Icon name="uil:github" class="size-5" />
            Continuer avec GitHub
          </BaseButton>
        </a>
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
