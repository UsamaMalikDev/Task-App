"use client";

import { useRouter } from "next/navigation"; // Next.js App Router
import { useDispatch } from "react-redux";
import { removeAuthUser } from "../store/slice/auth.slice";
import { removeProfile } from "../store/slice/profile.slice";
import { removeAuthCookie } from "../utils/helpers";

export default function useLogout() {
  const router = useRouter();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      removeAuthCookie();
      dispatch(removeAuthUser());
      dispatch(removeProfile());

      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      }
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return handleLogout;
}
