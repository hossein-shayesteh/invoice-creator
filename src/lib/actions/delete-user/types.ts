import { z } from "zod";

import { deleteUserSchema } from "@/lib/actions/delete-user/schema";
import { ActionState } from "@/lib/create-action";

export type InputType = z.infer<typeof deleteUserSchema>;
export type ReturnType = ActionState<InputType, undefined>;
