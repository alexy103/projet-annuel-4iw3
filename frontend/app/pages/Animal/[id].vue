<script setup lang="ts">
const showInfo = ref(false);
const showQr = ref(false);
const showEdit = ref(false);

const submitEdit = () => {
  console.log("submit");
};
</script>
<template>
  <div>
    <figure class="mb-4 flex flex-col items-center justify-center">
      <div class="mb-2 flex flex-col items-center">
        <div class="flex items-center">
          <h1 class="text-2xl font-bold">Kyky</h1>
          <Icon name="material-symbols:male" class="size-6 text-blue-700" />
        </div>
        <span class="text-grey-700 italic">European shorthair</span>
      </div>
      <div class="relative mb-5">
        <img src="/kyky.jpg" alt="" class="size-50 rounded-full object-cover" />
        <ul>
          <li
            class="absolute top-0 -right-3 flex w-fit cursor-pointer items-center justify-center rounded-full bg-green-300 p-1"
            @click="showQr = true"
          >
            <Icon
              name="material-symbols:qr-code-rounded"
              class="size-6 text-black"
            />
          </li>
          <li
            class="absolute -right-3 bottom-0 flex w-fit cursor-pointer items-center justify-center rounded-full bg-green-300 p-1"
            @click="showInfo = true"
          >
            <Icon
              name="material-symbols:info-i-rounded"
              class="size-6 text-black"
            />
          </li>
          <li
            class="absolute bottom-0 -left-3 flex w-fit cursor-pointer items-center justify-center rounded-full bg-green-300 p-1"
            @click="showEdit = true"
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

    <BaseSection title="À venir" action="Tout voir">
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
        class="md:flex md:flex-1 md:flex-col md:items-stretch"
      >
        <div class="md:flex md:flex-1 md:flex-col md:items-stretch">
          <div class="bg-grey-500 mb-2 h-40 w-full rounded-xl md:flex-1"></div>

          <AnimalStatsToggle
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
    <p>Date d'adoption : 25/12/2021</p>

    <button class="button-sm mx-auto mt-4 border shadow">
      <Icon
        name="material-symbols:add-2-rounded"
        class="text-red size-6 rotate-45"
      />
      Supprimer cet animal
    </button>
  </BasePopup>

  <BasePopup v-model="showQr" fit>
    <div class="flex w-full items-center justify-center">
      <div class="size-64 h-fit lg:size-80">
        <Qrcode value="https://nuxt.com/modules/qrcode" />
      </div>
    </div>
  </BasePopup>

  <BasePopup v-model="showEdit">
    <form @submit.prevent="submitEdit">
      <h2 class="mb-2 text-center font-bold">Modifier les informations</h2>

      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-1">
          <label for="name" class="text-sm font-medium">Nom</label>
          <input
            id="name"
            type="text"
            value="Kyky"
            class="border-grey-300 rounded-lg border bg-white px-3 py-2 focus:border-green-700 focus:outline-none"
          />
        </div>

        <div class="flex flex-col gap-1">
          <label for="species" class="text-sm font-medium">Espèce</label>
          <select
            id="species"
            class="border-grey-300 rounded-lg border bg-white px-3 py-2 focus:border-green-700 focus:outline-none"
          >
            <option value="cat" selected>Chat</option>
            <option value="dog">Chien</option>
          </select>
        </div>

        <div class="flex flex-col gap-1">
          <label for="breed" class="text-sm font-medium">Race</label>
          <select
            id="breed"
            class="border-grey-300 rounded-lg border bg-white px-3 py-2 focus:border-green-700 focus:outline-none"
          >
            <option value="european-shorthair" selected>
              European shorthair
            </option>
            <option value="maine-coon">Maine Coon</option>
          </select>
        </div>

        <!-- birth date -->
        <div class="flex flex-col gap-1">
          <label for="birth" class="text-sm font-medium">
            Date de naissance
          </label>
          <input
            id="birth"
            type="date"
            class="border-grey-300 rounded-lg border bg-white px-3 py-2 focus:border-green-700 focus:outline-none"
            value="2020-07-15"
          />
        </div>

        <div class="flex flex-col gap-1">
          <label for="picture" class="text-sm font-medium">
            Nouvelle photo
          </label>
          <input
            id="picture"
            type="file"
            accept="image/*"
            class="border-grey-300 rounded-lg border bg-white px-3 py-2 focus:border-green-700 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          class="cursor-pointer rounded-lg bg-green-700 px-4 py-2 font-medium text-white transition-colors hover:bg-green-900"
        >
          Enregistrer
        </button>
      </div>
    </form>
  </BasePopup>
</template>
