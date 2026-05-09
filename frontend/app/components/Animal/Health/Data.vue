<script setup lang="ts">
const props = defineProps<{ type: "weight" | "size" }>();

const color = props.type === "weight" ? "text-blue" : "text-green-500";
const label = props.type === "weight" ? "kg" : "cm";
</script>

<template>
  <div
    class="size-40 rounded-2xl border-2 border-black p-4 font-bold text-black shadow-lg"
  >
    <p>Dernière mesure</p>
    <p>
      <span :class="color" class="text-5xl font-black">34</span>
      <span>{{ label }}</span>
    </p>
    27/12/2025
  </div>
</template>
