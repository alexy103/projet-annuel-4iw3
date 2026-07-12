<script setup lang="ts">
const props = defineProps<{
  id?: number;
  animal?: string;
  today?: boolean;
  type?: string;
  date?: string;
  time?: string;
  clinic?: string;
  compact?: boolean;
}>();

const appointmentLink = computed(() => {
  return `/appointment/${props.id ?? 1}`;
});

const displayAnimal = computed(() => {
  return props.animal || "Scooby";
});

const displayType = computed(() => {
  return props.type || "Vaccin";
});

const displayDate = computed(() => {
  if (props.today && props.time) {
    return `Aujourd'hui - ${props.time}`;
  }

  if (props.today) {
    return "Aujourd'hui - 14h30";
  }

  if (props.date && props.time) {
    return `${props.date} - ${props.time}`;
  }

  return props.date || "14/10/2026";
});

const displayClinic = computed(() => {
  return props.clinic || "Clinique Paul Picquet";
});
</script>

<template>
  <NuxtLink
    v-if="animal && !compact"
    :to="appointmentLink"
    class="flex w-full items-center rounded-xl bg-green-300 px-3 py-2"
  >
    <p class="text-lg font-bold">{{ displayAnimal }}</p>
    <div class="flex-1 text-center">
      <p class="font-bold">{{ displayDate }}</p>
      <p>{{ displayClinic }}</p>
    </div>
    <p>{{ displayType }}</p>
  </NuxtLink>
  <NuxtLink v-else :to="appointmentLink" class="rounded-xl">
    <article class="relative w-45 shrink-0 rounded-xl bg-green-300 p-3">
      <Icon
        name="material-symbols:arrow-right-alt-rounded"
        class="absolute top-3 right-2 size-6"
      />

      <p class="mb-1 font-bold">{{ displayAnimal }}</p>
      <h1 class="mb-1 font-bold">{{ displayType }}</h1>
      <span class="italic">{{ props.date || "14/10/2026" }}</span>

      <p class="mt-5">{{ displayClinic }}</p>
    </article>
  </NuxtLink>
</template>
