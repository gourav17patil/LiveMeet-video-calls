import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import useAuthUser from "../hooks/useAuthUser.js";
import { getStreamToken } from "../lib/api.js";
import { chatClient } from "../lib/stream.js";

const StreamProvider = ({ children }) => {

  const { authUser } = useAuthUser();

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  useEffect(() => {

    const connectUser = async () => {

      if (
        !authUser ||
        !tokenData?.token
      ) return;

      if (chatClient.userID) return;

      try {

        await chatClient.connectUser(
          {
            id: authUser._id,
            name: authUser.fullName,
            image: authUser.profilePic,
          },
          tokenData.token
        );

        console.log("Stream Connected");

      } catch (error) {

        console.log(error);

      }

    };

    connectUser();

  }, [authUser, tokenData]);

  return children;
};

export default StreamProvider;