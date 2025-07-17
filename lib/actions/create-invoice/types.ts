import { Invoice } from "@prisma/client";
import { z } from "zod";

import { createInvoiceSchema } from "@/lib/actions/create-invoice/schema";
import { ActionState } from "@/lib/create-action";

export type InputType = z.infer<typeof createInvoiceSchema>;
export type ReturnType = ActionState<InputType, Invoice>;
