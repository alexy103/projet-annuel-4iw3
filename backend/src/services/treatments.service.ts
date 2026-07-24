import { AppError } from '../types';
import { animalsRepository, medicinesRepository, treatmentRemindersRepository, treatmentsRepository, treatmentTypesRepository } from '../repositories';
import { Animal, Treatment, CreateTreatmentPayload, UpdateTreatmentPayload, Medicine, TreatmentType } from '../schemas';

function assertAnimalAccess(animal: Animal, callerId: number, role: string): void {
	if (role === 'admin') return;
	if (role === 'user' && animal.user_id !== callerId) throw new AppError('Access denied', 403);
	if (role === 'clinic' && !animal.is_shared) throw new AppError('Access denied', 403);
}

function assertAnimalReadAccess(animal: Animal, callerId: number, role: string): void {
	if (role === 'admin') return;
	if (role === 'user' && animal.user_id !== callerId && !animal.is_shared) throw new AppError('Access denied', 403);
	if (role === 'clinic' && !animal.is_shared) throw new AppError('Access denied', 403);
}

function assertAnimalWriteAccess(animal: Animal, callerId: number, role: string): void {
	if (role === 'admin') return;
	if (role === 'user' && animal.user_id !== callerId) throw new AppError('Access denied', 403);
	if (role === 'clinic') throw new AppError('Access denied', 403);
}

export const treatmentService = {
	async getAll(callerId: number, role: string): Promise<Treatment[]> {
		if (role === 'admin') return treatmentsRepository.findAll();
		if (role === 'user') return treatmentsRepository.findByUserId(callerId);

		return treatmentsRepository.findAll();
	},

	async getById(treatmentId: number, callerId: number, role: string): Promise<Treatment> {
		const treatment = await treatmentsRepository.findById(treatmentId);
		if (!treatment) throw new AppError('Treatment not found', 404);
		if (role !== 'admin') {
			const animal = await animalsRepository.findById(treatment.animal_id);
			assertAnimalReadAccess(animal, callerId, role);
		}
		return treatment;
	},

	async getByMedicineId(medicineId: number): Promise<Treatment[]> {
		return treatmentsRepository.findByMedicineId(medicineId);
	},

	async getByAnimalId(animalId: number, callerId: number, role: string): Promise<Treatment[]> {
		if (role !== 'admin') {
			const animal = await animalsRepository.findById(animalId);
			if (!animal) throw new AppError('Animal not found', 404);
			assertAnimalReadAccess(animal, callerId, role);
		}
		return treatmentsRepository.findByAnimalId(animalId);
	},

	async getByTreatmentTypeId(typeId: number): Promise<Treatment[]> {
		return treatmentsRepository.findByTreatmentTypeId(typeId);
	},

	async create(data: CreateTreatmentPayload, callerId: number, role: string): Promise<Treatment> {
		const existingAnimal: Animal = await animalsRepository.findById(data.animal_id);
		if (!existingAnimal) throw new AppError('Animal not found', 404);
		assertAnimalWriteAccess(existingAnimal, callerId, role);

		if (data.medicine_id) {
			const existingMedicine: Medicine = await medicinesRepository.findById(data.medicine_id);
			if (!existingMedicine) throw new AppError('Medicine not found', 404);
			if (role === 'user' && existingMedicine.user_id !== callerId) throw new AppError('Access denied', 403);
		}

		const existingTreatmentType: TreatmentType = await treatmentTypesRepository.findById(data.treatment_type_id);
		if (!existingTreatmentType) throw new AppError('Treatment Type not found', 404);
		if (role === 'user' && existingTreatmentType.user_id !== callerId) throw new AppError('Access denied', 403);

		return treatmentsRepository.create(data);
	},

	async update(treatmentId: number, data: UpdateTreatmentPayload, callerId: number, role: string): Promise<Treatment> {
		const existingTreatment: Treatment = await treatmentsRepository.findById(treatmentId);
		if (!existingTreatment) throw new AppError('Treatment not found', 404);
		if (role !== 'admin') {
			const animal = await animalsRepository.findById(existingTreatment.animal_id);
			assertAnimalWriteAccess(animal, callerId, role);
		}

		if (data.medicine_id) {
			const existingMedicine: Medicine = await medicinesRepository.findById(data.medicine_id);
			if (!existingMedicine) throw new AppError('Medicine not found', 404);
		}

		if (data.animal_id) {
			const existingAnimal: Animal = await animalsRepository.findById(data.animal_id);
			if (!existingAnimal) throw new AppError('Animal not found', 404);
		}

		if (data.treatment_type_id) {
			const existingTreatmentType: TreatmentType = await treatmentTypesRepository.findById(data.treatment_type_id);
			if (!existingTreatmentType) throw new AppError('Treatment Type not found', 404);
		}

		return treatmentsRepository.update(treatmentId, data);
	},

	async delete(treatmentId: number, callerId: number, role: string): Promise<Treatment> {
		const existingTreatment: Treatment = await treatmentsRepository.findById(treatmentId);
		if (!existingTreatment) throw new AppError('Treatment not found', 404);
		if (role !== 'admin') {
			const animal = await animalsRepository.findById(existingTreatment.animal_id);
			assertAnimalWriteAccess(animal, callerId, role);
		}

		const remindersCount = (await treatmentRemindersRepository.findByTreatmentId(treatmentId)).length;
		if (remindersCount > 0) throw new AppError('Cannot delete treatment: reminders associated', 409);

		return treatmentsRepository.delete(treatmentId);
	},
};
