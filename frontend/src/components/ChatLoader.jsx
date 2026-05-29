import { LoaderIcon } from "lucide-react";

function ChatLoader() {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100dvh-64px)] w-full p-4">
      <LoaderIcon className="animate-spin size-10 text-primary" />
      <p className="mt-4 text-center text-lg font-mono">Connecting to chat...</p>
    </div>
  );
}

export default ChatLoader;