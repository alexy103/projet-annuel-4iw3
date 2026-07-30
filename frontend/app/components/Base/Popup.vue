<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from "vue";

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  fit: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue"]);

const isRendered = ref(props.modelValue);
const isVisible = ref(props.modelValue);

const lockScroll = () => {
  if (import.meta.client) {
    document.body.style.overflow = "hidden";
  }
};

const unlockScroll = () => {
  if (import.meta.client) {
    document.body.style.overflow = "";
  }
};

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      isRendered.value = true;
      lockScroll();

      requestAnimationFrame(() => {
        isVisible.value = true;
      });
    } else {
      isVisible.value = false;

      setTimeout(() => {
        isRendered.value = false;
        unlockScroll();
      }, 500);
    }
  },
  {
    immediate: true,
  },
);

const close = () => {
  emit("update:modelValue", false);
};

onBeforeUnmount(() => {
  unlockScroll();
});
</script>

<template>
  <div
    v-if="isRendered"
    class="pointer-events-none fixed inset-0 z-50 flex items-end"
  >
    <div
      class="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-250"
      :class="[
        isVisible
          ? 'pointer-events-auto opacity-100'
          : 'pointer-events-none opacity-0',
      ]"
      @click="close"
    ></div>

    <div
      class="pointer-events-auto relative mx-auto mb-4 rounded-2xl bg-white p-4 transition-transform duration-500"
      :class="[
        isVisible ? 'translate-y-0' : 'translate-y-[calc(100%+1rem)]',
        fit ? 'w-fit' : 'w-72 lg:w-240',
      ]"
    >
      <slot></slot>
    </div>
  </div>
</template>
