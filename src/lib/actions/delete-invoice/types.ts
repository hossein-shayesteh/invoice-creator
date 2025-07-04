import { z } from "zod";

import { deleteInvoiceSchema } from "@/lib/actions/delete-invoice/schema";
import { ActionState } from "@/lib/create-action";

export type InputType = z.infer<typeof deleteInvoiceSchema>;
export type ReturnType = ActionState<InputType, undefined>;
