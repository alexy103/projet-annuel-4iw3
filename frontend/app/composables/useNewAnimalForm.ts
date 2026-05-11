export const useNewAnimalForm = () => {
  const showNewAnimalForm = useState("showNewAnimalForm", () => false);

  const openNewAnimalForm = () => {
    showNewAnimalForm.value = true;
  };

  const closeNewAnimalForm = () => {
    showNewAnimalForm.value = false;
  };

  return {
    showNewAnimalForm,
    openNewAnimalForm,
    closeNewAnimalForm,
  };
};
