<script setup lang="ts">
const showInfo = ref(false);
</script>
<template>
  <div>
    <figure class="mb-4 flex flex-col items-center justify-center">
      <div class="mb-2 flex flex-col items-center">
        <div class="flex items-center">
          <h1 class="text-2xl font-bold">Kyky</h1>
          <Icon name="material-symbols:male" class="text-blue-dark size-6" />
        </div>
        <span class="text-grey-700 italic">European shorthair</span>
      </div>
      <div class="relative mb-5">
        <img src="/kyky.jpg" alt="" class="size-50 rounded-full object-cover" />
        <ul>
          <li
            class="bg-green-light absolute top-0 -right-3 flex w-fit cursor-pointer items-center justify-center rounded-full p-1"
          >
            <Icon
              name="material-symbols:qr-code-rounded"
              class="size-6 text-black"
            />
          </li>
          <li
            class="bg-green-light absolute -right-3 bottom-0 flex w-fit cursor-pointer items-center justify-center rounded-full p-1"
            @click="showInfo = true"
          >
            <Icon
              name="material-symbols:info-i-rounded"
              class="size-6 text-black"
            />
          </li>
          <li
            class="bg-green-light absolute bottom-0 -left-3 flex w-fit cursor-pointer items-center justify-center rounded-full p-1"
          >
            <Icon
              name="material-symbols:edit-outline-rounded"
              class="size-6 text-black"
            />
          </li>
        </ul>
      </div>
      <div class="flex items-center gap-1">
        <Icon name="material-symbols:calendar-today-rounded" class="size-6" />
        <p>4 ans et 10 mois</p>
      </div>
    </figure>

    <BaseSection title="À venir" action="Tout voir" color="green">
      <div class="-mx-4 flex gap-2 overflow-x-auto px-4">
        <Appointment v-for="i in 4" />
      </div>
    </BaseSection>

    <div class="md:flex md:items-stretch md:gap-16">
      <BaseSection title="Carnet de santé" color="blue">
        <div class="grid grid-cols-2 gap-4 md:w-fit">
          <AnimalHealthGraph type="weight" />
          <AnimalHealthData type="weight" />
          <AnimalHealthData type="size" />
          <AnimalHealthGraph type="size" />
        </div>
      </BaseSection>

      <BaseSection
        title="Évolution"
        action="Nouvelle mesure"
        plus
        color="green"
        class="md:flex md:flex-1 md:flex-col md:items-stretch"
      >
        <div class="md:flex md:flex-1 md:flex-col md:items-stretch">
          <div class="bg-grey-500 mb-2 h-40 w-full rounded-xl md:flex-1"></div>

          <BaseToggle
            class="mx-auto"
            left-label="Nouvelle mesure"
            right-label="Ancienne mesure"
          />
        </div>
      </BaseSection>
    </div>

    <BaseSection title="Images" color="blue">
      <div class="grid grid-cols-2 gap-3">
        <img v-for="i in 4" src="/kyky2.jpg" alt="" />
      </div>
    </BaseSection>
  </div>

  <BasePopup v-model="showInfo">
    <h2 class="mb-2 text-center font-bold">Informations supplémentaires</h2>

    <p>Date de naissance : 25/12/2020</p>
    <p>Date d’adoption : 25/12/2021</p>

    <button class="button-sm mx-auto mt-4 border shadow">
      <Icon
        name="material-symbols:add-2-rounded"
        class="text-red size-6 rotate-45"
      />
      Supprimer cet animal
    </button>
  </BasePopup>
</template>
