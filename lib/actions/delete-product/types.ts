import { z } from "zod";

import { deleteProductSchema } from "@/lib/actions/delete-product/schema";
import { ActionState } from "@/lib/create-action";

export type InputType = z.infer<typeof deleteProductSchema>;
export type ReturnType = ActionState<InputType, undefined>;
