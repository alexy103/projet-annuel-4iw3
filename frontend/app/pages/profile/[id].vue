<script setup lang="ts">
const router = useRouter();
const authStore = useAuthStore();
const userStore = useUserStore();
const isClientMounted = ref(false);
const isClinicRole = ref(false);

type TreatmentType = {
  id: number;
  user_id: number;
  name: string;
};

const isSaving = ref(false);
const saveError = ref("");

const firstName = ref(userStore.firstName);
const lastName = ref(userStore.lastName);
const profilePictureFile = ref<File | null>(null);
const profilePicturePreview = ref<string | null>(null);

const notificationsPush = ref(true);
const nightMode = ref(false);

const handleProfilePictureUpload = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  profilePictureFile.value = file;
  if (profilePicturePreview.value?.startsWith("blob:")) {
    URL.revokeObjectURL(profilePicturePreview.value);
  }
  profilePicturePreview.value = URL.createObjectURL(file);
};

const save = async () => {
  saveError.value = "";
  isSaving.value = true;
  try {
    await userStore.updateProfile({
      firstName: firstName.value,
      lastName: lastName.value,
      profilePictureFile: profilePictureFile.value ?? undefined,
    });
    profilePictureFile.value = null;
  } catch (error) {
    saveError.value =
      error instanceof Error ? error.message : "Erreur lors de la sauvegarde";
  } finally {
    isSaving.value = false;
  }
};

// --- Treatment types ---
const treatmentTypes = ref<TreatmentType[]>([]);
const newTreatmentTypeName = ref("");
const editingTreatmentTypeId = ref<number | null>(null);
const editingTreatmentTypeName = ref("");
const isLoadingTreatmentTypes = ref(false);
const isSavingTreatmentType = ref(false);
const treatmentTypeErrorMessage = ref("");

const fetchTreatmentTypes = async () => {
  treatmentTypeErrorMessage.value = "";
  isLoadingTreatmentTypes.value = true;
  try {
    const { apiFetch } = useApi();
    const result = await apiFetch<TreatmentType[]>("/treatment-types");
    treatmentTypes.value = result.sort((a, b) =>
      a.name.localeCompare(b.name, "fr"),
    );
  } catch (error) {
    treatmentTypeErrorMessage.value =
      "Impossible de charger les types de traitement.";
  } finally {
    isLoadingTreatmentTypes.value = false;
  }
};

const createTreatmentType = async () => {
  const name = newTreatmentTypeName.value.trim();
  if (!name) {
    treatmentTypeErrorMessage.value =
      "Le nom du type de traitement est obligatoire.";
    return;
  }
  treatmentTypeErrorMessage.value = "";
  isSavingTreatmentType.value = true;
  try {
    const { apiFetch } = useApi();
    await apiFetch<TreatmentType>("/treatment-types", {
      method: "POST",
      body: { name },
    });
    newTreatmentTypeName.value = "";
    await fetchTreatmentTypes();
  } catch (error) {
    treatmentTypeErrorMessage.value =
      "Impossible d'ajouter ce type de traitement.";
  } finally {
    isSavingTreatmentType.value = false;
  }
};

const startEditingTreatmentType = (type: TreatmentType) => {
  editingTreatmentTypeId.value = type.id;
  editingTreatmentTypeName.value = type.name;
  treatmentTypeErrorMessage.value = "";
};

const cancelEditingTreatmentType = () => {
  editingTreatmentTypeId.value = null;
  editingTreatmentTypeName.value = "";
};

const saveTreatmentType = async (typeId: number) => {
  const name = editingTreatmentTypeName.value.trim();
  if (!name) {
    treatmentTypeErrorMessage.value =
      "Le nom du type de traitement est obligatoire.";
    return;
  }
  treatmentTypeErrorMessage.value = "";
  isSavingTreatmentType.value = true;
  try {
    const { apiFetch } = useApi();
    await apiFetch<TreatmentType>(`/treatment-types/${typeId}`, {
      method: "PUT",
      body: { name },
    });
    cancelEditingTreatmentType();
    await fetchTreatmentTypes();
  } catch (error) {
    treatmentTypeErrorMessage.value =
      "Impossible de modifier ce type de traitement.";
  } finally {
    isSavingTreatmentType.value = false;
  }
};

const deleteTreatmentType = async (typeId: number) => {
  treatmentTypeErrorMessage.value = "";
  isSavingTreatmentType.value = true;
  try {
    const { apiFetch } = useApi();
    await apiFetch<TreatmentType>(`/treatment-types/${typeId}`, {
      method: "DELETE",
    });
    if (editingTreatmentTypeId.value === typeId) {
      cancelEditingTreatmentType();
    }
    await fetchTreatmentTypes();
  } catch (error) {
    treatmentTypeErrorMessage.value =
      "Impossible de supprimer ce type de traitement.";
  } finally {
    isSavingTreatmentType.value = false;
  }
};

// --- 2FA ---
const twoFactorEnabled = ref(false);
const isLoadingTwoFactorStatus = ref(true);

const showSetupPopup = ref(false);
const setupSecret = ref("");
const setupOtpauthUrl = ref("");
const setupCode = ref("");
const setupError = ref("");
const isEnabling = ref(false);
const recoveryCodes = ref<string[] | null>(null);

const showDisablePopup = ref(false);
const disableCode = ref("");
const disableError = ref("");
const isDisabling = ref(false);

const refreshTwoFactorStatus = async () => {
  isLoadingTwoFactorStatus.value = true;
  try {
    const status = await authStore.getTwoFactorStatus();
    twoFactorEnabled.value = status.enabled;
  } finally {
    isLoadingTwoFactorStatus.value = false;
  }
};

const startTwoFactorSetup = async () => {
  setupError.value = "";
  recoveryCodes.value = null;
  setupCode.value = "";
  try {
    const result = await authStore.setupTwoFactor();
    setupSecret.value = result.secret;
    setupOtpauthUrl.value = result.otpauthUrl;
    showSetupPopup.value = true;
  } catch (error) {
    setupError.value =
      error instanceof Error
        ? error.message
        : "Impossible de démarrer l'activation";
  }
};

const confirmTwoFactorSetup = async () => {
  setupError.value = "";
  isEnabling.value = true;
  try {
    const result = await authStore.enableTwoFactor(setupCode.value);
    recoveryCodes.value = result.recoveryCodes;
    twoFactorEnabled.value = true;
  } catch (error) {
    setupError.value = error instanceof Error ? error.message : "Code invalide";
  } finally {
    isEnabling.value = false;
  }
};

const closeSetupPopup = () => {
  showSetupPopup.value = false;
};

watch(showSetupPopup, (isOpen) => {
  if (!isOpen) {
    recoveryCodes.value = null;
    setupError.value = "";
    setupCode.value = "";
  }
});

const confirmTwoFactorDisable = async () => {
  disableError.value = "";
  isDisabling.value = true;
  try {
    await authStore.disableTwoFactor(disableCode.value);
    twoFactorEnabled.value = false;
    showDisablePopup.value = false;
    disableCode.value = "";
  } catch (error) {
    disableError.value =
      error instanceof Error ? error.message : "Code invalide";
  } finally {
    isDisabling.value = false;
  }
};

const logout = async () => {
  await authStore.logout();
  await router.push("/login");
  userStore.reset();
};

onMounted(() => {
  isClientMounted.value = true;
  isClinicRole.value = localStorage.getItem("roleId") === "3";

  refreshTwoFactorStatus();

  if (!isClinicRole.value) {
    fetchTreatmentTypes();
  }
});

onUnmounted(() => {
  if (profilePicturePreview.value?.startsWith("blob:")) {
    URL.revokeObjectURL(profilePicturePreview.value);
  }
});
</script>

<template>
  <div>
    <h1 class="mt-2 mb-4 text-2xl font-bold">Paramètres</h1>

    <BaseSection title="Mon compte">
      <label
        for="profile-picture-settings"
        class="mx-auto block w-fit cursor-pointer"
      >
        <img
          :src="
            profilePicturePreview ||
            userStore.avatarUrl ||
            '/default-avatar.png'
          "
          alt=""
          class="size-50 rounded-full object-cover"
        />
      </label>
      <input
        id="profile-picture-settings"
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

    <ClientOnly>
      <template v-if="isClientMounted && !isClinicRole">
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

        <BaseSection title="Types de traitement" class="space-y-4">
          <div class="flex flex-col gap-3 md:flex-row md:items-end">
            <div class="w-full md:flex-1">
              <BaseInput
                v-model="newTreatmentTypeName"
                label="Nouveau type"
                placeholder="Ex: Vaccination"
              />
            </div>
            <BaseButton
              class="flex justify-center"
              :class="{
                'pointer-events-none opacity-50': isSavingTreatmentType,
              }"
              @click="createTreatmentType"
            >
              Ajouter
            </BaseButton>
          </div>

          <p v-if="isLoadingTreatmentTypes" class="text-sm text-gray-600">
            Chargement des types de traitement...
          </p>

          <p
            v-else-if="treatmentTypes.length === 0"
            class="text-sm text-gray-600"
          >
            Aucun type de traitement pour le moment.
          </p>

          <div v-else class="space-y-2">
            <div
              v-for="type in treatmentTypes"
              :key="type.id"
              class="bg-background flex flex-col gap-2 rounded-xl border border-black/20 p-3 md:flex-row md:items-center"
            >
              <div
                v-if="editingTreatmentTypeId === type.id"
                class="w-full md:flex-1"
              >
                <BaseInput v-model="editingTreatmentTypeName" />
              </div>
              <p v-else class="font-semibold md:flex-1">{{ type.name }}</p>

              <div class="flex items-center gap-2">
                <template v-if="editingTreatmentTypeId === type.id">
                  <button
                    type="button"
                    class="button text-background bg-green-500"
                    :disabled="isSavingTreatmentType"
                    @click="saveTreatmentType(type.id)"
                  >
                    Enregistrer
                  </button>
                  <button
                    type="button"
                    class="button bg-grey-500 text-black"
                    :disabled="isSavingTreatmentType"
                    @click="cancelEditingTreatmentType"
                  >
                    Annuler
                  </button>
                </template>
                <template v-else>
                  <button
                    type="button"
                    class="button text-background bg-blue-500"
                    :disabled="isSavingTreatmentType"
                    @click="startEditingTreatmentType(type)"
                  >
                    Modifier
                  </button>
                  <button
                    type="button"
                    class="button bg-red text-background"
                    :disabled="isSavingTreatmentType"
                    @click="deleteTreatmentType(type.id)"
                  >
                    Supprimer
                  </button>
                </template>
              </div>
            </div>
          </div>

          <p v-if="treatmentTypeErrorMessage" class="text-sm text-red-600">
            {{ treatmentTypeErrorMessage }}
          </p>
        </BaseSection>
      </template>
    </ClientOnly>

    <BaseSection title="Sécurité" class="space-y-4">
      <div class="flex items-center justify-between gap-4">
        <div>
          <p>Double authentification (TOTP)</p>
          <p class="text-grey-700 text-sm">
            {{
              twoFactorEnabled
                ? "Activée sur ce compte."
                : "Protégez votre compte avec une application d'authentification."
            }}
          </p>
        </div>
        <BaseButton
          v-if="!isLoadingTwoFactorStatus && !twoFactorEnabled"
          @click="startTwoFactorSetup"
        >
          Activer
        </BaseButton>
        <BaseButton
          v-else-if="!isLoadingTwoFactorStatus"
          color="white"
          @click="showDisablePopup = true"
        >
          Désactiver
        </BaseButton>
      </div>
      <p v-if="setupError && !showSetupPopup" class="text-sm text-red-500">
        {{ setupError }}
      </p>
    </BaseSection>

    <p v-if="saveError" class="text-center text-sm text-red-500">
      {{ saveError }}
    </p>

    <div class="flex items-center justify-center gap-4">
      <BaseButton
        class="flex justify-center"
        :disabled="isSaving"
        @click="save"
      >
        {{ isSaving ? "Enregistrement..." : "Enregistrer" }}
      </BaseButton>
      <BaseButton class="flex justify-center" color="white" @click="logout">
        Déconnexion
      </BaseButton>
    </div>

    <BasePopup v-model="showSetupPopup" fit>
      <div class="w-72 space-y-4 text-center">
        <template v-if="!recoveryCodes">
          <p class="font-bold">Activer la double authentification</p>
          <p class="text-sm">
            Scannez ce QR code avec votre application d'authentification (Google
            Authenticator, Authy...).
          </p>
          <div class="flex w-full items-center justify-center">
            <div class="size-48">
              <Qrcode :value="setupOtpauthUrl" />
            </div>
          </div>
          <p class="text-grey-700 text-xs break-all">{{ setupSecret }}</p>
          <BaseInput v-model="setupCode" label="Code à 6 chiffres" />
          <p v-if="setupError" class="text-sm text-red-500">{{ setupError }}</p>
          <BaseButton
            :disabled="isEnabling"
            class="flex w-full justify-center"
            @click="confirmTwoFactorSetup"
          >
            {{ isEnabling ? "Vérification..." : "Confirmer" }}
          </BaseButton>
        </template>
        <template v-else>
          <p class="font-bold">Codes de récupération</p>
          <p class="text-sm">
            Conservez ces codes en lieu sûr, ils ne seront plus affichés. Ils
            permettent de vous connecter si vous perdez l'accès à votre
            application d'authentification.
          </p>
          <ul class="bg-background rounded-lg p-2 font-mono text-sm shadow">
            <li v-for="recoveryCode in recoveryCodes" :key="recoveryCode">
              {{ recoveryCode }}
            </li>
          </ul>
          <BaseButton
            class="flex w-full justify-center"
            @click="closeSetupPopup"
          >
            Terminé
          </BaseButton>
        </template>
      </div>
    </BasePopup>

    <BasePopup v-model="showDisablePopup" fit>
      <div class="w-64 space-y-4 text-center">
        <p class="font-bold">Désactiver la double authentification</p>
        <p class="text-sm">
          Entrez un code de votre application d'authentification (ou un code de
          récupération) pour confirmer.
        </p>
        <BaseInput v-model="disableCode" label="Code" />
        <p v-if="disableError" class="text-sm text-red-500">
          {{ disableError }}
        </p>
        <BaseButton
          :disabled="isDisabling"
          class="flex w-full justify-center"
          @click="confirmTwoFactorDisable"
        >
          {{ isDisabling ? "Désactivation..." : "Confirmer" }}
        </BaseButton>
      </div>
    </BasePopup>
  </div>
</template>
