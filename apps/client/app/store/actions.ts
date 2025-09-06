import { AuthShape } from "../types";
import { setAuthUser } from "./slice/auth.slice";
import { setProfileUser, ProfileStateInterface } from "./slice/profile.slice";
import { AppDispatch } from "./store";

export const setPersistedAuthData = (authData: AuthShape) => (dispatch: AppDispatch) => {
    const { backendTokens, user } = authData;
    dispatch(setAuthUser(backendTokens));
    dispatch(setProfileUser(user as ProfileStateInterface));
  };
  