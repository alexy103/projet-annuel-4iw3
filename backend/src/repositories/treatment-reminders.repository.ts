import { db } from "../config";
import { AppError } from "../types";
import { TreatmentReminder, CreateTreatmentReminderPayload } from "../schemas";

const TABLE_NAME = "treatment_reminders";

export const treatmentRemindersRepository = {
  /**
   * Request to create a treatment reminder
   * @param data
   */
  async create(
    data: CreateTreatmentReminderPayload,
  ): Promise<TreatmentReminder> {
    const result = await db.query<TreatmentReminder>(
      `INSERT INTO ${TABLE_NAME} (treatment_id, reminder_frequency_id, amount) VALUES ($1, $2, $3) RETURNING *`,
      [data.treatment_id, data.reminder_frequency_id, data.amount],
    );

    const treatmentReminder: TreatmentReminder | undefined = result.rows[0];
    if (!treatmentReminder) {
      throw new AppError("Treatment reminder creation failed!", 400);
    }
    return treatmentReminder;
  },

  /**
   * Request to get all reminders by treatment id
   * @param treatmentId
   */
  async findByTreatmentId(treatmentId: number): Promise<TreatmentReminder[]> {
    const result = await db.query<TreatmentReminder>(
      `SELECT * FROM ${TABLE_NAME} WHERE treatment_id = $1`,
      [treatmentId],
    );

    return result.rows || [];
  },

  /**
   * Request to get all reminders by reminder frequency id
   * @param reminderFrequencyId
   */
  async findByReminderFrequencyId(
    reminderFrequencyId: number,
  ): Promise<TreatmentReminder[]> {
    const result = await db.query<TreatmentReminder>(
      `SELECT * FROM ${TABLE_NAME} WHERE reminder_frequency_id = $1`,
      [reminderFrequencyId],
    );

    return result.rows || [];
  },

  /**
   * Request to get the treatment reminder relation
   * @param treatmentId
   * @param reminderFrequencyId
   */
  async findByTreatmentAndFrequency(
    treatmentId: number,
    reminderFrequencyId: number,
  ): Promise<TreatmentReminder | null> {
    const result = await db.query<TreatmentReminder>(
      `SELECT * FROM ${TABLE_NAME} WHERE treatment_id = $1 AND reminder_frequency_id = $2`,
      [treatmentId, reminderFrequencyId],
    );

    return result.rows[0] || null;
  },

  /**
   * Request to count reminders by treatment
   * @param treatmentId
   */
  async countByTreatmentId(treatmentId: number): Promise<number> {
    const result = await db.query(
      `SELECT COUNT(*) as count FROM ${TABLE_NAME} WHERE treatment_id = $1`,
      [treatmentId],
    );

    return Number(result.rows[0].count);
  },

  /**
   * Request to count reminders by reminder frequency
   * @param reminderFrequencyId
   */
  async countByReminderFrequencyId(
    reminderFrequencyId: number,
  ): Promise<number> {
    const result = await db.query(
      `SELECT COUNT(*) as count FROM ${TABLE_NAME} WHERE reminder_frequency_id = $1`,
      [reminderFrequencyId],
    );

    return Number(result.rows[0].count);
  },

  /**
   * Request to delete treatment reminder relation
   * @param treatmentId
   * @param reminderFrequencyId
   */
  async deleteByTreatmentAndFrequency(
    treatmentId: number,
    reminderFrequencyId: number,
  ): Promise<TreatmentReminder> {
    const result = await db.query<TreatmentReminder>(
      `DELETE FROM ${TABLE_NAME} WHERE treatment_id = $1 AND reminder_frequency_id = $2 RETURNING *`,
      [treatmentId, reminderFrequencyId],
    );

    const treatmentReminder: TreatmentReminder | undefined = result.rows[0];
    if (!treatmentReminder) {
      throw new AppError("Treatment reminder relation delete failed!", 400);
    }
    return treatmentReminder;
  },
};
