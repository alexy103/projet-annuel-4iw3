<script setup lang="ts">
defineProps<{ type: "weight" | "size" }>();

const config = {
  weight: {
    bg: "bg-blue-500",
    label: "Poids",
    position: "right-1 bottom-1",
  },
  size: {
    bg: "bg-green-500",
    label: "Taille",
    position: "top-1 left-1",
  },
};
</script>

<template>
  <div
    class="relative size-40 rounded-2xl p-4 text-white shadow-lg"
    :class="config[type].bg"
  >
    <span class="absolute p-2 text-sm font-bold" :class="config[type].position">
      {{ config[type].label }}
    </span>
  </div>
</template>
