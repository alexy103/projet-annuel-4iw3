<script setup lang="ts">
const props = defineProps<{
  label?: string;
  placeholder?: string;
  type?: string;
  modelValue?: string;
  small?: boolean;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const inputValue = computed({
  get: () => props.modelValue || "",
  set: (value: string) => emit("update:modelValue", value),
});
</script>

<template>
  <div>
    <label class="mb-1 block text-center text-sm" v-if="label">
      {{ label }}
    </label>
    <input
      v-model="inputValue"
      :placeholder="placeholder"
      :class="[
        'input bg-background font-normal shadow placeholder:text-gray-400 focus:outline-none',
        inputValue ? 'text-black' : 'text-gray-400',
        small ? 'w-16' : 'w-full',
      ]"
      :type="type || 'text'"
    />
  </div>
</template>
