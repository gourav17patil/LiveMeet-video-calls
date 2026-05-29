import { StreamChat } from "stream-chat";

const STREAM_API_KEY =
  import.meta.env.VITE_STREAM_API_KEY;

export const chatClient =
  StreamChat.getInstance(
    STREAM_API_KEY
  );