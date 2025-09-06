import { RootState } from "../store";
import { UserProfile } from "../slice/auth.slice";

const selectAuthUser = (state: RootState) => state.auth?.user;
const selectIsAuthenticated = (state: RootState) => state.auth?.isAuthenticated;
const selectUserRoles = (state: RootState) => state.auth?.user?.roles || [];

export { selectAuthUser, selectIsAuthenticated, selectUserRoles };
