import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getUserFriends } from "../lib/api.js";
import FriendCard, { getLanguageFlag } from "../components/FriendCard.jsx";
import NoFriendsFound from "../components/NoFriendsFound.jsx";

const FriendsPage = () => {
  const { data: friends = [], isLoading: loadingFriends } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-base-100 h-full pb-24 lg:pb-0">
      <div className="container mx-auto space-y-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Your Friends
          </h2>
        </div>

        {loadingFriends ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : friends.length === 0 ? (
          <NoFriendsFound />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {friends.map((friend, index) => (
              <FriendCard key={friend._id} friend={friend} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendsPage;
