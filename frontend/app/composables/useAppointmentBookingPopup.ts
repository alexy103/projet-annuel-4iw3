export const useAppointmentBookingPopup = () => {
  const isOpen = useState<boolean>("appointment-booking-open", () => false);
  const prefilledDate = useState<string>("appointment-booking-date", () => "");

  const open = () => {
    prefilledDate.value = "";
    isOpen.value = true;
  };

  const openWithPrefilledDate = (date: string) => {
    prefilledDate.value = date;
    isOpen.value = true;
  };

  const close = () => {
    isOpen.value = false;
  };

  const clearPrefilledDate = () => {
    prefilledDate.value = "";
  };

  return {
    isOpen,
    prefilledDate,
    open,
    openWithPrefilledDate,
    close,
    clearPrefilledDate,
  };
};
