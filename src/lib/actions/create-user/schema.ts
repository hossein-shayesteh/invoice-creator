import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string(),
  username: z.string(),
  password: z.string(),
  isAdmin: z.boolean(),
});
