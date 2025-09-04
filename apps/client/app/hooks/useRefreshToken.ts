import { AuthApi } from "../lib/auth.api";
import { setPersistedAuthData } from "../store/actions";
import { useAppDispatch } from "../store/hooks";
import { checkError, setAuthCookie } from "../utils/helpers";
import { useApiOperation } from "./useApiOperations";

const useRefreshToken = () => {
  const dispatch = useAppDispatch();
  const { startApiOperation, terminateApiOperation } = useApiOperation();

  const handleRefreshToken = async (companyId?: string) => {
    try {
      startApiOperation();
      const authData = await AuthApi.refreshAuthToken(companyId);
      const error = checkError([authData]);

      if (error) {
        terminateApiOperation([
          "Something went wrong while processing your payment details",
        ]);
        return { authData: null };
      }

      setAuthCookie(authData);
      dispatch(setPersistedAuthData(authData));

      return { authData };
    } catch (error) {
      terminateApiOperation([
        "Something went wrong while processing your request. Please try again later",
      ]);
      return { authData: null };
    } finally {
      terminateApiOperation();
    }
  };

  return {
    handleRefreshToken,
  };
};

export { useRefreshToken };
