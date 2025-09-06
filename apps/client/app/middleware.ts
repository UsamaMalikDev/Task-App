import { NextRequest, NextResponse } from "next/server";
import { AuthShape } from "./types";
import { ROUTES } from "./utils/helpers";
import {
  accessValidation,
  getAbsolutePath,
  getAuthToken,
  isAlreadyRendered,
  isProtectedRoute,
  routeValidation,
  validateAuthToken,
} from "./utils/helpers";

export default function middleware(req: NextRequest) {
  const currentRoute = req.nextUrl.pathname;
  const authCookie = getAuthToken(req);
  const auth = validateAuthToken(authCookie);

  if (isProtectedRoute(currentRoute)) {
    return handleProtectedRoutes(req, auth, currentRoute);
  }

  return handlePublicRoutes(req, auth, currentRoute);
}

function handleProtectedRoutes(
  req: NextRequest,
  auth: AuthShape | null,
  currentRoute: string
) {
  const baseUrl = new URL(req.url);

  const { redirectTo: accessRedirection, valid: hasValidAccess } =
    accessValidation(auth, currentRoute);

  const { redirectTo: routeRedirection, valid: hasValidRoute } =
    routeValidation(auth, currentRoute); // always treat onboarding as complete

  if (
    !hasValidAccess &&
    accessRedirection &&
    !isAlreadyRendered(currentRoute, accessRedirection)
  ) {
    return NextResponse.redirect(
      getAbsolutePath(accessRedirection, baseUrl?.origin)
    );
  }

  if (
    !hasValidRoute &&
    routeRedirection &&
    !isAlreadyRendered(currentRoute, routeRedirection)
  ) {
    return NextResponse.redirect(
      getAbsolutePath(routeRedirection, baseUrl?.origin)
    );
  }

  return NextResponse.next();
}

function handlePublicRoutes(
  req: NextRequest,
  auth: AuthShape | null,
  currentRoute: string
) {
  const baseUrl = new URL(req.url);

  if (auth && !isAlreadyRendered(currentRoute, ROUTES.TASKS.path)) {
    return NextResponse.redirect(
      getAbsolutePath(ROUTES.TASKS.path, baseUrl?.origin)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Temporarily disabled middleware to allow HttpOnly cookie authentication
    // "/contractor/:path*",
    // "/",
    // "/signup",
    // "/worker/:path*",
    // "/admin/:path*",
    // "/tasks/:path*",
  ],
};
