import { useEffect, useState } from "react";
import { useParams } from "react-router";
import useAuthUser from "../hooks/useAuthUser.js";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../lib/api.js";
import { chatClient } from "../lib/stream.js";

import {
  Channel,
  ChannelHeader,
  Chat,
  MessageComposer,
  MessageList,
  Thread,
  Window,
} from "stream-chat-react";
// import { StreamChat } from "stream-chat";
import toast from "react-hot-toast";

import ChatLoader from "../components/ChatLoader.jsx";
import CallButton from "../components/CallButton.jsx";

// const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const ChatPage = () => {
  const { id: targetUserId } = useParams();

  const [clientReady, setClientReady] = useState(false);
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);

  const { authUser } = useAuthUser();

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser, // this will run only when authUser is available
  });

  useEffect(() => {
    const initChat = async () => {
      if (!tokenData?.token || !authUser) return;

      try {
        // CONNECT ONLY ONCE
        // if (!chatClient.userID) {

        //   await chatClient.connectUser(
        //     {
        //       id: authUser._id,
        //       name: authUser.fullName,
        //       image: authUser.profilePic,
        //     },
        //     tokenData.token
        //   );

        // }

        const channelId = [authUser._id, targetUserId].sort().join("-");

        const currChannel = chatClient.channel("messaging", channelId, {
          members: [authUser._id, targetUserId],
        });

        await currChannel.watch();

        // MARK AS READ
        await currChannel.markRead();

        setChannel(currChannel);

        setClientReady(true);
      } catch (error) {
        console.error(error);

        toast.error("Could not connect to chat");
      } finally {
        setLoading(false);
      }
    };

    initChat();
  }, [tokenData, authUser, targetUserId]);

  const handleVideoCall = () => {
    if (channel) {
      const callUrl = `${window.location.origin}/call/${channel.id}`;

      channel.sendMessage({
        text: `I've started a video call. Join me here: ${callUrl}`,
      });

      toast.success("Video call link sent successfully!");
    }
  };

  if (loading || !clientReady || !channel) return <ChatLoader />;

  return (
    <div className="h-[calc(100dvh-64px)] bg-base-200">
      <Chat client={chatClient}>
        <Channel channel={channel}>
          <div className="w-full">
            <CallButton handleVideoCall={handleVideoCall} />
            <Window>
              <ChannelHeader />
              <MessageList />
              <MessageComposer focus />
            </Window>
          </div>
          <Thread />
        </Channel>
      </Chat>
    </div>
  );
};
export default ChatPage;
