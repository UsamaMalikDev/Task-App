import { HTTP_METHODS } from "../utils/constants";
import { sendRequest } from "../utils/request-service";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface UserProfile {
  _id: string;
  email: string;
  roles: string[];
  name: string;
  avatar: string;
  isVerified: string;
  disabled: boolean;
  organizationId: string;
}

export interface LoginResponse {
  user: UserProfile;
}

export interface MeResponse {
  user: UserProfile;
}

export interface SignupPayload {
  userInfo: {
    name: string;
    email: string;
    organizationId: string;
    phone: string;
    password: string;
    confirmPassword: string;
    source: string;
    reason?: string;
    agreedToTerms: boolean;
  };
  selectedPlan: string;
}

export interface SignupResponse {
  accessToken: string;
  refreshToken: string;
  user: UserProfile;
}

const AuthApi = {
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    return sendRequest(HTTP_METHODS.POST, "/api/auth/login", payload);
  },

  logout: async (): Promise<{ message: string }> => {
    return sendRequest(HTTP_METHODS.POST, "/api/auth/logout");
  },

  getMe: async (): Promise<MeResponse> => {
    return sendRequest(HTTP_METHODS.GET, "/api/auth/me");
  },

  signUp: async (payload: SignupPayload): Promise<SignupResponse> => {
    return sendRequest(HTTP_METHODS.POST, "/api/auth/register", payload);
  },

  refreshToken: async (): Promise<any> => {
    return sendRequest(HTTP_METHODS.POST, "/api/auth/refresh", {});
  },
};

export { AuthApi };