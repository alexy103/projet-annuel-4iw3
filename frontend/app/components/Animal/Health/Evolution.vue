<script setup lang="ts">
import {
  CategoryScale,
  type ChartOptions,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  type TooltipItem,
  Tooltip,
} from "chart.js";
import { Line } from "vue-chartjs";

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
  created_at?: string;
};

type HeightRecord = {
  id: number;
  date: string;
  height: number;
  animal_id: number;
  created_at?: string;
};

const props = defineProps<{
  animalId: number;
  type: "weight" | "size";
  refreshKey?: number;
}>();

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
);

const runtimeConfig = useRuntimeConfig();
const loading = ref(false);
const fetchError = ref("");
const labels = ref<string[]>([]);
const points = ref<number[]>([]);

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

const accent = computed(() =>
  props.type === "weight"
    ? {
        line: "#3b82f6",
        fill: "rgba(59, 130, 246, 0.08)",
      }
    : {
        line: "#22c55e",
        fill: "rgba(34, 197, 94, 0.08)",
      },
);
const axisColor = "#374151";
const gridColor = "rgba(0, 0, 0, 0.08)";

const toTimestamp = (value: string) => new Date(value).getTime();

const sortByTimeline = <
  T extends { id: number; date: string; created_at?: string },
>(
  left: T,
  right: T,
) => {
  const dateDiff = toTimestamp(left.date) - toTimestamp(right.date);
  if (dateDiff !== 0) {
    return dateDiff;
  }

  const leftCreatedAt = left.created_at ? toTimestamp(left.created_at) : 0;
  const rightCreatedAt = right.created_at ? toTimestamp(right.created_at) : 0;
  const createdAtDiff = leftCreatedAt - rightCreatedAt;
  if (createdAtDiff !== 0) {
    return createdAtDiff;
  }

  return left.id - right.id;
};

const formatLabel = (value: string) =>
  new Date(value).toLocaleDateString("fr-FR");

const chartData = computed(() => ({
  labels: labels.value,
  datasets: [
    {
      data: points.value,
      borderColor: accent.value.line,
      backgroundColor: accent.value.fill,
      pointBackgroundColor: accent.value.line,
      pointBorderColor: accent.value.line,
      fill: true,
      tension: 0.35,
      pointRadius: 3,
      pointHoverRadius: 5,
      pointBorderWidth: 0,
      borderWidth: 2,
    },
  ],
}));

const chartOptions = computed<ChartOptions<"line">>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  layout: {
    padding: {
      top: 12,
      right: 14,
      bottom: 10,
      left: 14,
    },
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      displayColors: false,
      callbacks: {
        label: (context: TooltipItem<"line">) => `${context.parsed.y ?? 0}`,
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: {
        maxRotation: 0,
        autoSkip: true,
        maxTicksLimit: 4,
        color: axisColor,
        font: { size: 10, weight: 600 },
      },
      border: { display: false },
    },
    y: {
      beginAtZero: false,
      grid: { color: gridColor },
      ticks: {
        color: axisColor,
        font: { size: 10, weight: 600 },
      },
      border: { display: false },
    },
  },
}));

const fetchEvolutionData = async () => {
  loading.value = true;
  fetchError.value = "";

  try {
    if (props.type === "weight") {
      const response = await $fetch<ApiResponse<WeightRecord[]>>(
        `${runtimeConfig.public.apiUrl}/weight-records/animal/${props.animalId}`,
        { headers: authHeaders.value },
      );

      const timeline = [...response.data].sort(sortByTimeline);
      labels.value = timeline.map((record) => formatLabel(record.date));
      points.value = timeline.map((record) => record.weight);
      return;
    }

    const response = await $fetch<ApiResponse<HeightRecord[]>>(
      `${runtimeConfig.public.apiUrl}/height-records/animal/${props.animalId}`,
      { headers: authHeaders.value },
    );

    const timeline = [...response.data].sort(sortByTimeline);
    labels.value = timeline.map((record) => formatLabel(record.date));
    points.value = timeline.map((record) => record.height);
  } catch (error) {
    console.error(error);
    fetchError.value = "Impossible de charger l'évolution.";
    labels.value = [];
    points.value = [];
  } finally {
    loading.value = false;
  }
};

watch(
  () => [props.animalId, props.type, props.refreshKey],
  async () => {
    await fetchEvolutionData();
  },
  { immediate: true },
);
</script>

<template>
  <div class="mb-2 h-40 w-full rounded-xl md:flex-1">
    <div class="h-full rounded-xl bg-transparent">
      <div
        v-if="loading"
        class="flex h-full items-center justify-center text-sm font-semibold text-black/60"
      >
        Chargement...
      </div>

      <div
        v-else-if="points.length === 0"
        class="flex h-full items-center justify-center text-sm font-semibold text-black/60"
      >
        Aucune donnée
      </div>

      <div v-else class="h-full w-full p-2">
        <ClientOnly>
          <Line :data="chartData" :options="chartOptions" />
        </ClientOnly>
      </div>
    </div>

    <p
      v-if="fetchError"
      class="mt-1 text-center text-[11px] font-bold text-red-600"
    >
      {{ fetchError }}
    </p>
  </div>
</template>
