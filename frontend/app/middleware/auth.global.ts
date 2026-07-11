export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) {
    return;
  }

  const publicRoutes = [
    "/login",
    "/register",
    "/forgot-password",
    "/verify-code",
    "/reset-password",
  ];
  const accessToken = localStorage.getItem("accessToken");

  if (!accessToken && !publicRoutes.includes(to.path)) {
    return navigateTo("/login");
  }

  if (accessToken && publicRoutes.includes(to.path)) {
    return navigateTo("/");
  }
});
