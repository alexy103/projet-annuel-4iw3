import { AppError } from "../types";
import { speciesRepository, animalsRepository } from "../repositories";
import { Specie, CreateSpeciePayload, UpdateSpeciePayload } from "../schemas";

export const speciesService = {
  async getAll(): Promise<Specie[]> {
    return speciesRepository.findAll();
  },

  async getById(speciesId: number): Promise<Specie> {
    return speciesRepository.findById(speciesId);
  },

  async getByName(name: string): Promise<Specie[]> {
    return speciesRepository.findByName(name);
  },

  async create(data: CreateSpeciePayload): Promise<Specie> {
    const duplicate = await speciesRepository.findByExactName(data.name);
    if (duplicate) throw new AppError("A species with this name already exists", 409);

    return speciesRepository.create(data);
  },

  async update(speciesId: number, data: UpdateSpeciePayload): Promise<Specie> {
    const existingSpecies: Specie = await speciesRepository.findById(speciesId);
    if (!existingSpecies) throw new AppError("Species not found", 404);

    if (data.name) {
      const duplicate = await speciesRepository.findByExactName(data.name);
      if (duplicate && duplicate.id !== speciesId)
        throw new AppError("A species with this name already exists", 409);
    }

    return speciesRepository.update(speciesId, data);
  },

  async delete(speciesId: number): Promise<Specie> {
    const existingSpecies: Specie = await speciesRepository.findById(speciesId);
    if (!existingSpecies) throw new AppError("Species not found", 404);

    // Check if species is used by any animals
    const allAnimals = await animalsRepository.findAll();
    const animalsCount = allAnimals.filter(a => a.species_id === speciesId).length;
    
    if (animalsCount > 0)
      throw new AppError("Cannot delete species: animals associated", 409);

    return speciesRepository.delete(speciesId);
  },
};

