import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login } from "../lib/api.js";
import toast from "react-hot-toast";

const useLogin = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending, error } = useMutation({
    mutationFn: login,

    onSuccess: () => {
      toast.success("Login Successful");

      queryClient.invalidateQueries({
        queryKey: ["authUser"],
      });
    },

    onError: (error) => {
      toast.error(error.response?.data?.message || "Login Failed");
    },
  });

  return { error, isPending, loginMutation: mutate };
};

export default useLogin;
