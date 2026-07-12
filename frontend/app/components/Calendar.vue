<script setup lang="ts">
import { CalendarDate, type DateValue } from "@internationalized/date";

const props = defineProps<{
  appointmentDates?: string[];
}>();

const emit = defineEmits<{
  "day-click": [date: string];
}>();

const today = new Date();
const value = shallowRef(
  new CalendarDate(
    today.getFullYear(),
    today.getMonth() + 1,
    today.getDate(),
  ),
);
const placeholder = shallowRef(
  new CalendarDate(today.getFullYear(), today.getMonth() + 1, 1),
);

const parsedAppointmentDates = computed(() => {
  const dates = props.appointmentDates ?? [];

  return dates
    .map((rawDate) => {
      const datePart = rawDate.includes("T")
        ? (rawDate.split("T")[0] ?? rawDate)
        : rawDate;
      const [year = 0, month = 0, day = 0] = datePart.split("-").map(Number);

      if (!year || !month || !day) {
        return null;
      }

      return new CalendarDate(year, month, day);
    })
    .filter((date): date is CalendarDate => date !== null);
});

const hasAppointment = (date: DateValue) => {
  return parsedAppointmentDates.value.some((appointmentDate) => {
    return (
      appointmentDate.year === date.year &&
      appointmentDate.month === date.month &&
      appointmentDate.day === date.day
    );
  });
};

const isToday = (date: DateValue) => {
  return (
    date.year === today.getFullYear() &&
    date.month === today.getMonth() + 1 &&
    date.day === today.getDate()
  );
};

const isOutsideCurrentMonth = (date: DateValue) => {
  return (
    date.month !== placeholder.value.month ||
    date.year !== placeholder.value.year
  );
};

const toDateOnlyString = (date: DateValue): string => {
  const month = String(date.month).padStart(2, "0");
  const day = String(date.day).padStart(2, "0");

  return `${date.year}-${month}-${day}`;
};

watch(value, (selectedDate) => {
  emit("day-click", toDateOnlyString(selectedDate));
});
</script>

<template>
  <UCalendar
    v-model="value"
    v-model:placeholder="placeholder"
    color="success"
    :week-starts-on="1"
    weekday-format="short"
    :ui="{
      headCell: 'text-black',
      cellTrigger: 'data-[selected]:bg-transparent',
    }"
  >
    <template #day="{ day }">
      <div
        class="flex size-8 items-center justify-center rounded-full text-sm"
        :class="{
          'text-gray-300': isOutsideCurrentMonth(day),
          'bg-green-500 text-black': isToday(day),
          'bg-green-300 text-black': hasAppointment(day) && !isToday(day),
        }"
      >
        {{ day.day }}
      </div>
    </template>
  </UCalendar>
</template>
