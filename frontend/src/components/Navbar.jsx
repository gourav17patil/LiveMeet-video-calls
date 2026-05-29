import { Link, useLocation } from "react-router";
import useAuthUser from "../hooks/useAuthUser.js";
import { BellIcon, LogOutIcon, Rss, SearchIcon } from "lucide-react";
import ThemeSelector from "./ThemeSelector.jsx";
import useLogout from "../hooks/useLogout.js";
import toast from "react-hot-toast";
import { chatClient } from "../lib/stream.js";

import {
  searchUsers,
  getFriendRequests,
  sendFriendRequest,
  getOutgoingFriendReqs,
  acceptFriendRequest,
} from "../lib/api.js";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUserFriends } from "../lib/api.js";

const Navbar = () => {
  const { authUser } = useAuthUser();
  const queryClient = useQueryClient();

  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingUserId, setLoadingUserId] = useState(null);

  const [searchResults, setSearchResults] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const { data: friends = [] } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  const { data: friendRequestsData } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendRequests,
  });

  const friendRequests = friendRequestsData?.incomingReqs || [];

  const incomingRequest = friendRequests.find(
    (req) => req.sender._id === selectedUser?._id,
  );

  const hasIncomingRequest = !!incomingRequest;

  const unreadMessages = 0;

  const hasNotifications = friendRequests.length > 0 || unreadCount > 0;

  const handleSearch = async (value) => {
    setSearchQuery(value);

    // EMPTY SEARCH
    if (!value.trim()) {
      setSearchResults([]);

      return;
    }

    try {
      const users = await searchUsers(value);

      const filteredUsers = users.filter((user) => user._id !== authUser._id);

      setSearchResults(filteredUsers);
    } catch (error) {
      console.log(error);
    }
  };

  // const queryClient = useQueryClient();
  // const { mutate: logoutMutation } = useMutation({
  //   mutationFn: logout,
  //   onSuccess: () => queryClient.invalidateQueries({ queryKey: ["authUser"] }),
  // });

  const { logoutMutation } = useLogout();

  const { data: outgoingFriendReqs } = useQuery({
    queryKey: ["outgoingFriendReqs"],
    queryFn: getOutgoingFriendReqs,
  });

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
      toast.success("Friend Request Send successfully");
      queryClient.invalidateQueries({
        queryKey: ["outgoingFriendReqs"],
      });

      setLoadingUserId(null);
    },

    onError: () => {
      toast.error("Something Went Wrong");
      setLoadingUserId(null);
    },
  });

  useEffect(() => {
    // WAIT UNTIL USER CONNECTS
    if (!chatClient.userID) return;

    const updateUnreadCount = () => {
      setUnreadCount(chatClient.user?.total_unread_count || 0);
    };

    // INITIAL COUNT
    updateUnreadCount();

    // LIVE EVENTS
    chatClient.on("message.new", updateUnreadCount);

    chatClient.on("notification.message_new", updateUnreadCount);

    chatClient.on("notification.mark_read", updateUnreadCount);

    return () => {
      chatClient.off("message.new", updateUnreadCount);

      chatClient.off("notification.message_new", updateUnreadCount);

      chatClient.off("notification.mark_read", updateUnreadCount);
    };
  }, []);

  const location = useLocation();

  const isChatPage = location.pathname.startsWith("/chat");

  const isHomePage = location.pathname === "/";
  const isNotificationsPage = location.pathname === "/notifications";
  const isEditProfilePage = location.pathname === "/edit-profile";
  const isFriendsPage = location.pathname === "/friends";

  const isFriend = friends.some((friend) => friend._id === selectedUser?._id);

  const hasRequestBeenSent = outgoingFriendReqs?.some(
    (req) => req.recipient._id === selectedUser?._id,
  );

  return (
    <nav className="bg-base-200 border-b border-base-300 sticky top-0 z-30 h-16 flex items-center">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between w-full gap-4">
          {/* LOGO - ONLY IN THE CHAT PAGE */}
        <div
  className={`
    pl-5

    ${
      isChatPage
        ? "block"
        : "lg:hidden"
    }
  `}
>
            <div className="pl-5">
              <Link to="/" className="flex items-center gap-2.5 ">
                <Rss className="size-9 text-primary" />
                <span
  className={`
    text-3xl
    font-bold
    font-mono
    bg-clip-text
    text-transparent
    bg-gradient-to-r
    from-primary
    to-secondary
    tracking-wider

    ${
  isChatPage
    ? "hidden sm:block lg:block"
    : "hidden"
}
  `}
>
                  LiveMeet
                </span>
              </Link>
            </div>
          </div>

          <div className="flex-1 flex justify-center px-2 ">
            <div className=" relative w-full max-w-[180px] sm:max-w-md">
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="input input-bordered w-full rounded-full pl-10"
              />

              {/* SEARCH ICON */}
              <SearchIcon className=" h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 opacity-60 " />

              {/* SEARCH RESULTS */}
              {searchResults.length > 0 && (
                <div
                  className=" fixed sm:absolute top-14 left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0 w-[95vw]
                 sm:w-full max-h-80 overflow-y-auto bg-base-200 rounded-2xl shadow-xl z-50 border border-base-300"
                >
                  {searchResults.map((user) => (
                    <button
                      key={user._id}
                      onClick={() => {
                        setSelectedUser(user);

                        setSearchQuery("");

                        setSearchResults([]);
                      }}
                      className=" w-full flex items-center gap-3  p-3  hover:bg-base-300 transition-colors text-left "
                    >
                      <img
                        src={user.profilePic}
                        alt={user.fullName}
                        className=" w-10 h-10 rounded-full object-cover "
                      />

                      <div>
                        <h3 className="font-medium">{user.fullName}</h3>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {selectedUser && (
            <div className=" fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
              <motion.div
                whileHover={{
                  y: -5,
                }}
                initial={{
                  opacity: 0,
                  y: 50,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: 50,
                }}
                transition={{
                  duration: 0.3,
                }}
                className="bg-base-200 rounded-2xl w-full max-w-sm p-6 relative "
              >
                {/* CLOSE BUTTON */}
                <button
                  onClick={() => setSelectedUser(null)}
                  className=" absolute top-3 right-3  btn  btn-sm  btn-circle "
                >
                  ✕
                </button>

                {/* PROFILE */}
                <div className=" flex flex-col items-center text-center  ">
                  <img
                    src={selectedUser.profilePic}
                    alt=""
                    className=" w-24 h-24 rounded-full object-cover mb-4"
                  />

                  <h2 className=" text-2xl font-bold ">
                    {selectedUser.fullName}
                  </h2>

                  {selectedUser.location && (
                    <p className=" opacity-70 mt-1">
                      📍 {selectedUser.location}
                    </p>
                  )}

                  {selectedUser.bio && (
                    <p className=" mt-4  text-sm opacity-80">
                      {selectedUser.bio}
                    </p>
                  )}

                  {/* LANGUAGES */}
                  <div className=" flex gap-2 mt-4 flex-wrap justify-center  ">
                    <span className="badge badge-primary">
                      Native: {selectedUser.nativeLanguage}
                    </span>

                    <span className="badge badge-secondary">
                      Learning: {selectedUser.learningLanguage}
                    </span>
                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="w-full mt-6">
                    {isFriend ? (
                      <Link
                        to={`/chat/${selectedUser._id}`}
                        className="btn btn-primary w-full"
                        onClick={() => {
                          setSelectedUser(null);

                          setSearchQuery("");

                          setSearchResults([]);
                        }}
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
                      <button className="btn btn-disabled w-full">
                        Request Sent
                      </button>
                    ) : (
                      <button
                        className="btn btn-primary w-full"
                        disabled={loadingUserId === selectedUser._id}
                        onClick={() => {
                          setLoadingUserId(selectedUser._id);

                          sendRequestMutation(selectedUser._id);

                          setSelectedUser(null);

                          setSearchQuery("");

                          setSearchResults([]);
                        }}
                      >
                        {loadingUserId === selectedUser._id
                          ? "Sending..."
                          : "Add Friend"}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          <Link to={"/notifications"}>
            <button className="btn btn-ghost btn-circle relative overflow-visible">
              <BellIcon className="h-6 w-6 text-base-content opacity-70" />

              {/* RED NOTIFICATION DOT */}
              {hasNotifications && (
                <span
                  className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full min-w-[18px] h-[18px] 
                flex items-center justify-center px-1 z-50"
                >
                  {friendRequests.length + unreadCount}
                </span>
              )}
            </button>
          </Link>

          {/* TODO */}
          <ThemeSelector />

          <Link to="edit-profile">
            <div className="avatar">
              <div className="w-9 rounded-full">
                <img
                  src={authUser?.profilePic}
                  alt="User Avatar"
                  rel="noreferrer"
                />
              </div>
            </div>
          </Link>

          {/* Logout button */}
          <button className="btn btn-ghost btn-circle" onClick={logoutMutation}>
            <LogOutIcon className="h-6 w-6 text-base-content opacity-70" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
