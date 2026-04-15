import zod from "zod";
import { registry } from "../docs/openapi.registry";

const AnimalBaseSchema = zod
  .object({
    name: zod
      .string()
      .trim()
      .min(1, "Name is required")
      .max(150, "Name too long (max 150)")
      .openapi({
        description: "Animal name",
        example: "Max",
      }),

    breed: zod
      .string()
      .trim()
      .min(1, "Breed is required")
      .max(255, "Breed too long (max 255)")
      .openapi({
        description: "Animal breed",
        example: "Labrador",
      }),

    birth_date: zod.coerce.date().openapi({
      description: "Birth date",
      example: "2020-05-10",
    }),

    adoption_date: zod.coerce.date().openapi({
      description: "Adoption date",
      example: "2021-06-15",
    }),

    sex: zod.boolean().openapi({
      description: "Sex of animal (true = male, false = female)",
      example: true,
    }),

    color: zod
      .string()
      .trim()
      .max(100, "Color too long (max 100)")
      .optional()
      .openapi({
        description: "Animal color",
        example: "Black",
      }),

    is_sterilized: zod.boolean().default(false).openapi({
      description: "Is sterilized",
      example: false,
    }),

    allergies: zod.string().trim().optional().openapi({
      description: "Allergies",
      example: "Pollen",
    }),

    is_shared: zod.boolean().default(false).openapi({
      description: "Is shared animal",
      example: false,
    }),

    is_deceased: zod.boolean().default(false).openapi({
      description: "Is deceased",
      example: false,
    }),

    microship_id: zod.number().int().positive().optional().openapi({
      description: "Microchip ID",
      example: 1,
    }),

    species_id: zod.number().int().positive().openapi({
      description: "Species ID",
      example: 1,
    }),

    user_id: zod.number().int().positive().openapi({
      description: "Owner user ID",
      example: 1,
    }),
  })
  .strict();

export const CreateAnimalPayloadSchema = AnimalBaseSchema.omit({ user_id: true }).refine(
  (data) => data.birth_date <= data.adoption_date,
  {
    message: "Birth date must be before adoption date",
    path: ["birth_date"],
  },
);

registry.register("CreateAnimalPayload", CreateAnimalPayloadSchema);

export const UpdateAnimalPayloadSchema = AnimalBaseSchema.partial()
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  })
  .refine(
    (data) => {
      if (data.birth_date && data.adoption_date) {
        return data.birth_date <= data.adoption_date;
      }
      return true;
    },
    {
      message: "Birth date must be before adoption date",
      path: ["birth_date"],
    },
  );

registry.register("UpdateAnimalPayload", UpdateAnimalPayloadSchema);

export const AnimalSchema = AnimalBaseSchema.extend({
  id: zod.number(),
  created_at: zod.date(),
  updated_at: zod.date(),
});

registry.register("Animal", AnimalSchema);

export type Animal = zod.infer<typeof AnimalSchema>;
export type CreateAnimalPayload = zod.infer<typeof CreateAnimalPayloadSchema>;
export type UpdateAnimalPayload = zod.infer<typeof UpdateAnimalPayloadSchema>;
