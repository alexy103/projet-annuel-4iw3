import {
  ReminderFrequency,
  CreateReminderFrequencyPayload,
  UpdateReminderFrequencyPayload,
} from "../schemas";
import { BaseRepository } from "./base.repository";
import { db } from "../config";

class ReminderFrequencyRepository extends BaseRepository<
  ReminderFrequency,
  CreateReminderFrequencyPayload,
  UpdateReminderFrequencyPayload
> {
  constructor() {
    super("reminder_frequencies", "Reminder Frequency");
  }

  /**
   * Request to get reminder frequencies by frequency (dynamic search with ILIKE)
   * @param frequency
   */
  async findByFrequency(frequency: string): Promise<ReminderFrequency[]> {
    if (!frequency || frequency === "undefined") {
      return [];
    }

    const result = await db.query<ReminderFrequency>(
      `SELECT * FROM ${this.table} WHERE frequency ILIKE $1 || '%'`,
      [frequency],
    );
    return result.rows || [];
  }
}

export const reminderFrequenciesRepository = new ReminderFrequencyRepository();
