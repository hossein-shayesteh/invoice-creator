import { CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

type ToastProps = {
  message?: string;
  type: "success" | "error";
};

const CustomToast = ({ message, type }: ToastProps) => (
  <div className="flex items-start gap-3">
    {type === "success" ? (
      <CheckCircle className="mt-1 h-5 w-5 text-green-600" />
    ) : (
      <XCircle className="mt-1 h-5 w-5 text-red-600" />
    )}
    <div className="flex flex-col text-right">
      <p className="text-sm font-semibold text-gray-800">{message}</p>
    </div>
  </div>
);

export const showToast = {
  success: (message?: string) => {
    toast(<CustomToast message={message} type="success" />);
  },
  error: (message?: string) => {
    toast(<CustomToast message={message} type="error" />);
  },
};
