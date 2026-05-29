import { Link, useLocation } from "react-router";
import useAuthUser from "../hooks/useAuthUser.js";
import { BellIcon, HomeIcon, Rss, UsersIcon, MessageCircle } from "lucide-react";
import { getFriendRequests } from "../lib/api.js";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { chatClient } from "../lib/stream.js";
import { formatDistanceToNow } from "date-fns";

const Sidebar = ({ isMessagesOpen, setIsMessagesOpen }) => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const currentPath = location.pathname;
  useEffect(() => {

  setIsMessagesOpen(false);

}, [location.pathname]);
  const [recentChannels, setRecentChannels] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const totalUnreadMessages = recentChannels.reduce(
    (total, channel) => total + channel.countUnread(),
    0,
  );

  const { data: friendRequestsData } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendRequests,
  });

  const incomingRequests = friendRequestsData?.incomingReqs || [];

  const hasNotifications = incomingRequests.length > 0;

  useEffect(() => {
    let interval;

    const loadRecentMessages = async () => {
      // WAIT UNTIL STREAM CONNECTS
      if (!chatClient.userID) return;

      try {
        const channels = await chatClient.queryChannels(
          {
            type: "messaging",
            members: {
              $in: [chatClient.userID],
            },
          },
          {
            last_message_at: -1,
          },
          {
            watch: true,
            state: true,
          },
        );

        setRecentChannels(channels);

        clearInterval(interval);
      } catch (error) {
        console.log(error);
      }
    };

    // CHECK EVERY SECOND
    interval = setInterval(() => {
      loadRecentMessages();
    }, 1000);

    chatClient.on("message.new", loadRecentMessages);

    return () => {
      clearInterval(interval);

      chatClient.off("message.new", loadRecentMessages);
    };
  }, []);

  return (
    <>

      {/* SIDEBAR */}

      <aside
        className={` fixed top-0 left-0  h-[calc(100dvh-65px)] pb-10 w-72 bg-base-200 z-50 transition-transform duration-300
                ${isMessagesOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:sticky lg:h-screen lg:pb-0 lg:top-0 lg:w-64 border-r
                 border-base-300 flex flex-col`}
      >
        <div className="p-5 border-b border-base-300">
          <Link to="/" className="flex items-center gap-2.5">
            <Rss className="size-9 text-primary" />
            <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary  tracking-wider">
              LiveMeet
            </span>
          </Link>
        </div>

        <nav className="flex-1 p-4 flex flex-col min-h-0">
          <div className="hidden lg:block">
            <Link
              to="/"
              className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
                currentPath === "/" ? "btn-active" : ""
              }`}
            >
              <HomeIcon className="size-5 text-base-content opacity-70" />
              <span>Home</span>
            </Link>

            <Link
              to="/friends"
              className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
                currentPath === "/friends" ? "btn-active" : ""
              }`}
            >
              <UsersIcon className="size-5 text-base-content opacity-70" />
              <span>Friends</span>
            </Link>

            <Link
              to="/notifications"
              className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case relative ${
                currentPath === "/notifications" ? "btn-active" : ""
              }`}
            >
              <div className="relative">
                <BellIcon className="size-5 text-base-content opacity-70" />

                {/* RED DOT */}
                {hasNotifications && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    {/* PING */}
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>

                    {/* DOT */}
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border border-base-200"></span>
                  </span>
                )}
              </div>

              <span>Notifications</span>
            </Link>
          </div>

          {/* RECENT MESSAGES */}

          <div className="mt-6 flex-1 flex flex-col min-h-0">
            <h3 className="font-semibold text-sm opacity-70 mb-3">
              Recent Messages
            </h3>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {recentChannels.map((channel) => {
                const member = Object.values(channel.state.members).find(
                  (m) => m.user.id !== chatClient.userID,
                );

                const otherUser = member?.user;

                const lastMessage =
                  channel.state.messages[channel.state.messages.length - 1];

                const unreadCount = channel.countUnread();

                return (
                  <Link
                    key={channel.id}
                    to={`/chat/${otherUser?.id}`}
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-base-300 transition"
                  >
                    {/* PROFILE IMAGE */}

                    <div className="relative">
                      <img
                        src={otherUser?.image}
                        alt=""
                        className="w-11 h-11 rounded-full object-cover"
                      />

                      {/* ONLINE OFFLINE */}

                      <span
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-base-200 ${
                          otherUser?.online ? "bg-green-500" : "bg-gray-400"
                        }`}
                      />
                    </div>

                    {/* MESSAGE INFO */}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-medium truncate">
                          {otherUser?.name}
                        </h4>

                        {/* UNREAD BADGE */}

                        {unreadCount > 0 && (
                          <span className="bg-primary text-white text-[10px] min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1">
                            {unreadCount}
                          </span>
                        )}
                      </div>

                      {/* LAST MESSAGE */}

                      <p className="text-xs opacity-70 truncate">
                        {lastMessage?.user?.id === chatClient.userID
                          ? "You: "
                          : ""}

                        {lastMessage?.text || "No messages"}
                      </p>

                      {/* MESSAGE TIME */}

                      <p className="text-[10px] opacity-50 mt-0.5">
                        {lastMessage?.created_at
                          ? formatDistanceToNow(
                              new Date(lastMessage.created_at),
                              {
                                addSuffix: true,
                              },
                            )
                          : ""}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>

        

        {/* USER PROFILE SECTION */}
        {/* <div className="p-4 border-t border-base-300 mt-auto absolute bottom-0">
          <div className="flex items-center gap-3">
            <div className="avatar">
              <div className="w-10 rounded-full">
                <img src={authUser?.profilePic} alt="User Avatar" />
              </div>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">{authUser?.fullName}</p>
              <p className="text-xs text-success flex items-center gap-1">
                <span className="size-2 rounded-full bg-success inline-block" />
                Online
              </p>
            </div>
          </div>
        </div> */}
      </aside>

      {/* MOBILE BOTTOM NAV */}

<div className="lg:hidden fixed bottom-0 left-0 w-full h-16 bg-base-200 border-t border-base-300 flex items-center justify-around z-50">

  {/* HOME */}
  <Link
    to="/"
    className={`flex flex-col items-center text-xs ${
      currentPath === "/"
        ? "text-primary"
        : "opacity-70"
    }`}
  >
    <HomeIcon className="size-6" />
    <span>Home</span>
  </Link>

  {/* FRIENDS */}
  <Link
    to="/friends"
    className={`flex flex-col items-center text-xs ${
      currentPath === "/friends"
        ? "text-primary"
        : "opacity-70"
    }`}
  >
    <UsersIcon className="size-6" />
    <span>Friends</span>
  </Link>

  {/* MESSAGES */}
  <button
    onClick={() =>
      setIsMessagesOpen((prev) => !prev)
    }
    className={`relative flex flex-col items-center text-xs ${
      isMessagesOpen
        ? "text-primary"
        : "opacity-70"
    }`}
  >

    <MessageCircle className="size-6" />

    {totalUnreadMessages > 0 && (
      <span className="absolute -top-1 right-0 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">
        {totalUnreadMessages > 99
          ? "99+"
          : totalUnreadMessages}
      </span>
    )}

    <span>Messages</span>

  </button>

</div>

    </>
  );
};
export default Sidebar;
