<script setup lang="ts">
const props = defineProps<{
  label?: string;
  placeholder?: string;
  type?: string;
  value?: string;
  modelValue?: string;
  small?: boolean;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

// `value` is kept as a static initial value for uncontrolled/legacy usages
// (e.g. display-only fields). `modelValue` takes over as soon as a parent
// binds `v-model` on the component.
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
      :class="[
        'input bg-background font-normal shadow placeholder:text-gray-400 focus:outline-none',
        inputValue ? 'text-black' : 'text-gray-400',
        small ? 'w-16' : 'w-full',
      ]"
      :type="type || 'text'"
    />
  </div>
</template>
