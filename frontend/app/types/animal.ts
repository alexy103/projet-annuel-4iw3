export const animalBreedsBySpecies = {
  Chien: ["Labrador", "Berger Allemand", "Bulldog"],
  Chat: ["Siamois", "Maine Coon", "Persan"],
} as const;

export type AnimalSpecies = keyof typeof animalBreedsBySpecies;

export type AnimalBreed = (typeof animalBreedsBySpecies)[AnimalSpecies][number];

export type DogBreed = (typeof animalBreedsBySpecies)["Chien"][number];

export type CatBreed = (typeof animalBreedsBySpecies)["Chat"][number];

export type AnimalGender = "male" | "female";

export const animalSpeciesOptions = Object.keys(
  animalBreedsBySpecies,
) as AnimalSpecies[];

type AnimalBase = {
  name: string;
  gender: AnimalGender | null;
  profilePicture: string | null;
  birthDate: string;
  adoptionDate: string;
  weight: number | null;
  height: number | null;
};

export type Animal =
  | (AnimalBase & { species: "Chien"; breed: DogBreed })
  | (AnimalBase & { species: "Chat"; breed: CatBreed });
