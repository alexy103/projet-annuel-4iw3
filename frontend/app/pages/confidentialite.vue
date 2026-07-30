<script setup lang="ts">
definePageMeta({
  layout: false,
});

const { consent, accept, refuse } = useCookieConsent();

const choiceLabel = computed(() => {
  if (consent.value === "accepted") return "Vous avez accepté les cookies de mesure d'audience.";
  if (consent.value === "refused") return "Vous avez refusé les cookies de mesure d'audience.";
  return "Vous n'avez pas encore fait de choix.";
});
</script>

<template>
  <div class="mx-auto min-h-screen max-w-2xl space-y-6 px-4 py-8">
    <div class="flex items-center gap-3">
      <button class="cursor-pointer" @click="$router.back()">
        <Icon name="material-symbols:arrow-back" class="size-6 text-black" />
      </button>
      <h1 class="text-2xl font-bold">Politique de confidentialité</h1>
    </div>

    <p class="text-sm text-gray-500">
      PawTracker s'engage à protéger vos données personnelles conformément au
      Règlement Général sur la Protection des Données (RGPD).
    </p>

    <section class="space-y-2">
      <h2 class="text-lg font-bold">1. Données que nous collectons</h2>
      <ul class="list-disc space-y-1 pl-5 text-sm text-gray-700">
        <li>Informations de compte : nom, prénom, adresse e-mail.</li>
        <li>Données relatives à vos animaux et à leurs rendez-vous.</li>
        <li>Pour les cliniques : coordonnées de l'établissement.</li>
        <li>
          Statistiques d'usage anonymisées via Umami (uniquement si vous y
          consentez).
        </li>
      </ul>
    </section>

    <section class="space-y-2">
      <h2 class="text-lg font-bold">2. Finalités</h2>
      <p class="text-sm text-gray-700">
        Vos données sont utilisées pour fournir le service (gestion des comptes,
        des animaux et des rendez-vous), assurer la sécurité de l'application et,
        avec votre accord, mesurer l'audience de façon anonyme pour l'améliorer.
      </p>
    </section>

    <section class="space-y-2">
      <h2 class="text-lg font-bold">3. Cookies</h2>
      <p class="text-sm text-gray-700">
        <strong>Cookies essentiels :</strong> nécessaires à l'authentification
        et au fonctionnement du site. Ils ne peuvent pas être désactivés.
      </p>
      <p class="text-sm text-gray-700">
        <strong>Cookies non essentiels :</strong> mesure d'audience via Umami.
        Ils ne sont déposés qu'après votre consentement, et sont désactivés par
        défaut.
      </p>
    </section>

    <section class="space-y-2">
      <h2 class="text-lg font-bold">4. Durée de conservation</h2>
      <p class="text-sm text-gray-700">
        Vos données sont conservées tant que votre compte est actif. À la
        suppression de votre compte, elles sont effacées.
      </p>
    </section>

    <section class="space-y-2">
      <h2 class="text-lg font-bold">5. Vos droits</h2>
      <p class="text-sm text-gray-700">
        Vous disposez d'un droit d'accès, de rectification, de suppression,
        d'opposition et de portabilité de vos données. Vous pouvez les exercer en
        nous contactant à
        <a href="mailto:contact@pawtracker.fr" class="text-[#15D98B] underline">
          contact@pawtracker.fr</a
        >.
      </p>
    </section>

    <section class="space-y-3 rounded-2xl border border-gray-200 bg-white p-4">
      <h2 class="text-lg font-bold">Gérer mes cookies</h2>
      <p class="text-sm text-gray-500">{{ choiceLabel }}</p>
      <div class="flex gap-2">
        <button
          class="cursor-pointer rounded-full bg-gray-200 px-4 py-2 text-sm font-bold text-black transition-transform duration-200 hover:scale-105"
          @click="refuse"
        >
          Refuser les cookies analytiques
        </button>
        <button
          class="cursor-pointer rounded-full bg-[#15D98B] px-4 py-2 text-sm font-bold text-white transition-transform duration-200 hover:scale-105"
          @click="accept"
        >
          Accepter les cookies analytiques
        </button>
      </div>
    </section>
  </div>
</template>
