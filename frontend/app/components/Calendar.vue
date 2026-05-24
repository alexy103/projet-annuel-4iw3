<script setup lang="ts">
import { CalendarDate, type DateValue } from "@internationalized/date";

const value = shallowRef(new CalendarDate(2026, 7, 6));
const placeholder = shallowRef(new CalendarDate(2026, 7, 1));

const appointmentDates = [
  new CalendarDate(2026, 7, 10),
  new CalendarDate(2026, 7, 17),
];

const hasAppointment = (date: DateValue) => {
  return appointmentDates.some((appointmentDate) => {
    return (
      appointmentDate.year === date.year &&
      appointmentDate.month === date.month &&
      appointmentDate.day === date.day
    );
  });
};

const isOutsideCurrentMonth = (date: DateValue) => {
  return (
    date.month !== placeholder.value.month ||
    date.year !== placeholder.value.year
  );
};
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
      cellTrigger: 'data-[selected]:bg-green-300 data-[selected]:text-black',
    }"
  >
    <template #day="{ day }">
      <div
        class="flex size-8 items-center justify-center rounded-full text-sm"
        :class="{
          'text-gray-300': isOutsideCurrentMonth(day),
          'bg-green-500 text-black': hasAppointment(day),
        }"
      >
        {{ day.day }}
      </div>
    </template>
  </UCalendar>
</template>
