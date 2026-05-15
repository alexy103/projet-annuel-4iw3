<script setup lang="ts">
const props = defineProps<{
  id: string;
  label?: string;
  modelValue?: string | null;
  options: string[];
  disabled?: boolean;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string | null];
}>();

const handleChange = (event: Event) => {
  const input = event.target as HTMLSelectElement;
  const value = input.value || null;

  emit("update:modelValue", value);
};
</script>

<template>
  <div>
    <label
      :for="props.id"
      class="mb-1 block text-center text-sm"
      v-if="props.label"
    >
      {{ props.label }}
    </label>

    <select
      :id="props.id"
      :value="props.modelValue ?? ''"
      :disabled="props.disabled"
      class="min-w-40 cursor-pointer rounded-full border px-2 shadow focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
      @change="handleChange"
    >
      <option value=""></option>
      <option v-for="option in props.options" :key="option" :value="option">
        {{ option }}
      </option>
    </select>
  </div>
</template>
