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

const config = useRuntimeConfig();

const value = ref<number | null>(null);
const measurementDate = ref<string | null>(null);
const loading = ref(false);
const fetchError = ref("");

const color = computed(() =>
  props.type === "weight" ? "text-blue-500" : "text-green-500",
);
const label = computed(() => (props.type === "weight" ? "kg" : "cm"));
const displayedValue = computed(() =>
  value.value === null ? "--" : String(Math.trunc(value.value)),
);

const authHeaders = computed(() => {
  const headers: Record<string, string> = {
    "x-api-key": config.public.apiKey,
  };

  if (import.meta.client) {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }
  }

  return headers;
});

const getRecordTimestamp = (recordDate: string) => new Date(recordDate).getTime();

const fetchLatestMeasurement = async () => {
  loading.value = true;
  fetchError.value = "";

  try {
    if (props.type === "weight") {
      const response = await $fetch<ApiResponse<WeightRecord[]>>(
        `${config.public.apiUrl}/weight-records/animal/${props.animalId}`,
        { headers: authHeaders.value },
      );

      const latest = [...response.data].sort(
        (a, b) => getRecordTimestamp(b.date) - getRecordTimestamp(a.date),
      )[0];

      value.value = latest?.weight ?? null;
      measurementDate.value = latest?.date ?? null;
      return;
    }

    const response = await $fetch<ApiResponse<HeightRecord[]>>(
      `${config.public.apiUrl}/height-records/animal/${props.animalId}`,
      { headers: authHeaders.value },
    );

    const latest = [...response.data].sort(
      (a, b) => getRecordTimestamp(b.date) - getRecordTimestamp(a.date),
    )[0];

    value.value = latest?.height ?? null;
    measurementDate.value = latest?.date ?? null;
  } catch (error) {
    console.error(error);
    fetchError.value = "Impossible de charger la mesure.";
    value.value = null;
    measurementDate.value = null;
  } finally {
    loading.value = false;
  }
};

watch(
  () => [props.animalId, props.type, props.refreshKey],
  async () => {
    await fetchLatestMeasurement();
  },
  { immediate: true },
);
</script>

<template>
  <div
    class="size-40 rounded-2xl border-2 border-black p-4 font-bold text-black shadow-lg"
  >
    <p>Dernière mesure</p>
    <p>
      <span :class="color" class="text-5xl font-black">{{ displayedValue }}</span>
      <span>{{ label }}</span>
    </p>
    <p v-if="measurementDate">
      {{ new Date(measurementDate).toLocaleDateString("fr-FR") }}
    </p>
    <p v-else-if="loading">Chargement...</p>
    <p v-else>Aucune mesure</p>
    <p v-if="fetchError" class="text-xs text-red-600">{{ fetchError }}</p>
  </div>
</template>
