export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore();
  const userStore = useUserStore();

  if (authStore.isAuthenticated) {
    try {
      await userStore.fetchMe();
    } catch {
      authStore.accessToken = null;
    }
  }
});
