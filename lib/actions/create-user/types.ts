import { Role } from "@prisma/client";
import { z } from "zod";

import { createUserSchema } from "@/lib/actions/create-user/schema";
import { ActionState } from "@/lib/create-action";

export type InputType = z.infer<typeof createUserSchema>;
export type ReturnType = ActionState<InputType, User>;

type User = {
  name: string | null;
  id: string;
  username: string | null;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
};
