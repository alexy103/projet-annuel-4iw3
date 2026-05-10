<script setup lang="ts">
defineProps({
  color: {
    type: String,
    validator: (value: string) => ["blue", "green", "white"].includes(value),
    default: "green",
  },
});
</script>

<template>
  <div>
    <button
      class="button text-background cursor-pointer font-normal shadow"
      :class="{
        'bg-blue-500': color === 'blue',
        'bg-green-500': color === 'green',
        'bg-background border text-black': color === 'white',
      }"
    >
      <slot></slot>
    </button>
  </div>
</template>
