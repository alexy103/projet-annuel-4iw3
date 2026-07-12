<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue?: string;
    leftLabel?: string;
    rightLabel?: string;
    leftValue?: string;
    rightValue?: string;
  }>(),
  {
    modelValue: "size",
    leftLabel: "Taille",
    rightLabel: "Poids",
    leftValue: "size",
    rightValue: "weight",
  },
);

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const isLeftSelected = computed(() => props.modelValue === props.leftValue);
const activeBgClass = computed(() =>
  isLeftSelected.value ? "bg-green-500" : "bg-blue-500",
);

const selectLeft = () => {
  emit("update:modelValue", props.leftValue);
};

const selectRight = () => {
  emit("update:modelValue", props.rightValue);
};
</script>

<template>
  <div class="bg-grey-500 relative w-fit max-w-full rounded-full shadow">
    <div
      class="absolute inset-y-0 rounded-full transition-all duration-300 ease-in-out"
      :class="[
        activeBgClass,
        isLeftSelected ? 'left-0 w-1/2' : 'left-1/2 w-1/2',
      ]"
    />

    <button
      type="button"
      class="relative z-10 cursor-pointer rounded-full px-4 py-2 text-sm font-bold transition-colors duration-300 sm:px-6"
      :class="isLeftSelected ? 'text-white' : 'text-black'"
      @click="selectLeft"
    >
      {{ leftLabel }}
    </button>

    <button
      type="button"
      class="relative z-10 cursor-pointer rounded-full px-4 py-2 text-sm font-bold transition-colors duration-300 sm:px-6"
      :class="!isLeftSelected ? 'text-white' : 'text-black'"
      @click="selectRight"
    >
      {{ rightLabel }}
    </button>
  </div>
</template>
