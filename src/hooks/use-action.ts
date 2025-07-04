import { useCallback, useState } from "react";

import { ActionState, FieldErrors } from "@/lib/create-action";

type Action<TInput, TOutput> = (
  data: TInput,
) => Promise<ActionState<TInput, TOutput>>;

interface useActionOptions<TOutput> {
  onSuccess?: (data: TOutput, message?: string) => void;
  onError?: (error: string) => void;
  onComplete?: () => void;
}

export const useAction = <TInput, TOutput>(
  action: Action<TInput, TOutput>,
  options: useActionOptions<TOutput> = {},
) => {
  // State for managing field-specific errors
  const [fieldErrors, setFieldErrors] = useState<
    FieldErrors<TInput> | undefined
  >(undefined);
  const [error, setError] = useState<string | undefined>(undefined);
  const [message, setMessage] = useState<string | undefined>(undefined);
  const [data, setData] = useState<TOutput | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const execute = useCallback(
    async (input: TInput) => {
      setIsLoading(true);
      try {
        const result = await action(input);
        setFieldErrors(result?.fieldErrors);

        if (!result) return;

        if (result.error) {
          setError(result.error);
          options.onError?.(result.error);
        }

        if (result.data) {
          setData(result.data);

          if (result.message) {
            setMessage(result.message);
            options.onSuccess?.(result.data, result.message);
          }
          options.onSuccess?.(result.data);
        }
      } finally {
        setIsLoading(false);
        options.onComplete?.();
      }
    },
    [action, options],
  );

  return { execute, fieldErrors, data, error, message, isLoading };
};
