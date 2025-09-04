import Cookies from "js-cookie";
import { AuthShape } from "../types";
import { NextRequest } from "next/server";
import { APP_ROLES, NAV_PATHS } from "./constants";

export const getAuthToken = (req: NextRequest) => {
  const cookieString = req.cookies;
  const cookies = cookieString.toString().split(";");
  let auth = null;

  for (const cookie of cookies) {
    const [cookieName, cookieValue] = cookie.split("=").map((s) => s.trim());
    if (cookieName === "auth") {
      try {
        auth = JSON.parse(decodeURIComponent(cookieValue));
      } catch (error) {
        console.error("Error parsing auth:", error);
      }
      break;
    }
  }
  return auth;
};

export const validateAuthToken = (auth: AuthShape | null) => {
  if (!auth) return null;
  const { backendTokens } = auth;
  const { expires, createdOn } = backendTokens;

  const currentTimestamp = new Date().getTime();
  const createdOnTimestamp = new Date(createdOn).getTime();
  const expiresTimestamp = Number(expires);

  if (currentTimestamp - createdOnTimestamp >= expiresTimestamp) {
    removeAuthCookie();
    return null;
  }
  return auth;
};

export const setAuthCookie = (authData: AuthShape) => {
  Cookies.set("auth", JSON.stringify(authData), {
    expires: Number(authData?.backendTokens?.expires),
    path: "/",
    secure: process.env.NODE_ENV === "production",
    httpOnly: process.env.NODE_ENV === "production",
  });
};

export const removeAuthCookie = () => {
  Cookies.remove("auth");
};

export const getAuthCookie = (): AuthShape => {
  return JSON.parse(Cookies.get("auth") || "{}");
};

export const accessValidation = (
  auth: AuthShape | null,
  _currentRoute?: string // unused now
) => {
  const defaultPayload = {
    valid: false,
    redirectTo: ROUTES.SIGNIN.path,
    message: "You must be signed in to continue",
  };

  if (!auth) return defaultPayload;

  return {
    valid: true,
    redirectTo: null,
    message: "Successfully Signed In",
  };
};

export const ROUTES = {
  SIGNIN: {
    name: "Sign In",
    path: "/",
    icon: () => null,
    navigation: [],
    allowedRoles: [],
  },
  SIGNUP: {
    name: "Sign Up",
    path: "/sign-up",
    icon: () => null,
    navigation: [],
    allowedRoles: [],
  },
  DASHBOARD: {
    name: 'Dashboard',
    path: '/contractor',
    icon: '',
    allowedRoles: [APP_ROLES.MANAGER, APP_ROLES.CONTRACTOR, APP_ROLES.SALES],
    navigation: [NAV_PATHS.CONTRACTOR],
  },
  TASKS: {
    name: 'Tasks',
    path: '/tasks',
    icon: '',
    allowedRoles: [APP_ROLES.MANAGER, APP_ROLES.CONTRACTOR, APP_ROLES.SALES, APP_ROLES.WORKER],
    navigation: [NAV_PATHS.CONTRACTOR],
  },
  // PRIVACY_POLICY: {
  //   name: 'Privacy Policy',
  //   path: '/privacy-policy',
  //   icon: () => null,
  //   navigation: [],
  //   allowedRoles: [],
  // },
  // TERMS_AND_CONDITION: {
  //   name: 'Terms of Service',
  //   path: '/terms-of-service',
  //   icon: () => null,
  //   navigation: [],
  //   allowedRoles: [],
  // },
  FORGOT_PASSWORD: {
    name: "Forgot password?",
    path: "/forgot-password",
    icon: () => null,
    navigation: [],
    allowedRoles: [],
  },
};

export const checkError = (data: unknown[]) => {
  let error = null;
  data.forEach((eachDataSet) => {
    if (eachDataSet?.error !== undefined) {
      error = eachDataSet.error;
    }
  });
  return error;
};

export const isRouteValidForUser = (auth: AuthShape, currentRoute: string) => {
  if (!auth) return true
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  for (const [_, route] of Object.entries(ROUTES)) {
    // console.log(_);
    const { path, allowedRoles } = route

    if (currentRoute.startsWith(path) && allowedRoles) {
      const userRoles = auth?.user?.roles

      // Current route is valid for the user
      if (allowedRoles.some((role: APP_ROLES) => userRoles.includes(role))) {
        return true
      }
    }
  }
  // Current route is invalid for the user
  return false
}

export const routeValidation = (
  auth: AuthShape | null,
  currentRoute: string,
) => {
  // Handle unauthenticated users
  if (!auth) {
    return {
      valid: false,
      redirectTo: ROUTES.SIGNIN.path,
    }
  }

  // Handle worker role - always redirect to hallway
  if (auth.user.roles.includes(APP_ROLES.WORKER)) {
    const isValidRoute = isRouteValidForUser(auth, currentRoute);
    if (isValidRoute) {
      return {
        valid: true,
        redirectTo: currentRoute,
      };
    }
  }

  // Check if route is valid for user's roles
  const isValidRoute = isRouteValidForUser(auth, currentRoute)
  if (!isValidRoute) {
    return {
      valid: false,
      redirectTo: ROUTES.TASKS.path,
    }
  }

  return {
    valid: true,
    redirectTo: null,
  }
}

export const isProtectedRoute = (pathname: string) => {
  return (
    pathname.startsWith('/contractor') ||
    pathname.startsWith('/worker') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/tasks')
  )
}

export const isAlreadyRendered = (
  relativePath: string,
  redirectPath: string,
) => {
  return relativePath === redirectPath
}

export const getAbsolutePath = (relativePath: string, baseUrl?: string) => {
  const BASE_URL = baseUrl || process.env.NEXT_PUBLIC_CLIENT_PATH
  return `${BASE_URL}${relativePath}`
}