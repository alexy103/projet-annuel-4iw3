<script setup lang="ts"></script>

<template>
  <div>
    <h1 class="mt-2 mb-4 text-2xl font-bold">Bienvenue, John !</h1>

    <BaseSection title="À venir" action="Tout voir" color="green">
      <div class="-mx-4 flex gap-2 overflow-x-auto px-4">
        <Appointment v-for="i in 4" />
      </div>
    </BaseSection>

    <BaseSection title="Mes animaux" action="Ajouter un animal" color="blue">
      <div class="grid w-full grid-cols-2 justify-items-center gap-4">
        <AnimalCard v-for="i in 4" src="/kyky.jpg" />
      </div>
    </BaseSection>
  </div>
</template>
