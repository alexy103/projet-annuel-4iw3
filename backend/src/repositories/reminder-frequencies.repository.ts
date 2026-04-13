import { ReminderFrequency, CreateReminderFrequencyPayload, UpdateReminderFrequencyPayload } from "../schemas";
import { BaseRepository } from "./base.repository";

class ReminderFrequencyRepository extends BaseRepository<ReminderFrequency, CreateReminderFrequencyPayload, UpdateReminderFrequencyPayload> {
  constructor() {
    super("reminder_frequencies", "ReminderFrequency");
  }
}

export const reminderFrequenciesRepository = new ReminderFrequencyRepository();

