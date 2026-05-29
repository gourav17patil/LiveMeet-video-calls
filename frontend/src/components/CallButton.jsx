import { VideoIcon } from "lucide-react";

function CallButton({ handleVideoCall }) {
  return (
    <div className="p-3 border-b flex items-center justify-end max-w-7xl mx-auto w-full absolute top-2">
      <button onClick={handleVideoCall} className="btn btn-success btn-sm text-white">
        <VideoIcon className="size-8" />
      </button>
    </div>
  );
}

export default CallButton;