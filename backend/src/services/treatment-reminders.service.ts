import { AppError } from "../types";
import {
  animalsRepository,
  reminderFrequenciesRepository,
  treatmentRemindersRepository,
  treatmentsRepository,
} from "../repositories";
import {
  TreatmentReminder,
  CreateTreatmentReminderPayload,
  Treatment,
  ReminderFrequency,
} from "../schemas";

async function assertTreatmentAccess(
  treatmentId: number,
  callerId: number,
  role: string,
): Promise<void> {
  if (role === "admin") return;
  const treatment = await treatmentsRepository.findById(treatmentId);
  if (!treatment) throw new AppError("Treatment not found", 404);
  const animal = await animalsRepository.findById(treatment.animal_id);
  if (!animal || animal.user_id !== callerId)
    throw new AppError("Access denied", 403);
}

export const treatmentReminderService = {
  async getByTreatmentId(
    treatmentId: number,
    callerId: number,
    role: string,
  ): Promise<TreatmentReminder[]> {
    await assertTreatmentAccess(treatmentId, callerId, role);
    return treatmentRemindersRepository.findByTreatmentId(treatmentId);
  },

  async getByReminderFrequencyId(
    frequencyId: number,
  ): Promise<TreatmentReminder[]> {
    return treatmentRemindersRepository.findByReminderFrequencyId(frequencyId);
  },

  async getByTreatmentAndFrequency(
    treatmentId: number,
    frequencyId: number,
  ): Promise<TreatmentReminder | null> {
    return treatmentRemindersRepository.findByTreatmentAndFrequency(
      treatmentId,
      frequencyId,
    );
  },

  async create(
    data: CreateTreatmentReminderPayload,
  ): Promise<TreatmentReminder> {
    const existingTreatment: Treatment = await treatmentsRepository.findById(
      data.treatment_id,
    );
    if (!existingTreatment) throw new AppError("Treatment not found", 404);

    const existingReminderFrequency: ReminderFrequency =
      await reminderFrequenciesRepository.findById(data.reminder_frequency_id);
    if (!existingReminderFrequency)
      throw new AppError("Reminder Frequency Type not found", 404);
    const existingRelation =
      await treatmentRemindersRepository.findByTreatmentAndFrequency(
        data.treatment_id,
        data.reminder_frequency_id,
      );
    if (existingRelation)
      throw new AppError("Treatment reminder relation already exists", 409);

    return treatmentRemindersRepository.create(data);
  },

  async delete(
    treatmentId: number,
    frequencyId: number,
    callerId: number,
    role: string,
  ): Promise<TreatmentReminder> {
    const existingRelation =
      await treatmentRemindersRepository.findByTreatmentAndFrequency(
        treatmentId,
        frequencyId,
      );
    if (!existingRelation)
      throw new AppError("Treatment reminder relation not found", 404);

    await assertTreatmentAccess(treatmentId, callerId, role);

    return treatmentRemindersRepository.deleteByTreatmentAndFrequency(
      treatmentId,
      frequencyId,
    );
  },
};
