<script setup lang="ts">
type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

type WeightRecord = {
  id: number;
  date: string;
  weight: number;
  animal_id: number;
};

type HeightRecord = {
  id: number;
  date: string;
  height: number;
  animal_id: number;
};

const props = defineProps<{
  type: "weight" | "size";
  animalId: number;
  refreshKey?: number;
}>();

const config = {
  weight: {
    bg: "bg-blue-500",
    label: "Poids",
    position: "right-1 bottom-1",
  },
  size: {
    bg: "bg-green-500",
    label: "Taille",
    position: "top-1 left-1",
  },
} as const;

const runtimeConfig = useRuntimeConfig();
const loading = ref(false);
const fetchError = ref("");
const values = ref<number[]>([]);

const authHeaders = computed(() => {
  const headers: Record<string, string> = {
    "x-api-key": runtimeConfig.public.apiKey,
  };

  if (import.meta.client) {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }
  }

  return headers;
});

const chartValues = computed(() => values.value.slice(-6));
const maxValue = computed(() => Math.max(...chartValues.value, 1));

const chartContainerClass = computed(() =>
  props.type === "size"
    ? "absolute right-4 bottom-3 left-4 flex h-22 items-end justify-stretch gap-1"
    : "mt-3 flex h-22 w-full items-end justify-stretch gap-1",
);

const barHeights = computed(() =>
  chartValues.value.map((value) =>
    Math.max(12, Math.round((value / maxValue.value) * 100)),
  ),
);

const getTimestamp = (date: string) => new Date(date).getTime();

const fetchGraphData = async () => {
  loading.value = true;
  fetchError.value = "";

  try {
    if (props.type === "weight") {
      const response = await $fetch<ApiResponse<WeightRecord[]>>(
        `${runtimeConfig.public.apiUrl}/weight-records/animal/${props.animalId}`,
        { headers: authHeaders.value },
      );

      values.value = [...response.data]
        .sort((a, b) => getTimestamp(a.date) - getTimestamp(b.date))
        .map((record) => record.weight);
    } else {
      const response = await $fetch<ApiResponse<HeightRecord[]>>(
        `${runtimeConfig.public.apiUrl}/height-records/animal/${props.animalId}`,
        { headers: authHeaders.value },
      );

      values.value = [...response.data]
        .sort((a, b) => getTimestamp(a.date) - getTimestamp(b.date))
        .map((record) => record.height);
    }
  } catch (error) {
    console.error(error);
    fetchError.value = "Erreur chargement";
    values.value = [];
  } finally {
    loading.value = false;
  }
};

watch(
  () => [props.animalId, props.type, props.refreshKey],
  async () => {
    await fetchGraphData();
  },
  { immediate: true },
);
</script>

<template>
  <div
    class="relative aspect-square w-full max-w-40 rounded-2xl p-4 text-white shadow-lg"
    :class="config[type].bg"
  >
    <span class="absolute p-2 text-sm font-bold" :class="config[type].position">
      {{ config[type].label }}
    </span>

    <div v-if="loading" class="flex h-full items-end justify-center text-xs">
      Chargement...
    </div>

    <div v-else-if="chartValues.length > 0" :class="chartContainerClass">
      <div
        v-for="(height, index) in barHeights"
        :key="index"
        class="flex h-full flex-1 items-end justify-center"
      >
        <div
          class="w-full max-w-4 rounded-sm bg-white/90"
          :style="{ height: `${height}%` }"
        />
      </div>
    </div>

    <div v-else class="flex h-full items-end justify-center text-xs">
      Aucune mesure
    </div>

    <p v-if="fetchError" class="absolute bottom-1 left-1 text-[10px]">
      {{ fetchError }}
    </p>
  </div>
</template>
