type Animal = {
  id: number;
  name: string;
  image: string;
};

type ApiAnimal = {
  id: number;
  name: string;
  profile_picture_url?: string | null;
  profile_picture?: string | null;
  image?: string | null;
};

export const useUserStore = defineStore("user", () => {
  const userId = ref<number | null>(null);
  const firstName = ref("");
  const lastName = ref("");
  const avatar = ref<string | null>(null);
  const onboardingCompleted = ref(false);
  const notificationsPush = ref(true);
  const nightMode = ref(false);
  const animals = ref<Animal[]>([]);

  const isLoading = ref(false);
  const errorMessage = ref("");

  const fullName = computed(() => {
    return `${firstName.value} ${lastName.value}`;
  });

  const getAuthHeaders = () => {
    const config = useRuntimeConfig();
    const accessToken = localStorage.getItem("accessToken");

    return {
      "x-api-key": config.public.apiKey,
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    };
  };

  const loadUserFromStorage = () => {
    const storedUserId = localStorage.getItem("userId");
    const storedFirstName = localStorage.getItem("firstName");
    const storedLastName = localStorage.getItem("lastName");
    const storedOnboardingCompleted = localStorage.getItem(
      "onboardingCompleted",
    );

    if (storedUserId) {
      userId.value = Number(storedUserId);
    }

    if (storedFirstName) {
      firstName.value = storedFirstName;
    }

    if (storedLastName) {
      lastName.value = storedLastName;
    }

    onboardingCompleted.value = storedOnboardingCompleted === "true";
  };

  const fetchCurrentUser = async () => {
    loadUserFromStorage();
  };

  const fetchAnimals = async () => {
    errorMessage.value = "";
    loadUserFromStorage();

    if (!userId.value) {
      return;
    }

    isLoading.value = true;

    try {
      const config = useRuntimeConfig();

      const response = await fetch(
        `${config.public.apiUrl}/animals/user/${userId.value}`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        },
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error || "Erreur lors du chargement des animaux",
        );
      }

      animals.value = result.data.map((animal: ApiAnimal) => ({
        id: animal.id,
        name: animal.name,
        image:
          animal.profile_picture_url ||
          animal.profile_picture ||
          animal.image ||
          "/kyky.jpg",
      }));
    } catch (error) {
      errorMessage.value =
        error instanceof Error
          ? error.message
          : "Erreur lors du chargement des animaux";
    } finally {
      isLoading.value = false;
    }
  };

  const completeOnboarding = async () => {
    errorMessage.value = "";
    loadUserFromStorage();

    if (!userId.value) {
      return;
    }

    isLoading.value = true;

    try {
      const config = useRuntimeConfig();

      const response = await fetch(
        `${config.public.apiUrl}/users/${userId.value}/onboarding`,
        {
          method: "PATCH",
          headers: getAuthHeaders(),
        },
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Erreur lors de l'onboarding");
      }

      onboardingCompleted.value = true;
      localStorage.setItem("onboardingCompleted", "true");
    } catch (error) {
      errorMessage.value =
        error instanceof Error ? error.message : "Erreur lors de l'onboarding";
    } finally {
      isLoading.value = false;
    }
  };

  const resetUser = () => {
    userId.value = null;
    firstName.value = "";
    lastName.value = "";
    avatar.value = null;
    onboardingCompleted.value = false;
    notificationsPush.value = true;
    nightMode.value = false;
    animals.value = [];
    errorMessage.value = "";

    localStorage.removeItem("userId");
    localStorage.removeItem("roleId");
    localStorage.removeItem("firstName");
    localStorage.removeItem("lastName");
    localStorage.removeItem("onboardingCompleted");
  };

  return {
    userId,
    firstName,
    lastName,
    avatar,
    onboardingCompleted,
    notificationsPush,
    nightMode,
    animals,
    isLoading,
    errorMessage,
    fullName,
    loadUserFromStorage,
    fetchCurrentUser,
    fetchAnimals,
    completeOnboarding,
    resetUser,
  };
});
