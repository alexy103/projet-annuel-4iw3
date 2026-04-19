<template>
  <div class="font-alt">
    <div class="relative flex items-center justify-between p-4">
      <h1 class="absolute left-1/2 -translate-x-1/2 text-2xl">PawTracker</h1>
      <Icon name="solar:user-outline" class="size-8 text-black" />
      <!-- <Icon name="uil:user" class="ml-2 size-8 text-black" /> -->
      <Icon name="solar:calendar-add-outline" class="ml-2 size-8 text-black" />
    </div>
    <ul class="flex gap-2 overflow-x-auto px-4">
      <li class="shrink-0">
        <img
          src="/kyky.jpg"
          alt=""
          class="h-16 w-16 rounded-full object-cover"
        />
      </li>
      <li v-for="i in 10" class="shrink-0">
        <img
          src="/scooby.png"
          alt=""
          class="h-16 w-16 rounded-full object-cover"
        />
      </li>
    </ul>
  </div>
</template>
