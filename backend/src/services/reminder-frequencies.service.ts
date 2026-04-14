import { AppError } from "../types";
import {
  reminderFrequenciesRepository,
  treatmentRemindersRepository,
} from "../repositories";
import {
  ReminderFrequency,
  CreateReminderFrequencyPayload,
  UpdateReminderFrequencyPayload,
} from "../schemas";

export const reminderFrequencyService = {
  async getAll(): Promise<ReminderFrequency[]> {
    return reminderFrequenciesRepository.findAll();
  },

  async getById(frequencyId: number): Promise<ReminderFrequency> {
    return reminderFrequenciesRepository.findById(frequencyId);
  },

  async create(
    data: CreateReminderFrequencyPayload,
  ): Promise<ReminderFrequency> {
    const duplicate: ReminderFrequency[] =
      await reminderFrequenciesRepository.findByFrequency(data.frequency);
    if (duplicate && duplicate[0]?.frequency === data.frequency)
      throw new AppError("A frequency with this name already exists", 409);

    return reminderFrequenciesRepository.create(data);
  },

  async update(
    frequencyId: number,
    data: UpdateReminderFrequencyPayload,
  ): Promise<ReminderFrequency> {
    const existingFrequency: ReminderFrequency =
      await reminderFrequenciesRepository.findById(frequencyId);
    if (!existingFrequency)
      throw new AppError("Reminder frequency not found", 404);

    if (data.frequency) {
      const duplicate = await reminderFrequenciesRepository.findByFrequency(
        data.frequency,
      );
      if (duplicate && duplicate[0]?.frequency === data.frequency)
        throw new AppError("A frequency with this name already exists", 409);
    }

    return reminderFrequenciesRepository.update(frequencyId, data);
  },

  async delete(frequencyId: number): Promise<ReminderFrequency> {
    const existingFrequency: ReminderFrequency =
      await reminderFrequenciesRepository.findById(frequencyId);
    if (!existingFrequency)
      throw new AppError("Reminder frequency not found", 404);

    const treatmentRemindersCount: number =
      await treatmentRemindersRepository.countByReminderFrequencyId(
        frequencyId,
      );

    if (treatmentRemindersCount > 0)
      throw new AppError(
        "Cannot delete frequency: treatment reminders associated",
        409,
      );

    return reminderFrequenciesRepository.delete(frequencyId);
  },
};
