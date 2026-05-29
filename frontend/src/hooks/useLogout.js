import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logout } from "../lib/api.js";
import toast from "react-hot-toast";

const useLogout = () => {
  const queryClient = useQueryClient();

  const {
    mutate: logoutMutation,
    isPending,
    error,
  } = useMutation({
    mutationFn: logout,

    onSuccess: () => {
      toast.success("Logout Successfully");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Logout Failed");
    },
  });

  return { logoutMutation, isPending, error };
};
export default useLogout;
