<script setup lang="ts">
const props = defineProps<{
  label: string;
  placeholder?: string;
  type?: string;
  value?: string;
}>();

const inputValue = ref(props.value || "");
</script>

<template>
  <div>
    <label class="mb-1 block text-center text-sm">
      {{ label }}
    </label>
    <input
      v-model="inputValue"
      :placeholder="placeholder"
      class="input bg-background w-full font-normal shadow placeholder:text-gray-400 focus:outline-none"
      :class="inputValue ? 'text-black' : 'text-gray-400'"
      :type="type || 'text'"
    />
  </div>
</template>
