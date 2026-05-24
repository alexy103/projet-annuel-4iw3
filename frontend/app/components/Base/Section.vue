<script setup lang="ts">
defineProps({
  title: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    validator: (value: string) => ["blue", "green"].includes(value),
    default: "green",
  },
  action: {
    type: String,
  },
  link: {
    type: String,
  },
  plus: {
    type: Boolean,
    default: false,
  },
});
</script>

<template>
  <div class="mb-4">
    <div v-if="action" class="mb-4 flex items-center justify-between">
      <h2
        class="relative font-bold after:absolute after:-bottom-px after:left-0 after:h-1 after:w-10 after:rounded-full after:content-['']"
        :class="{
          'after:bg-green-500': color === 'green',
          'after:bg-blue-500': color === 'blue',
        }"
      >
        {{ title }}
      </h2>
      <NuxtLink v-if="link" :to="link">
        <BaseButton>
          <Icon
            v-if="plus"
            name="material-symbols:add-rounded"
            class="size-5"
          ></Icon>
          {{ action }}
        </BaseButton>
      </NuxtLink>

      <BaseButton v-else>
        <Icon
          v-if="plus"
          name="material-symbols:add-rounded"
          class="size-5"
        ></Icon>
        {{ action }}
      </BaseButton>
    </div>

    <h2
      v-else
      class="relative mb-4 font-bold after:absolute after:-bottom-px after:left-0 after:h-1 after:w-10 after:rounded-full after:content-['']"
      :class="{
        'after:bg-green-500': color === 'green',
        'after:bg-blue-500': color === 'blue',
      }"
    >
      {{ title }}
    </h2>

    <slot></slot>
  </div>
</template>
