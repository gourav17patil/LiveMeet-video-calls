import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  getOutgoingFriendReqs,
  getRecommendedUsers,
  getUserFriends,
  getFriendRequests,
  sendFriendRequest,
  acceptFriendRequest,
} from "../lib/api.js";
import { Link } from "react-router";
import {
  CheckCircleIcon,
  MapPinIcon,
  UserPlusIcon,
  UsersIcon,
} from "lucide-react";

import { motion } from "framer-motion";

import { capitialize } from "../lib/utils.js";

import FriendCard, { getLanguageFlag } from "../components/FriendCard.jsx";
import NoFriendsFound from "../components/NoFriendsFound.jsx";

const HomePage = () => {
  const queryClient = useQueryClient();
  const [outgoingRequestsIds, setOutgoingRequestsIds] = useState(new Set());
  const [loadingUserId, setLoadingUserId] = useState(null);
  const [showAllFriends, setShowAllFriends] = useState(false);

  const { data: friends = [], isLoading: loadingFriends } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  const { data: recommendedUsers = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: getRecommendedUsers,
  });

  const { data: outgoingFriendReqs } = useQuery({
    queryKey: ["outgoingFriendReqs"],
    queryFn: getOutgoingFriendReqs,
  });

  const { data: friendRequestsData } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendRequests,
  });

  const friendRequests = friendRequestsData?.incomingReqs || [];

  const { mutate: acceptRequestMutation, isPending } = useMutation({
    mutationFn: acceptFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    },
  });

  const acceptedRequests = friendRequests?.acceptedReqs || [];

  const { mutate: sendRequestMutation } = useMutation({
    mutationFn: sendFriendRequest,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["outgoingFriendReqs"],
      });

      setLoadingUserId(null);
    },

    onError: () => {
      setLoadingUserId(null);
    },
  });

  useEffect(() => {
    const outgoingIds = new Set();
    if (outgoingFriendReqs && outgoingFriendReqs.length > 0) {
      outgoingFriendReqs.forEach((req) => {
        outgoingIds.add(req.recipient._id);
      });
      setOutgoingRequestsIds(outgoingIds);
    }
  }, [outgoingFriendReqs]);

  const displayedFriends = showAllFriends ? friends : friends.slice(0, 4);

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-base-100 pb-24 sm:pb-24 lg:pb-10">
      <div className="container mx-auto space-y-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Your Network
          </h2>
          <Link to="/notifications" className="btn btn-outline btn-sm">
            <UsersIcon className="mr-2 size-4" />
            Friend Requests
          </Link>
        </div>

        {loadingFriends ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : friends.length === 0 ? (
          <NoFriendsFound />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {displayedFriends.map((friend, index) => (
              <FriendCard key={friend._id} friend={friend} index={index} />
            ))}
          </div>
        )}

        {friends.length > 4 && (
          <div className="flex justify-center mt-4">
            <button
              onClick={() => setShowAllFriends(!showAllFriends)}
              className="btn btn-outline btn-primary"
            >
              {showAllFriends ? "See Less" : "See More"}
            </button>
          </div>
        )}

        <section>
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  Meet New Learners
                </h2>
                <p className="opacity-70">
                  Discover perfect language exchange partners based on your
                  profile
                </p>
              </div>
            </div>
          </div>

          {loadingUsers ? (
            <div className="flex justify-center py-12">
              <span className="loading loading-spinner loading-lg" />
            </div>
          ) : recommendedUsers.length === 0 ? (
            <div className="card bg-base-200 p-6 text-center">
              <h3 className="font-semibold text-lg mb-2">
                No recommendations available
              </h3>
              <p className="text-base-content opacity-70">
                Check back later for new language partners!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedUsers.map((user, index) => {
                const isFriend = friends.some(
                  (friend) => friend._id === user._id,
                );

                const incomingRequest = friendRequests.find(
                  (req) => req.sender._id === user._id,
                );

                const hasIncomingRequest = !!incomingRequest;

                const hasRequestBeenSent = outgoingRequestsIds.has(user._id);

                return (
                  <motion.div
                    key={user._id}
                    initial={{
                      opacity: 0,
                      scale: 0.9,
                      y: 30,
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      y: 0,
                    }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.08,
                      ease: "easeOut",
                    }}
                    whileHover={{
                      scale: 1.02,
                      y: -6,
                      transition: {
                        duration: 0.2,
                      },
                    }}
                    whileTap={{
                      scale: 0.97,
                    }}
                    className=" relative overflow-hidden transform-gpu rounded-3xl bg-white/90 dark:bg-base-200/80 border border-black/5 dark:border-white/10 
                    backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.08)]  hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-1 transition-all duration-300 group"
                  >
                    {/* Animated Gradient Border */}

                    <div className=" absolute inset-0 rounded-3xl p-[1px] bg-gradient-to-br from-primary/30 via-transparent to-secondary/30 opacity-0 group-hover:opacity-100 transition-opacity  duration-500" />

                    {/* PREMIUM LIGHT EFFECT */}

                    <div className="  absolute  inset-0  bg-gradient-to-br  from-primary/10  via-white/5  to-secondary/10  opacity-0  group-hover:opacity-100  transition-all duration-500 " />

                    {/* TOP LIGHT */}

                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/60 to-transparent" />

                    <div className="card-body p-5 space-y-4 relative z-10">
                      {/* USER INFO */}

                      <div className="flex items-center gap-4">
                        <div className="  avatar  ring  ring-primary/30  ring-offset-base-100  ring-offset-2  rounded-full">
                          <div className="w-16 rounded-full">
                            <img
                              src={user.profilePic}
                              alt={user.fullName}
                              className="object-cover"
                            />
                          </div>
                        </div>

                        <div>
                          <h3 className=" font-bold text-xl ">
                            {user.fullName}
                          </h3>

                          {user.location && (
                            <div className="flex items-center text-xs opacity-70 mt-1">
                              <MapPinIcon className="size-3 mr-1" />
                              {user.location}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* LANGUAGES */}
                      <div className="flex flex-wrap gap-2">
                        <span className="badge badge-primary badge-lg">
                          {getLanguageFlag(user.nativeLanguage)}
                          Native: {capitialize(user.nativeLanguage)}
                        </span>

                        <span className="badge badge-outline badge-lg">
                          {getLanguageFlag(user.learningLanguage)}
                          Learning: {capitialize(user.learningLanguage)}
                        </span>
                      </div>

                      {/* BIO */}
                      <p className="text-sm opacity-75 min-h-[50px]">
                        {user.bio || "Passionate language learner"}
                      </p>

                      {/* BUTTON */}
                      {isFriend ? (
                        <Link
                          to={`/chat/${user._id}`}
                          className="btn btn-primary rounded-2xl w-full"
                        >
                          Message
                        </Link>
                      ) : hasIncomingRequest ? (
                        <button
                          className="btn btn-success rounded-2xl w-full"
                          onClick={() =>
                            acceptRequestMutation(incomingRequest._id)
                          }
                          disabled={isPending}
                        >
                          Accept Request
                        </button>
                      ) : hasRequestBeenSent ? (
                        <button className="btn btn-disabled rounded-2xl w-full">
                          Request Sent
                        </button>
                      ) : (
                        <button
                          className="btn btn-primary rounded-2xl w-full"
                          onClick={() => sendRequestMutation(user._id)}
                        >
                          <UserPlusIcon className="size-4 mr-2" />
                          Send Friend Request
                        </button>
                      )}
                    </div>
                    {/* Shine Effect */}
                    <div
                      className=" absolute top-0 -left-full w-[120%] h-full bg-gradient-to-r from-transparent via-white/20 to-transparent
                     rotate-12 group-hover:left-full  transition-all duration-700 "
                    />
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default HomePage;
