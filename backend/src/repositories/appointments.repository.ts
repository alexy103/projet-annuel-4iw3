import { db } from '../config';
import { AppError } from '../types';
import { Appointment, CreateAppointmentPayload, UpdateAppointmentPayload } from '../schemas';
import { BaseRepository } from './base.repository';

class AppointmentRepository extends BaseRepository<Appointment, CreateAppointmentPayload, UpdateAppointmentPayload> {
	constructor() {
		super('appointments', 'Appointment');
	}

	/**
	 * Request to get all appointments by userId
	 * @param userId
	 */
	async findByUserId(userId: number): Promise<Appointment[]> {
		const result = await db.query<Appointment>(`SELECT * FROM ${this.table} WHERE user_id = $1`, [userId]);
		return result.rows;
	}

	/**
	 * Request to get all appointments by animal id
	 * @param animalId
	 */
	async findByAnimalId(animalId: number): Promise<Appointment[]> {
		const result = await db.query<Appointment>(`SELECT * FROM ${this.table} WHERE animal_id = $1`, [animalId]);
		return result.rows;
	}

	/**
	 * Request to get all appointments by clinic id
	 * @param clinicId
	 */
	async findByClinicId(clinicId: number): Promise<Appointment[]> {
		const result = await db.query<Appointment>(
			`SELECT ${this.table}.*, 
              animals.name AS animal_name,
              users.first_name AS owner_first_name,
              users.last_name AS owner_last_name
       FROM ${this.table}
       LEFT JOIN animals ON animals.id = ${this.table}.animal_id
       LEFT JOIN users ON users.id = ${this.table}.user_id
       WHERE ${this.table}.clinic_id = $1`,
			[clinicId],
		);
		return result.rows;
	}

	/**
	 * Request to get all appointments by reason id
	 * @param reasonId
	 */
	async findByReasonId(reasonId: number): Promise<Appointment[]> {
		const result = await db.query<Appointment>(`SELECT * FROM ${this.table} WHERE reason_id = $1`, [reasonId]);
		return result.rows;
	}

	/**
	 * Count booked appointments for a given clinic slot, optionally excluding one appointment
	 * @param clinicId
	 * @param date
	 * @param time
	 * @param excludeId
	 */
	async countBySlot(clinicId: number, date: string, time: string, excludeId?: number): Promise<number> {
		const result = await db.query<{ count: string }>(
			`SELECT COUNT(*) as count FROM ${this.table}
       WHERE clinic_id = $1 AND date = $2 AND time = $3
       AND ($4::int IS NULL OR id != $4)`,
			[clinicId, date, time, excludeId ?? null],
		);
		return Number(result.rows[0]?.count ?? 0);
	}

	/**
	 * Update is_completed status of an appointment
	 * @param appointmentId
	 * @param isCompleted
	 */
	async updateIsCompleted(appointmentId: number, isCompleted: boolean): Promise<Appointment> {
		const result = await db.query<Appointment>(
			`UPDATE ${this.table} SET 
               is_completed = $1,
               updated_at = NOW()
             WHERE id = $2 RETURNING *`,
			[isCompleted, appointmentId],
		);

		const appointment: Appointment | undefined = result.rows[0];
		if (!appointment) throw new AppError('Appointment is_completed update failed', 400);

		return appointment;
	}

	/**
	 * Update is_cancelled status of an appointment
	 * @param appointmentId
	 * @param isCancelled
	 */
	async updateIsCancelled(appointmentId: number, isCancelled: boolean): Promise<Appointment> {
		const result = await db.query<Appointment>(
			`UPDATE ${this.table} SET
               is_cancelled = $1,
               updated_at = NOW()
             WHERE id = $2 RETURNING *`,
			[isCancelled, appointmentId],
		);

		const appointment: Appointment | undefined = result.rows[0];
		if (!appointment) throw new AppError('Appointment is_cancelled update failed', 400);

		return appointment;
	}

	/**
	 * Mark an appointment as accepted by the clinic
	 * @param appointmentId
	 */
	async updateIsAccepted(appointmentId: number): Promise<Appointment> {
		const result = await db.query<Appointment>(
			`UPDATE ${this.table} SET
               is_accepted = TRUE,
               updated_at = NOW()
             WHERE id = $1 RETURNING *`,
			[appointmentId],
		);

		const appointment: Appointment | undefined = result.rows[0];
		if (!appointment) throw new AppError('Appointment is_accepted update failed', 400);

		return appointment;
	}

	/**
	 * Mark an appointment as refused by the clinic
	 * @param appointmentId
	 */
	async updateIsRefused(appointmentId: number): Promise<Appointment> {
		const result = await db.query<Appointment>(
			`UPDATE ${this.table} SET
               is_refused = TRUE,
               updated_at = NOW()
             WHERE id = $1 RETURNING *`,
			[appointmentId],
		);

		const appointment: Appointment | undefined = result.rows[0];
		if (!appointment) throw new AppError('Appointment is_refused update failed', 400);

		return appointment;
	}
}

export const appointmentsRepository = new AppointmentRepository();
