export type CookieConsentValue = "accepted" | "refused";

export function useCookieConsent() {
  const consent = useCookie<CookieConsentValue | null>("cookie_consent", {
    default: () => null,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });

  const hasChosen = computed(() => consent.value !== null);
  const analyticsAllowed = computed(() => consent.value === "accepted");

  const accept = () => {
    consent.value = "accepted";
  };

  const refuse = () => {
    consent.value = "refused";
  };

  return { consent, hasChosen, analyticsAllowed, accept, refuse };
}
