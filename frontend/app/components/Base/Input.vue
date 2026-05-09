<script setup lang="ts">
defineProps<{
  label: string;
  placeholder?: string;
  type?: string;
}>();

const inputValue = ref("");
</script>

<template>
  <div>
    <label class="mb-1 block text-center text-sm">
      {{ label }}
    </label>
    <input
      v-model="inputValue"
      :placeholder="placeholder"
      class="input w-full font-normal shadow placeholder:text-gray-400 focus:outline-none"
      :class="inputValue ? 'text-black' : 'text-gray-400'"
      :type="type || 'text'"
    />
  </div>
</template>
