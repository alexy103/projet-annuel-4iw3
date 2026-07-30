<script setup lang="ts">
definePageMeta({
  layout: "auth",
});

const router = useRouter();
const authStore = useAuthStore();
const userStore = useUserStore();
const config = useRuntimeConfig();
const requestUrl = useRequestURL();

const githubRedirectUri = `${requestUrl.origin}/auth/github/callback`;
const githubAuthorizeUrl = computed(() => {
  const params = new URLSearchParams({
    client_id: config.public.githubClientId,
    redirect_uri: githubRedirectUri,
    scope: "read:user user:email",
  });
  return `https://github.com/login/oauth/authorize?${params.toString()}`;
});

const firstName = ref("");
const lastName = ref("");
const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const errorMessage = ref("");
const isSubmitting = ref(false);

const showVerifyPopup = ref(false);
const verificationCode = ref("");
const verifyError = ref("");
const isVerifying = ref(false);
const resendMessage = ref("");
const isResending = ref(false);

const submitRegister = async () => {
  errorMessage.value = "";

  if (password.value !== confirmPassword.value) {
    errorMessage.value = "Les mots de passe ne correspondent pas";
    return;
  }

  isSubmitting.value = true;
  try {
    await authStore.register({
      first_name: firstName.value,
      last_name: lastName.value,
      email: email.value,
      password: password.value,
    });
    showVerifyPopup.value = true;
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : "Inscription impossible";
  } finally {
    isSubmitting.value = false;
  }
};

const submitVerify = async () => {
  verifyError.value = "";
  isVerifying.value = true;
  try {
    await authStore.verifyEmailCode(email.value, verificationCode.value);
    const result = await authStore.login(email.value, password.value);
    if (!result.requiresTwoFactor) {
      await userStore.fetchMe();
    }
    showVerifyPopup.value = false;
    await router.push("/");
  } catch (error) {
    verifyError.value =
      error instanceof Error ? error.message : "Code invalide";
  } finally {
    isVerifying.value = false;
  }
};

const resendCode = async () => {
  resendMessage.value = "";
  isResending.value = true;
  try {
    await authStore.resendVerificationCode(email.value);
    resendMessage.value = "Un nouveau code vous a été envoyé par e-mail.";
  } catch (error) {
    resendMessage.value =
      error instanceof Error ? error.message : "Impossible de renvoyer le code";
  } finally {
    isResending.value = false;
  }
};
</script>

<template>
  <div>
    <div class="relative flex h-screen flex-col items-center justify-center">
      <form @submit.prevent="submitRegister" class="mb-8 w-72 space-y-4">
        <BaseInput v-model="firstName" label="Prénom" />
        <BaseInput v-model="lastName" label="Nom" />
        <BaseInput v-model="email" label="Adresse e-mail" type="email" />
        <BaseInput v-model="password" label="Mot de passe" type="password" />
        <BaseInput
          v-model="confirmPassword"
          label="Confirmer le mot de passe"
          type="password"
        />

        <p v-if="errorMessage" class="text-center text-sm text-red-500">
          {{ errorMessage }}
        </p>

        <BaseButton
          type="submit"
          :disabled="isSubmitting"
          class="flex w-full justify-center"
        >
          {{ isSubmitting ? "Création..." : "Créer mon compte" }}
        </BaseButton>

        <a :href="githubAuthorizeUrl" class="block">
          <BaseButton
            color="white"
            class="flex w-full items-center justify-center gap-2"
          >
            <Icon name="uil:github" class="size-5" />
            S'inscrire avec GitHub
          </BaseButton>
        </a>
      </form>
    </div>

    <BasePopup v-model="showVerifyPopup" fit>
      <form @submit.prevent="submitVerify" class="w-72 space-y-4 text-center">
        <p class="font-bold">Vérifiez votre e-mail</p>
        <p class="text-sm">
          Un code de vérification a été envoyé à {{ email }}. Entrez-le
          ci-dessous pour activer votre compte.
        </p>
        <BaseInput v-model="verificationCode" label="Code de vérification" />
        <p v-if="verifyError" class="text-sm text-red-500">{{ verifyError }}</p>
        <BaseButton
          type="submit"
          :disabled="isVerifying"
          class="flex w-full justify-center"
        >
          {{ isVerifying ? "Vérification..." : "Valider" }}
        </BaseButton>
        <button
          type="button"
          class="text-grey-700 cursor-pointer text-sm underline disabled:opacity-50"
          :disabled="isResending"
          @click="resendCode"
        >
          Renvoyer le code
        </button>
        <p v-if="resendMessage" class="text-sm">{{ resendMessage }}</p>
      </form>
    </BasePopup>
  </div>
</template>
