import { Role } from "@prisma/client";
import { z } from "zod";

import { updateUserSchema } from "@/lib/actions/update-user/schema";
import { ActionState } from "@/lib/create-action";

export type InputType = z.infer<typeof updateUserSchema>;
export type ReturnType = ActionState<InputType, User>;

type User = {
  name: string | null;
  id: string;
  username: string | null;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
};
