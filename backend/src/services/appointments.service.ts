import { AppError } from '../types';
import { appointmentsRepository, availabilitiesRepository, consultationsRepository, usersRepository, animalsRepository, clinicsRepository, appointmentReasonsRepository } from '../repositories';
import { Appointment, Availability, CreateAppointmentPayload, UpdateAppointmentPayload, User, Animal, Clinic, AppointmentReason, Consultation } from '../schemas';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function parseDateOnlyString(value: string): { year: number; month: number; day: number } | null {
	const datePart = value.includes('T') ? (value.split('T')[0] ?? value) : value;
	const [yearPart, monthPart, dayPart] = datePart.split('-');

	if (!yearPart || !monthPart || !dayPart) {
		return null;
	}

	const year = Number(yearPart);
	const month = Number(monthPart);
	const day = Number(dayPart);

	if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
		return null;
	}

	if (yearPart.length !== 4 || monthPart.length !== 2 || dayPart.length !== 2) {
		return null;
	}

	const utcDate = new Date(Date.UTC(year, month - 1, day));
	if (utcDate.getUTCFullYear() !== year || utcDate.getUTCMonth() + 1 !== month || utcDate.getUTCDate() !== day) {
		return null;
	}

	return { year, month, day };
}

function toValidDate(date: Date | string): Date {
	if (typeof date === 'string') {
		const dateOnly = parseDateOnlyString(date);
		if (dateOnly) {
			return new Date(Date.UTC(dateOnly.year, dateOnly.month - 1, dateOnly.day));
		}

		const parsedDate = new Date(date);
		if (Number.isNaN(parsedDate.getTime())) {
			throw new AppError('Invalid appointment date', 400);
		}

		return parsedDate;
	}

	const parsedDate = date;

	if (Number.isNaN(parsedDate.getTime())) {
		throw new AppError('Invalid appointment date', 400);
	}

	return parsedDate;
}

function toDateOnlyString(date: Date | string): string {
	if (typeof date === 'string') {
		const dateOnly = parseDateOnlyString(date);
		if (!dateOnly) {
			throw new AppError('Invalid appointment date', 400);
		}

		const month = `${dateOnly.month}`.padStart(2, '0');
		const day = `${dateOnly.day}`.padStart(2, '0');
		return `${dateOnly.year}-${month}-${day}`;
	}

	return toValidDate(date).toISOString().substring(0, 10);
}

function validateSlot(date: Date | string, time: string, availability: Availability): void {
	const rules = availability.slot_rules as { break?: { start: number; end: number }; interval: number };

	const [h = 0, m = 0] = time.split(':').map(Number);
	const totalMin = h * 60 + m;
	const openMin = availability.opening * 60;
	const closeMin = availability.closing * 60;
	const interval = rules.interval;

	if (totalMin < openMin || totalMin + interval > closeMin) {
		throw new AppError(`Time ${time} is outside clinic hours (${availability.opening}:00 - ${availability.closing}:00)`, 400);
	}

	if (rules.break) {
		const breakStart = rules.break.start * 60;
		const breakEnd = rules.break.end * 60;
		if (totalMin >= breakStart && totalMin < breakEnd) {
			throw new AppError(`Time ${time} falls during the clinic break`, 400);
		}
	}

	if ((totalMin - openMin) % interval !== 0) {
		throw new AppError(`Time ${time} is not aligned with the clinic's slot interval (${interval} min)`, 400);
	}
}

async function checkClinicAvailability(clinicId: number, date: Date | string, time: string): Promise<{ capacity: number }> {
	const dateObj = toValidDate(date);
	const dayName = DAYS[dateObj.getUTCDay()] as string;
	const availabilities = await availabilitiesRepository.findByClinicId(clinicId);
	const availability = availabilities.find((a) => a.day.toLowerCase() === dayName.toLowerCase());

	if (!availability) {
		throw new AppError(`Clinic is not available on ${dayName}`, 400);
	}

	validateSlot(date, time, availability);

	const rules = availability.slot_rules as { break?: { start: number; end: number }; interval: number; capacity?: number };
	return { capacity: rules.capacity ?? 1 };
}

export const appointmentService = {
	async getAll(callerId: number, role: string, callerClinicId?: number): Promise<Appointment[]> {
		if (role === 'clinic') return appointmentsRepository.findByClinicId(callerClinicId!);
		if (role === 'admin') return appointmentsRepository.findAll();
		return appointmentsRepository.findByUserId(callerId);
	},

	async getById(appointmentId: number, callerId: number, role: string, callerClinicId?: number): Promise<Appointment> {
		const appointment = await appointmentsRepository.findById(appointmentId);
		if (!appointment) throw new AppError('Appointment not found', 404);
		if (role === 'clinic' && appointment.clinic_id !== callerClinicId) throw new AppError('Access denied', 403);
		if (role === 'user' && appointment.user_id !== callerId) throw new AppError('Access denied', 403);
		return appointment;
	},

	async getByUserId(userId: number, role: string, callerClinicId?: number): Promise<Appointment[]> {
		const appointments = await appointmentsRepository.findByUserId(userId);
		if (role === 'clinic') return appointments.filter((a) => a.clinic_id === callerClinicId);
		return appointments;
	},

	async getByAnimalId(animalId: number, callerId: number, role: string, callerClinicId?: number): Promise<Appointment[]> {
		if (role === 'user') {
			const animal = await animalsRepository.findById(animalId);
			if (!animal) throw new AppError('Animal not found', 404);
			if (animal.user_id !== callerId) throw new AppError('Access denied', 403);
		}
		const appointments = await appointmentsRepository.findByAnimalId(animalId);
		if (role === 'clinic') return appointments.filter((a) => a.clinic_id === callerClinicId);
		return appointments;
	},

	async getByClinicId(clinicId: number, role: string, callerClinicId?: number): Promise<Appointment[]> {
		if (role === 'clinic' && clinicId !== callerClinicId) throw new AppError('Access denied', 403);
		return appointmentsRepository.findByClinicId(clinicId);
	},

	async getByReasonId(reasonId: number, callerId: number, role: string, callerClinicId?: number): Promise<Appointment[]> {
		const appointments = await appointmentsRepository.findByReasonId(reasonId);
		if (role === 'clinic') return appointments.filter((a) => a.clinic_id === callerClinicId);
		if (role === 'user') return appointments.filter((a) => a.user_id === callerId);
		return appointments;
	},

	async create(data: CreateAppointmentPayload, callerId: number, role: string): Promise<Appointment> {
		if (role === 'user' && data.user_id !== callerId) throw new AppError('Access denied', 403);

		const existingUser: User = await usersRepository.findById(data.user_id);
		if (!existingUser) throw new AppError('User not found', 404);

		const existingAnimal: Animal = await animalsRepository.findById(data.animal_id);
		if (!existingAnimal) throw new AppError('Animal not found', 404);
		if (role === 'user' && existingAnimal.user_id !== callerId) throw new AppError('Access denied', 403);

		const existingClinic: Clinic = await clinicsRepository.findById(data.clinic_id);
		if (!existingClinic) throw new AppError('Clinic not found', 404);

		const existingReason: AppointmentReason = await appointmentReasonsRepository.findById(data.reason_id);
		if (!existingReason) throw new AppError('Appointment reason not found', 404);

		const { capacity } = await checkClinicAvailability(data.clinic_id, data.date, data.time);

		const dateStr = toDateOnlyString(data.date);
		const booked = await appointmentsRepository.countBySlot(data.clinic_id, dateStr, data.time);
		if (booked >= capacity) throw new AppError('This time slot is fully booked for this clinic', 409);

		return appointmentsRepository.create(data);
	},

	async update(appointmentId: number, data: UpdateAppointmentPayload, callerId: number, role: string): Promise<Appointment> {
		const existingAppointment: Appointment = await appointmentsRepository.findById(appointmentId);
		if (!existingAppointment) throw new AppError('Appointment not found', 404);
		if (role === 'user' && existingAppointment.user_id !== callerId) throw new AppError('Access denied', 403);

		if (data.user_id) {
			const existingUser: User = await usersRepository.findById(data.user_id);
			if (!existingUser) throw new AppError('User not found', 404);
		}

		if (data.animal_id) {
			const existingAnimal: Animal = await animalsRepository.findById(data.animal_id);
			if (!existingAnimal) throw new AppError('Animal not found', 404);
			if (role === 'user' && existingAnimal.user_id !== callerId) throw new AppError('Access denied', 403);
		}

		if (data.clinic_id) {
			const existingClinic: Clinic = await clinicsRepository.findById(data.clinic_id);
			if (!existingClinic) throw new AppError('Clinic not found', 404);
		}

		if (data.reason_id) {
			const existingReason: AppointmentReason = await appointmentReasonsRepository.findById(data.reason_id);
			if (!existingReason) throw new AppError('Appointment reason not found', 404);
		}

		if (data.clinic_id !== undefined || data.date !== undefined || data.time !== undefined) {
			const clinicId = data.clinic_id ?? existingAppointment.clinic_id;
			const date = data.date ?? existingAppointment.date;
			const time: string = data.time ?? existingAppointment.time;
			const { capacity } = await checkClinicAvailability(clinicId, date, time);

			const dateStr = toDateOnlyString(date);
			const booked = await appointmentsRepository.countBySlot(clinicId, dateStr, time, appointmentId);
			if (booked >= capacity) throw new AppError('This time slot is fully booked for this clinic', 409);
		}

		return appointmentsRepository.update(appointmentId, data);
	},

	async setIsCompleted(appointmentId: number, isCompleted: boolean, role: string, callerClinicId?: number): Promise<Appointment> {
		const existingAppointment: Appointment = await appointmentsRepository.findById(appointmentId);
		if (!existingAppointment) throw new AppError('Appointment not found', 404);

		if (role === 'clinic' && existingAppointment.clinic_id !== callerClinicId) throw new AppError('Access denied', 403);

		if (existingAppointment.is_completed && existingAppointment.is_completed == isCompleted) {
			throw new AppError('Appointment already completed', 409);
		}
		if (!existingAppointment.is_completed && existingAppointment.is_completed == isCompleted) {
			throw new AppError('Appointment already uncompleted', 409);
		}

		return appointmentsRepository.updateIsCompleted(appointmentId, isCompleted);
	},

	async delete(appointmentId: number, role: string, callerClinicId?: number): Promise<Appointment> {
		const existingAppointment: Appointment = await appointmentsRepository.findById(appointmentId);
		if (!existingAppointment) throw new AppError('Appointment not found', 404);

		if (role === 'clinic' && existingAppointment.clinic_id !== callerClinicId) throw new AppError('Access denied', 403);

		const consultation: Consultation | null = await consultationsRepository.findByAppointmentId(appointmentId);

		if (consultation) throw new AppError('Cannot delete appointment: consultations associated', 409);

		return appointmentsRepository.delete(appointmentId);
	},
};
