import { NOTIFY_TYPE } from "../utils/constants";
import { useState } from "react";
import { toast } from "sonner";

const useApiOperation = () => {
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiLoading, setApiLoading] = useState<boolean>(false);

  const resetApiOperation = () => {
    setApiError(null);
    setApiLoading(false);
  };
  const startApiOperation = () => {
    resetApiOperation();
    setApiLoading(true);
  };
  const terminateApiOperation = (
    message: string[] = [],
    mode: NOTIFY_TYPE = NOTIFY_TYPE.Error
  ) => {
    if (message?.length) {
      switch (mode) {
        case NOTIFY_TYPE.Success:
          toast.success(message?.join("\n"));
          break;
        case NOTIFY_TYPE.Error:
          toast.error(message?.join("\n"));
          break;
        case NOTIFY_TYPE.Info:
          toast.info(message?.join("\n"));
          break;
        case NOTIFY_TYPE.Warning:
          toast.warning(message?.join("\n"));
          break;
      }
    }
    setApiLoading(false);
  };

  return {
    setApiError,
    resetApiOperation,
    apiError,
    startApiOperation,
    terminateApiOperation,
    apiLoading,
  };
};

export { useApiOperation };
