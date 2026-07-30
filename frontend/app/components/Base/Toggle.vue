<script setup>
const model = defineModel({
  type: Boolean,
  default: false,
});
</script>

<template>
  <button
    class="relative h-6 w-15 cursor-pointer rounded-full transition-colors duration-300"
    :class="model ? 'bg-green-200' : 'bg-grey-500'"
    @click="model = !model"
    type="button"
  >
    <span
      class="absolute top-1/2 left-0 h-full w-1/2 -translate-y-1/2 rounded-full transition-all duration-300"
      :class="
        model ? 'translate-x-full bg-green-500' : 'translate-x-0 bg-black'
      "
    ></span>
  </button>
</template>
