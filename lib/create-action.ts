import { z } from "zod";

export type FieldErrors<T> = {
  [K in keyof T]?: string[];
};

export type ActionState<TInput, TOutput> = {
  data?: TOutput;
  error?: string | null;
  message?: string | null;
  fieldErrors?: FieldErrors<TInput>;
};

export const createAction = <TInput, TOutput>(
  schema: z.Schema<TInput>,
  handler: (validatedData: TInput) => Promise<ActionState<TInput, TOutput>>, // Handler function for the action
) => {
  return async (data: TInput): Promise<ActionState<TInput, TOutput>> => {
    const validatedData = schema.safeParse(data);

    if (!validatedData.success)
      return {
        fieldErrors: validatedData.error.flatten()
          .fieldErrors as FieldErrors<TInput>,
      };

    return handler(validatedData.data);
  };
};
