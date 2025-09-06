import { AuthShape, SignInPayloadType, SignUpPayloadType } from "../types";
import { HTTP_METHODS } from "../utils/constants";
import { sendRequest } from "../utils/request-service";

const API_REQUESTS = {
  SIGN_IN: {
    path: "/auth/login",
    method: HTTP_METHODS.POST,
  },
  SIGN_UP: {
    path: "/auth/register",
    method: HTTP_METHODS.POST,
  },
  REFRESH_TOKEN: {
    path: "/auth/refresh",
    method: HTTP_METHODS.POST,
  },
  VERIFY_EMAIL: {
    path: "/auth/verify-email",
    method: HTTP_METHODS.GET,
  },
  RESET_PASSWORD_EMAIL: {
    path: "/auth/reset-password-email",
    method: HTTP_METHODS.POST,
  },
  RESET_PASSWORD: {
    path: "/auth/reset-password",
    method: HTTP_METHODS.PATCH,
  },
};

const AuthApi = {
  signIn: (body: SignInPayloadType): Promise<AuthShape> => {
    console.log("🚀 ~ body:", body)
    return sendRequest(
      API_REQUESTS.SIGN_IN.method,
      API_REQUESTS.SIGN_IN.path,
      body
    );
  },

  signUp: (body: SignUpPayloadType): Promise<AuthShape> => {
    return sendRequest(
      API_REQUESTS.SIGN_UP.method,
      API_REQUESTS.SIGN_UP.path,
      body
    );
  },

  refreshAuthToken: async (companyId?: string): Promise<AuthShape> => {
    return await sendRequest(
      API_REQUESTS.REFRESH_TOKEN.method,
      `${API_REQUESTS.REFRESH_TOKEN.path}`,
      { companyId }
    );
  },

  verifyEmail: (token: string): Promise<boolean> => {
    return sendRequest(
      API_REQUESTS.VERIFY_EMAIL.method,
      `${API_REQUESTS.VERIFY_EMAIL.path}/${token}`
    );
  },

  sendResetPasswordEmail: (body: { email: string }): Promise<boolean> => {
    return sendRequest(
      API_REQUESTS.RESET_PASSWORD_EMAIL.method,
      API_REQUESTS.RESET_PASSWORD_EMAIL.path,
      body
    );
  },

  resetPassword: (body: {
    password: string;
    token: string;
  }): Promise<boolean> => {
    return sendRequest(
      API_REQUESTS.RESET_PASSWORD.method,
      API_REQUESTS.RESET_PASSWORD.path,
      body
    );
  },
};

export { AuthApi };
