import { z } from "zod";

export const updateUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  username: z.string(),
  password: z.string().optional().nullable(),
  idNumber: z.string(),
  isAdmin: z.boolean(),
  isModerator: z.boolean(),
});
