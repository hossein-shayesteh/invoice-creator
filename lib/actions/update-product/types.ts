import { Product } from "@prisma/client";
import { z } from "zod";

import { updateProductSchema } from "@/lib/actions/update-product/schema";
import { ActionState } from "@/lib/create-action";

export type InputType = z.infer<typeof updateProductSchema>;
export type ReturnType = ActionState<InputType, Product>;
