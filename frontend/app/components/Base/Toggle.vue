<template>
  <div class="bg-grey-500 relative w-fit rounded-full shadow">
    <div
      class="bg-green absolute inset-y-0 rounded-full transition-all duration-300 ease-in-out"
      :class="selected === 'Taille' ? 'left-0 w-1/2' : 'left-1/2 w-1/2'"
    ></div>

    <button
      class="relative z-10 cursor-pointer rounded-full px-6 py-2 font-bold transition-colors duration-300"
      :class="selected === 'Taille' ? 'text-white' : 'text-black'"
      @click="selected = 'Taille'"
      type="button"
    >
      Taille
    </button>

    <button
      class="relative z-10 cursor-pointer rounded-full px-6 py-2 font-bold transition-colors duration-300"
      :class="selected === 'Poids' ? 'text-white' : 'text-black'"
      @click="selected = 'Poids'"
      type="button"
    >
      Poids
    </button>
  </div>
</template>

<script setup>
import { ref } from "vue";

const selected = ref("Poids");
</script>
