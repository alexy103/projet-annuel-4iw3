const ROLE_ADMIN = "1";
const ROLE_CLINIC = "3";

export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) {
    return;
  }

  const publicRoutes = [
    "/login",
    "/register",
    "/register/clinic",
    "/forgot-password",
    "/verify-code",
    "/reset-password",
    "/auth/github/callback",
  ];
  const accessToken = localStorage.getItem("accessToken");
  const roleId = localStorage.getItem("roleId");

  if (!accessToken && !publicRoutes.includes(to.path)) {
    return navigateTo("/login");
  }

  if (accessToken && publicRoutes.includes(to.path)) {
    return navigateTo("/");
  }

  if (accessToken && to.path === "/") {
    if (roleId === ROLE_ADMIN) {
      return navigateTo("/admin");
    }
    if (roleId === ROLE_CLINIC) {
      return navigateTo("/clinic");
    }
  }

  if (to.path.startsWith("/admin") && roleId !== ROLE_ADMIN) {
    return navigateTo("/");
  }

  if (
    to.path.startsWith("/clinic") &&
    roleId !== ROLE_CLINIC &&
    roleId !== ROLE_ADMIN
  ) {
    return navigateTo("/");
  }
});
