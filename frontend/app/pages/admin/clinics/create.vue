<script setup lang="ts">
import type { ClinicPayload } from "~/types/clinic";

definePageMeta({
  layout: "default",
});

interface Role {
  id: number;
  label: string;
}

const router = useRouter();
const { apiFetch } = useApi();
const { createClinic } = useClinics();

const name = ref("");
const address = ref("");
const city = ref("");
const postcode = ref("");
const phoneNumber = ref("");
const firstName = ref("");
const lastName = ref("");
const email = ref("");

const errorMessage = ref("");
const isSubmitting = ref(false);

const submitCreate = async () => {
  errorMessage.value = "";
  isSubmitting.value = true;
  try {
    const payload: ClinicPayload = {
      name: name.value,
      address: address.value,
      city: city.value,
      postcode: postcode.value,
      phone_number: phoneNumber.value,
    };
    const clinic = await createClinic(payload);

    const roles = await apiFetch<Role[]>("/roles");
    const clinicRole = roles.find((role) => role.label === "clinic");
    if (!clinicRole) {
      throw new Error("Rôle clinique introuvable");
    }

    const user = await apiFetch<{ id: number }>("/users", {
      method: "POST",
      body: {
        first_name: firstName.value,
        last_name: lastName.value,
        email: email.value,
        role_id: clinicRole.id,
        clinic_id: clinic.id,
      },
    });

    await apiFetch(`/users/${user.id}/clinic`, {
      method: "PATCH",
      body: { clinic_id: clinic.id },
    });

    await router.push("/admin");
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : "Création impossible";
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center gap-3">
      <NuxtLink to="/admin">
        <Icon name="material-symbols:arrow-back" class="size-6 text-black" />
      </NuxtLink>
      <h1 class="text-2xl font-bold">Créer une clinique</h1>
    </div>

    <form @submit.prevent="submitCreate" class="space-y-6">
      <div class="space-y-3">
        <h2 class="text-lg font-bold">Informations de la clinique</h2>
        <BaseInput v-model="name" label="Nom de la clinique" />
        <BaseInput v-model="address" label="Adresse" />
        <BaseInput v-model="city" label="Ville" />
        <BaseInput v-model="postcode" label="Code postal" />
        <BaseInput v-model="phoneNumber" label="Téléphone" type="tel" />
      </div>

      <div class="space-y-3">
        <h2 class="text-lg font-bold">Compte de connexion</h2>
        <p class="text-sm text-gray-400">
          Un mot de passe temporaire et un code de vérification seront envoyés
          par e-mail à la clinique.
        </p>
        <BaseInput v-model="firstName" label="Prénom du responsable" />
        <BaseInput v-model="lastName" label="Nom du responsable" />
        <BaseInput v-model="email" label="Adresse e-mail" type="email" />
      </div>

      <p v-if="errorMessage" class="text-center text-sm text-red-500">
        {{ errorMessage }}
      </p>

      <button
        type="submit"
        :disabled="isSubmitting"
        class="w-full rounded-full bg-[#15D98B] py-3 font-bold text-white transition-transform duration-200 hover:scale-[1.02] disabled:opacity-50"
      >
        {{ isSubmitting ? "Création..." : "Créer le compte clinique" }}
      </button>
    </form>
  </div>
</template>
