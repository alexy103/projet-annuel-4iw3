<script setup></script>

<template>
  <BaseSection title="Aujourd'hui" class="space-y-2">
    <Appointment animal="Scooby" today />
    <Appointment animal="Scooby" today />
  </BaseSection>
  <BaseSection title="Calendrier" class="space-y-2" color="blue">
    <Calendar />
  </BaseSection>
  <BaseSection title="Mes prochains RDV" class="space-y-2">
    <Appointment animal="Scooby" />
    <Appointment animal="Scooby" />
  </BaseSection>
</template>
