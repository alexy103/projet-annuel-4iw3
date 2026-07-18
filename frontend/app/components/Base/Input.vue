<script setup lang="ts">
const props = defineProps<{
  label?: string;
  placeholder?: string;
  type?: string;
  value?: string;
  modelValue?: string | number | null;
  small?: boolean;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const inputValue = computed({
  get: () => props.modelValue ?? props.value ?? "",
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
      :disabled="disabled"
      :class="[
        'input bg-background font-normal shadow placeholder:text-gray-400 focus:outline-none',
        inputValue ? 'text-black' : 'text-gray-400',
        small ? 'w-16' : 'w-full',
        disabled ? 'cursor-not-allowed opacity-50' : '',
      ]"
      :type="type || 'text'"
    />
  </div>
</template>
