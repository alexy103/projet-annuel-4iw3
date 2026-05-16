import { AppError } from "../types";
import {
  animalsRepository,
  appointmentsRepository,
  treatmentsRepository,
  heightRecordsRepository,
  weightRecordsRepository,
  caresRepository, microshipsRepository, speciesRepository,
} from "../repositories";
import {Animal, CreateAnimalPayload, Microship, Specie, UpdateAnimalPayload} from "../schemas";

export const animalService = {
  async getAll(callerId: number, role: string): Promise<Animal[]> {
    if (role === "admin") return animalsRepository.findAll();
    if (role === "user") return animalsRepository.findByUserId(callerId);
    return animalsRepository.findAllShared();
  },

  async getById(animalId: number, role: string, callerId?: number): Promise<Animal> {
    const animal = await animalsRepository.findById(animalId);
    if (role === "user" && animal?.user_id !== callerId) throw new AppError("Access denied", 403);
    if (role === "clinic" && !animal?.is_shared) throw new AppError("Access denied", 403);
    return animal;
  },

  async getSharedAnimals(): Promise<Animal[]> {
    return animalsRepository.findAllShared();
  },

  async getByUserId(userId: number): Promise<Animal[]> {
    return animalsRepository.findByUserId(userId);
  },

  async getByName(name: string, callerId: number, role: string): Promise<Animal[]> {
    if (role === "admin") return animalsRepository.findByName(name);
    if (role === "user") return animalsRepository.findByName(name, callerId);
    return animalsRepository.findAllShared().then(animals =>
      animals.filter(a => a.name.toLowerCase().startsWith(name.toLowerCase()))
    );
  },

  async create(data: CreateAnimalPayload): Promise<Animal> {
    if(data.microship_id){
      const existingMicroship: Microship = await microshipsRepository.findById(data.microship_id);
      if (!existingMicroship) {
        throw new AppError("Microship not found", 404);
      }
    }

    const existingSpecie: Specie = await speciesRepository.findById(data.species_id);
    if (!existingSpecie) {
      throw new AppError("Specie not found", 404);
    }

    return animalsRepository.create(data);
  },

  async update(animalId: number, data: UpdateAnimalPayload, callerId: number, role: string): Promise<Animal> {
    const existingAnimal: Animal = await animalsRepository.findById(animalId);
    if (!existingAnimal) throw new AppError("Animal not found", 404);
    if (role === "user" && existingAnimal.user_id !== callerId) throw new AppError("Access denied", 403);

    if(data.microship_id){
      const existingMicroship: Microship = await microshipsRepository.findById(data.microship_id);
      if (!existingMicroship) throw new AppError("Microship not found", 404);
    }

    if(data.species_id){
      const existingSpecie: Specie = await speciesRepository.findById(data.species_id);
      if (!existingSpecie) throw new AppError("Specie not found", 404);
    }

    return animalsRepository.update(animalId, data);
  },

  async assignMicroship(animalId: number, microshipId: number | null, callerId: number, role: string): Promise<Animal> {
    const existingAnimal: Animal = await animalsRepository.findById(animalId);
    if (!existingAnimal) throw new AppError("Animal not found", 404);
    if (role === "user" && existingAnimal.user_id !== callerId) throw new AppError("Access denied", 403);

    if (microshipId !== null) {
      const existingMicroship: Microship = await microshipsRepository.findById(microshipId);
      if (!existingMicroship) throw new AppError("Microship not found", 404);

      const linked = await animalsRepository.findByMicroshipId(microshipId);
      const alreadyLinked = linked.find((a) => a.id !== animalId);
      if (alreadyLinked) throw new AppError("Microship already assigned to another animal", 409);
    }

    return animalsRepository.updateMicroship(animalId, microshipId);
  },

  async setIsShared(animalId: number, isShared: boolean, callerId: number, role: string): Promise<Animal> {
    const existingAnimal: Animal = await animalsRepository.findById(animalId);
    if (!existingAnimal) throw new AppError("Animal not found", 404);
    if (role === "user" && existingAnimal.user_id !== callerId) throw new AppError("Access denied", 403);

    if (existingAnimal.is_shared === isShared)
      throw new AppError(isShared ? "Animal already shared" : "Animal already unshared", 409);

    return animalsRepository.updateIsShared(animalId, isShared);
  },

  async setIsDeceased(animalId: number, isDeceased: boolean, callerId: number, role: string): Promise<Animal> {
    const existingAnimal: Animal = await animalsRepository.findById(animalId);
    if (!existingAnimal) throw new AppError("Animal not found", 404);
    if (role === "user" && existingAnimal.user_id !== callerId) throw new AppError("Access denied", 403);

    if (existingAnimal.is_deceased === isDeceased)
      throw new AppError(isDeceased ? "Animal already deceased" : "Animal already undeceased", 409);

    return animalsRepository.updateIsDeceased(animalId, isDeceased);
  },

  async uploadProfilePicture(animalId: number, picturePath: string, callerId: number, role: string): Promise<Animal> {
    const existingAnimal: Animal = await animalsRepository.findById(animalId);
    if (!existingAnimal) throw new AppError("Animal not found", 404);
    if (role === "user" && existingAnimal.user_id !== callerId) throw new AppError("Access denied", 403);
    return animalsRepository.updateProfilePicture(animalId, picturePath);
  },

  async delete(animalId: number, callerId: number, role: string): Promise<Animal> {
    const existingAnimal: Animal = await animalsRepository.findById(animalId);
    if (!existingAnimal) throw new AppError("Animal not found", 404);
    if (role === "user" && existingAnimal.user_id !== callerId) throw new AppError("Access denied", 403);

    const appointmentsCount = (await appointmentsRepository.findByAnimalId(animalId)).length;
    const treatmentsCount = (await treatmentsRepository.findByAnimalId(animalId)).length;
    const heightRecordsCount = (await heightRecordsRepository.findByAnimalId(animalId)).length;
    const weightRecordsCount = (await weightRecordsRepository.findByAnimalId(animalId)).length;
    const caresCount = (await caresRepository.findByAnimalId(animalId)).length;

    if (appointmentsCount > 0) throw new AppError("Cannot delete animal: appointments associated", 409);
    if (treatmentsCount > 0) throw new AppError("Cannot delete animal: treatments associated", 409);
    if (heightRecordsCount > 0) throw new AppError("Cannot delete animal: height records associated", 409);
    if (weightRecordsCount > 0) throw new AppError("Cannot delete animal: weight records associated", 409);
    if (caresCount > 0) throw new AppError("Cannot delete animal: cares associated", 409);

    return animalsRepository.delete(animalId);
  },
};


