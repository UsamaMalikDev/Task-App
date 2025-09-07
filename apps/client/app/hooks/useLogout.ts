"use client";

import { useNavigation } from "./useNavigation"; 
import { useDispatch } from "react-redux";
import { removeAuthUser } from "../store/slice/auth.slice";
import { removeProfile } from "../store/slice/profile.slice";
import { AuthApi } from "../lib/auth.api";

export default function useLogout() {
  const navigate = useNavigation();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      await AuthApi.logout();

      dispatch(removeAuthUser());
      dispatch(removeProfile());

      localStorage.removeItem('userId');

      navigate("/");
    } catch (error) {
      dispatch(removeAuthUser());
      dispatch(removeProfile());
      localStorage.removeItem('userId');
      navigate("/");
    }
  };

  return handleLogout;
}
