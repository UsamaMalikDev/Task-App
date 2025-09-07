import { RootState } from "../store";

const selectAuthUser = (state: RootState) => state.auth.user;
const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
const selectUserRoles = (state: RootState) => state.auth.user?.roles || [];

export { selectAuthUser, selectIsAuthenticated, selectUserRoles };
