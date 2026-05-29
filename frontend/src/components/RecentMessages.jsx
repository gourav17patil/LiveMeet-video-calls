import { useEffect, useState } from "react";
import { Link } from "react-router";

import { chatClient } from "../lib/stream.js";

const RecentMessages = () => {

  const [channels, setChannels] = useState([]);

  useEffect(() => {

    const loadChannels = async () => {

      // WAIT UNTIL STREAM CONNECTS
      if (!chatClient.userID) return;

      try {

        const filters = {
          type: "messaging",
          members: {
            $in: [chatClient.userID],
          },
        };

        const sort = {
          last_message_at: -1,
        };

        const result = await chatClient.queryChannels(
          filters,
          sort,
          {
            watch: true,
            state: true,
          }
        );

        setChannels(result);

      } catch (error) {

        console.log(error);

      }

    };

    loadChannels();

    // AUTO REFRESH WHEN NEW MESSAGE ARRIVES
    chatClient.on("message.new", loadChannels);

    return () => {

      chatClient.off("message.new", loadChannels);

    };

  }, []);

  return (
    <div className="space-y-3">

      {channels.map((channel) => {

        const member = Object.values(
          channel.state.members
        ).find(
          (m) => m.user.id !== chatClient.userID
        );

        return (
          <Link
            key={channel.id}
            to={`/chat/${member?.user?.id}`}
            className="flex items-center gap-3 p-2 hover:bg-base-200 rounded-xl transition"
          >
            <img
              src={member?.user?.image}
              alt=""
              className="w-10 h-10 rounded-full"
            />

            <div className="flex-1 min-w-0">
              <h4 className="font-medium truncate">
                {member?.user?.name}
              </h4>

              <p className="text-xs opacity-70 truncate">
                {
                  channel.state.messages[
                    channel.state.messages.length - 1
                  ]?.text
                }
              </p>
            </div>
          </Link>
        );

      })}
    </div>
  );
};

export default RecentMessages;