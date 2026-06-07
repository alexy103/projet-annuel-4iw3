<script setup lang="ts">
type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

type UserPublic = {
  id: number;
  first_name?: string;
  last_name?: string;
  email?: string;
  profile_picture?: string | null;
  avatar?: string | null;
  onboarding_completed?: boolean;
};

const route = useRoute();
const config = useRuntimeConfig();
const userStore = useUserStore();

const isLoading = ref(true);
const isSaving = ref(false);
const errorMessage = ref("");

const userId = ref<number | null>(null);
const firstName = ref("");
const lastName = ref("");
const profilePicture = ref<string | null>(null);
const profilePictureFile = ref<File | null>(null);

const notificationsPush = ref(true);
const nightMode = ref(false);

const authHeaders = computed(() => {
  const headers: Record<string, string> = {
    "x-api-key": config.public.apiKey,
  };

  if (import.meta.client) {
    const accessToken = localStorage.getItem("accessToken");

    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }
  }

  return headers;
});

const profilePictureUrl = computed(() => {
  if (profilePicture.value) {
    if (profilePicture.value.startsWith("blob:")) {
      return profilePicture.value;
    }

    if (profilePicture.value.startsWith("http")) {
      return profilePicture.value;
    }

    return `${config.public.backendUrl}${profilePicture.value}`;
  }

  return "/default-avatar.png";
});

const fetchMe = async () => {
  try {
    errorMessage.value = "";

    const response = await $fetch<ApiResponse<UserPublic>>(
      `${config.public.apiUrl}/users/me`,
      {
        headers: authHeaders.value,
      },
    );

    userId.value = response.data.id;
    firstName.value = response.data.first_name || "";
    lastName.value = response.data.last_name || "";
    profilePicture.value =
      response.data.profile_picture || response.data.avatar || null;

    localStorage.setItem("userId", String(response.data.id));
    localStorage.setItem("firstName", firstName.value);
    localStorage.setItem("lastName", lastName.value);

    userStore.userId = response.data.id;
    userStore.firstName = firstName.value;
    userStore.lastName = lastName.value;
    userStore.avatar = profilePicture.value;
  } catch (error) {
    console.error(error);
    errorMessage.value = "Impossible de charger votre profil.";
  }
};

const handleProfilePictureUpload = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  if (!file) {
    return;
  }

  if (profilePicture.value?.startsWith("blob:")) {
    URL.revokeObjectURL(profilePicture.value);
  }

  profilePictureFile.value = file;
  profilePicture.value = URL.createObjectURL(file);
};

const handleSave = async () => {
  if (!userId.value) {
    return;
  }

  try {
    isSaving.value = true;
    errorMessage.value = "";

    const response = await $fetch<ApiResponse<UserPublic>>(
      `${config.public.apiUrl}/users/${userId.value}`,
      {
        method: "PUT",
        headers: {
          ...authHeaders.value,
          "Content-Type": "application/json",
        },
        body: {
          first_name: firstName.value,
          last_name: lastName.value,
        },
      },
    );

    if (profilePictureFile.value) {
      const formData = new FormData();

      formData.append("profile_picture", profilePictureFile.value);

      const pictureResponse = await $fetch<ApiResponse<UserPublic>>(
        `${config.public.apiUrl}/users/${userId.value}/profile-picture`,
        {
          method: "PATCH",
          headers: authHeaders.value,
          body: formData,
        },
      );

      profilePicture.value =
        pictureResponse.data.profile_picture ||
        pictureResponse.data.avatar ||
        profilePicture.value;

      profilePictureFile.value = null;
    }

    firstName.value = response.data.first_name || firstName.value;
    lastName.value = response.data.last_name || lastName.value;

    localStorage.setItem("firstName", firstName.value);
    localStorage.setItem("lastName", lastName.value);
    localStorage.setItem("notificationsPush", String(notificationsPush.value));
    localStorage.setItem("nightMode", String(nightMode.value));

    userStore.firstName = firstName.value;
    userStore.lastName = lastName.value;
    userStore.avatar = profilePicture.value;
    userStore.notificationsPush = notificationsPush.value;
    userStore.nightMode = nightMode.value;
  } catch (error) {
    console.error(error);
    errorMessage.value = "Impossible d'enregistrer vos modifications.";
  } finally {
    isSaving.value = false;
  }
};

const handleLogout = async () => {
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
    userStore.resetUser?.();

    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("roleId");
    localStorage.removeItem("firstName");
    localStorage.removeItem("lastName");
    localStorage.removeItem("onboardingCompleted");
    localStorage.removeItem("notificationsPush");
    localStorage.removeItem("nightMode");

    await navigateTo("/login");
  }
};

onMounted(async () => {
  isLoading.value = true;

  notificationsPush.value =
    localStorage.getItem("notificationsPush") !== "false";

  nightMode.value = localStorage.getItem("nightMode") === "true";

  await fetchMe();

  isLoading.value = false;
});

onUnmounted(() => {
  if (profilePicture.value?.startsWith("blob:")) {
    URL.revokeObjectURL(profilePicture.value);
  }
});
</script>

<template>
  <div>
    <h1 class="mt-2 mb-4 text-2xl font-bold">Paramètres</h1>

    <div v-if="isLoading" class="flex justify-center py-8">
      <Icon
        name="eos-icons:loading"
        class="text-grey-500 size-10 animate-spin"
      />
    </div>

    <div v-else>
      <p v-if="errorMessage" class="mb-4 text-center text-sm text-red-600">
        {{ errorMessage }}
      </p>

      <BaseSection title="Mon compte">
        <label
          for="profile-picture"
          class="mx-auto block size-50 cursor-pointer overflow-hidden rounded-full"
        >
          <img
            :src="profilePictureUrl"
            alt=""
            class="size-full rounded-full object-cover"
          />
        </label>

        <input
          id="profile-picture"
          type="file"
          class="hidden"
          accept="image/*"
          @change="handleProfilePictureUpload"
        />

        <div class="flex items-center justify-around gap-4">
          <BaseInput label="Prénom" v-model="firstName" />
          <BaseInput label="Nom" v-model="lastName" />
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
        <BaseButton class="flex justify-center" @click="handleSave">
          {{ isSaving ? "Enregistrement..." : "Enregistrer" }}
        </BaseButton>

        <BaseButton
          class="flex justify-center"
          color="white"
          @click="handleLogout"
        >
          Déconnexion
        </BaseButton>
      </div>
    </div>
  </div>
</template>
