import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signup } from "../lib/api.js";
import toast from "react-hot-toast";

const useSignUp = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending, error } = useMutation({
    mutationFn: signup,
    onSuccess: () => {
      toast.success("Signup Successfully");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Signup failed");
    },
  });

  return { isPending, error, signupMutation: mutate };
};
export default useSignUp;
