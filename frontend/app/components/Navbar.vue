<template>
  <div class="font-alt">
    <div class="relative flex items-center justify-between p-4">
      <NuxtLink to="/" class="absolute left-1/2 -translate-x-1/2 text-2xl">
        <h1>PawTracker</h1>
      </NuxtLink>
      <Icon name="solar:user-outline" class="size-8 text-black" />
      <!-- <Icon name="uil:user" class="ml-2 size-8 text-black" /> -->
      <Icon name="solar:calendar-add-outline" class="ml-2 size-8 text-black" />
    </div>
    <ul class="flex gap-2 overflow-x-auto px-4">
      <li class="shrink-0">
        <NuxtLink
          to="/animal/1"
          class="bg-green-light flex h-16 w-16 items-center justify-center rounded-full text-sm font-bold text-black"
        >
          <img
            src="/kyky.jpg"
            alt=""
            class="h-16 w-16 rounded-full object-cover"
          />
        </NuxtLink>
      </li>
      <li v-for="i in 10" class="shrink-0">
        <NuxtLink
          to="/animal/1"
          class="bg-green-light flex h-16 w-16 items-center justify-center rounded-full text-sm font-bold text-black"
        >
          <img
            src="/scooby.png"
            alt=""
            class="h-16 w-16 rounded-full object-cover"
          />
        </NuxtLink>
      </li>
    </ul>
  </div>
</template>
