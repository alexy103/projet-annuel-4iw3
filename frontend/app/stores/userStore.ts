type Animal = {
  id: number;
  name: string;
  image: string;
};

export const useUserStore = defineStore("user", () => {
  const firstName = ref("John");
  const lastName = ref("Doe");
  const avatar = ref<string | null>(null);
  const onboardingCompleted = ref(false);
  const notificationsPush = ref(true);
  const nightMode = ref(false);

  const animals = ref<Animal[]>([
    // {
    //   id: 1,
    //   name: "Scooby",
    //   image: "/scooby.png",
    // },
  ]);

  const fullName = computed(() => {
    return `${firstName.value} ${lastName.value}`;
  });

  const completeOnboarding = async () => {
    // Plus tard, tu pourras appeler ton API ici :
    // await $fetch("/api/me/onboarding", {
    //   method: "PATCH",
    //   body: {
    //     onboardingCompleted: true,
    //     notificationsPush: notificationsPush.value,
    //     nightMode: nightMode.value,
    //   },
    // });

    onboardingCompleted.value = true;
  };

  return {
    firstName,
    lastName,
    avatar,
    onboardingCompleted,
    notificationsPush,
    nightMode,
    animals,
    fullName,
    completeOnboarding,
  };
});
