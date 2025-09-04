import { RootState} from "../store";

const selectAuthToken = (state: RootState) => (state as any).auth?.token;

export { selectAuthToken };
