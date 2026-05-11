<template>
  <div
    class="relative max-h-screen overflow-y-hidden px-4 md:px-24 lg:px-48 xl:px-64 2xl:px-92"
  >
    <main>
      <slot />
      <NuxtImg
        src="/logo.svg"
        alt=""
        class="absolute top-1/2 left-1/2 -z-10 size-120 -translate-1/2 opacity-50"
      />
      <button @click="$router.back()">
        <Icon
          name="solar:round-arrow-left-outline"
          class="absolute top-4 right-4 size-7 cursor-pointer"
        />
      </button>
    </main>
  </div>
</template>
