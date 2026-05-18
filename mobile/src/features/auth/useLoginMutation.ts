import { useMutation } from "@tanstack/react-query";
import { login } from "../../api/auth";
import { useAuthStore } from "../../store/authStore";

interface LoginInput {
  email: string;
  password: string;
}

export function useLoginMutation() {
  const setLogin = useAuthStore((state) => state.login);

  return useMutation({
    mutationFn: async ({ email, password }: LoginInput) => {
      const response = await login({ email, password });

      if (response.user.role !== "worker") {
        throw new Error("Only worker accounts can use this mobile app.");
      }

      await setLogin(response.token, response.user);
      return response;
    },
  });
}
