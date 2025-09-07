"use client";

import { useRouter } from "next/navigation"; // Next.js App Router
import { useDispatch } from "react-redux";
import { removeAuthUser } from "../store/slice/auth.slice";
import { removeProfile } from "../store/slice/profile.slice";
import { AuthApi } from "../lib/auth.api";

export default function useLogout() {
  const router = useRouter();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      // Call logout API to clear HttpOnly cookie
      await AuthApi.logout();
      
      // Clear Redux state
      dispatch(removeAuthUser());
      dispatch(removeProfile());
      
      // Clear localStorage
      localStorage.removeItem('userId');

      // Redirect to home page
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
      // Still clear local state even if API call fails
      dispatch(removeAuthUser());
      dispatch(removeProfile());
      localStorage.removeItem('userId');
      router.push("/");
    }
  };

  return handleLogout;
}
