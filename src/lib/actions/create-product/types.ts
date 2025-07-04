import { Product } from "@prisma/client";
import { z } from "zod";

import { createProductSchema } from "@/lib/actions/create-product/schema";
import { ActionState } from "@/lib/create-action";

export type InputType = z.infer<typeof createProductSchema>;
export type ReturnType = ActionState<InputType, Product>;
