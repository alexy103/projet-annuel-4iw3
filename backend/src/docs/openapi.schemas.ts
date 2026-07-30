import zod from "zod";

export const MessageResponseSchema = zod.object({ message: zod.string() });

