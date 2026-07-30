import { AppError } from '../types';
import { animalsRepository, heightRecordsRepository } from '../repositories';
import { Animal, HeightRecord, CreateHeightRecordPayload, UpdateHeightRecordPayload } from '../schemas';

function assertAnimalAccess(animal: Animal, callerId: number, role: string): void {
	if (role === 'admin') return;
	if (role === 'user' && animal.user_id !== callerId) throw new AppError('Access denied', 403);
}

function assertAnimalReadAccess(animal: Animal, callerId: number, role: string): void {
	if (role === 'admin') return;
	if (role === 'user' && animal.user_id !== callerId && !animal.is_shared) throw new AppError('Access denied', 403);
}

function assertAnimalWriteAccess(animal: Animal, callerId: number, role: string): void {
	if (role === 'admin') return;
	if (role === 'user' && animal.user_id !== callerId) throw new AppError('Access denied', 403);
}

export const heightRecordService = {
	async getAll(callerId: number, role: string): Promise<HeightRecord[]> {
		if (role === 'admin') return heightRecordsRepository.findAll();
		return heightRecordsRepository.findByUserId(callerId);
	},

	async getById(heightRecordId: number, callerId: number, role: string): Promise<HeightRecord> {
		const record = await heightRecordsRepository.findById(heightRecordId);
		if (!record) throw new AppError('Height record not found', 404);
		if (role !== 'admin') {
			const animal = await animalsRepository.findById(record.animal_id);
			assertAnimalReadAccess(animal, callerId, role);
		}
		return record;
	},

	async getByAnimalId(animalId: number, callerId: number, role: string): Promise<HeightRecord[]> {
		if (role !== 'admin') {
			const animal = await animalsRepository.findById(animalId);
			if (!animal) throw new AppError('Animal not found', 404);
			assertAnimalReadAccess(animal, callerId, role);
		}
		return heightRecordsRepository.findByAnimalId(animalId);
	},

	async create(data: CreateHeightRecordPayload, callerId: number, role: string): Promise<HeightRecord> {
		const existingAnimal: Animal = await animalsRepository.findById(data.animal_id);
		if (!existingAnimal) throw new AppError('Animal not found', 404);
		assertAnimalWriteAccess(existingAnimal, callerId, role);
		return heightRecordsRepository.create(data);
	},

	async update(heightRecordId: number, data: UpdateHeightRecordPayload, callerId: number, role: string): Promise<HeightRecord> {
		const existingRecord: HeightRecord = await heightRecordsRepository.findById(heightRecordId);
		if (!existingRecord) throw new AppError('Height record not found', 404);
		if (role !== 'admin') {
			const animal = await animalsRepository.findById(existingRecord.animal_id);
			assertAnimalWriteAccess(animal, callerId, role);
		}

		if (data.animal_id) {
			const existingAnimal: Animal = await animalsRepository.findById(data.animal_id);
			if (!existingAnimal) throw new AppError('Animal not found', 404);
		}

		return heightRecordsRepository.update(heightRecordId, data);
	},

	async delete(heightRecordId: number, callerId: number, role: string): Promise<HeightRecord> {
		const existingRecord: HeightRecord = await heightRecordsRepository.findById(heightRecordId);
		if (!existingRecord) throw new AppError('Height record not found', 404);
		if (role !== 'admin') {
			const animal = await animalsRepository.findById(existingRecord.animal_id);
			assertAnimalWriteAccess(animal, callerId, role);
		}

		return heightRecordsRepository.delete(heightRecordId);
	},
};
