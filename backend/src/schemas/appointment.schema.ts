import zod from 'zod';
import { registry } from '../docs/openapi.registry';

const DateOnlySchema = zod.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (expected YYYY-MM-DD)');

const AppointmentBaseSchema = zod
	.object({
		date: DateOnlySchema.openapi({
			description: 'Appointment date',
			example: '2024-03-20',
		}),

		time: zod
			.string()
			.regex(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/, 'Invalid time format')
			.openapi({
				description: 'Appointment time',
				example: '14:30',
			}),

		reason_id: zod.number().int('Reason ID must be an integer').positive('Reason ID must be positive').openapi({
			description: 'Appointment reason ID',
			example: 1,
		}),

		is_completed: zod.boolean().default(false).openapi({
			description: 'Whether the appointment is completed',
			example: false,
		}),

		is_cancelled: zod.boolean().default(false).openapi({
			description: 'Whether the appointment is cancelled',
			example: false,
		}),

		user_id: zod.number().int('User ID must be an integer').positive('User ID must be positive').openapi({
			description: 'User ID',
			example: 1,
		}),

		animal_id: zod.number().int('Animal ID must be an integer').positive('Animal ID must be positive').openapi({
			description: 'Animal ID',
			example: 1,
		}),

		clinic_id: zod.number().int('Clinic ID must be an integer').positive('Clinic ID must be positive').openapi({
			description: 'Clinic ID',
			example: 1,
		}),
		remark: zod.string().trim().min(1, 'Remark is required').optional().openapi({
			description: 'Remark',
			example: 'Ear pain',
		}),
	})
	.strict();

export const CreateAppointmentPayloadSchema = AppointmentBaseSchema;
registry.register('CreateAppointmentPayload', CreateAppointmentPayloadSchema);

export const UpdateAppointmentPayloadSchema = AppointmentBaseSchema.partial()
	.strict()
	.refine((data) => Object.keys(data).length > 0, {
		message: 'At least one field must be provided for update',
	});

registry.register('UpdateAppointmentPayload', UpdateAppointmentPayloadSchema);

export const AppointmentSchema = AppointmentBaseSchema.extend({
	id: zod.number(),
	created_at: zod.date(),
	updated_at: zod.date(),
});

registry.register('Appointment', AppointmentSchema);

export type Appointment = zod.infer<typeof AppointmentSchema>;
export type CreateAppointmentPayload = zod.infer<typeof CreateAppointmentPayloadSchema>;
export type UpdateAppointmentPayload = zod.infer<typeof UpdateAppointmentPayloadSchema>;
