import { Link } from "react-router";
import { motion } from "framer-motion";
import { LANGUAGE_TO_FLAG } from "../constants/index.js";
import { unfriendUser } from "../lib/api.js";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

const FriendCard = ({ friend, index, setFriendsList }) => {
  const queryClient = useQueryClient();

  const { mutate: unfriendMutation } = useMutation({
    mutationFn: async (userId) => {
      await unfriendUser(userId);

      return userId;
    },

    onSuccess: (_, userId) => {
      toast.success("Friend removed");

      queryClient.setQueryData(["friends"], (oldFriends = []) =>
        oldFriends.filter((friend) => friend._id !== userId),
      );
    },

    onError: () => {
      toast.error("Something went wrong");
    },
  });

  return (
    <motion.div
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
      className=" relative overflow-hidden transform-gpu rounded-3xl bg-white/90 dark:bg-base-200/80 border border-black/5   dark:border-white/10 backdrop-blur-md
        shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-1 transition-all duration-300 group "
    >
      {/* Animated Gradient Border */}

      <div
        className=" absolute inset-0 rounded-3xl p-[1px] bg-gradient-to-br from-primary/30 via-transparent to-secondary/30 opacity-0 group-hover:opacity-100 transition-opacity
          duration-500 "
      />

      {/* Premium Glow */}
      <div
        className="   absolute inset-0 bg-gradient-to-br from-primary/10 via-white/5 to-secondary/10 opacity-0 group-hover:opacity-100 
      transition-all duration-500 "
      />

      {/* Top Light */}
      <div className=" absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/60   to-transparent " />

      <div className="card-body p-5 space-y-4 relative z-10">
        <div className="dropdown dropdown-end absolute top-3 right-3 z-20">
          <div
            tabIndex={0}
            role="button"
            className="btn btn-ghost btn-sm btn-circle"
          >
            ⋮
          </div>

          <ul
            tabIndex={0}
            className=" dropdown-content menu bg-base-200 rounded-box w-40 p-2 shadow border border-base-300 "
          >
            <li>
              <button
                onClick={() => unfriendMutation(friend._id)}
                className="text-red-500"
              >
                Unfollow
              </button>
            </li>
          </ul>
        </div>

        {/* USER INFO */}
        <div className="flex items-center gap-4">
          <div className="   avatar ring ring-primary/30 ring-offset-base-100 ring-offset-2 rounded-full">
            <div className="w-16 rounded-full">
              <img
                src={friend.profilePic}
                alt={friend.fullName}
                className="object-cover"
              />
            </div>
          </div>

          <div>
            <h3 className="font-bold text-xl">{friend.fullName}</h3>
          </div>
        </div>

        {/* LANGUAGES */}
        <div className="flex flex-wrap gap-2">
          <span className="badge badge-primary badge-lg">
            {getLanguageFlag(friend.nativeLanguage)}
            Native: {friend.nativeLanguage}
          </span>

          <span className="badge badge-outline badge-lg">
            {getLanguageFlag(friend.learningLanguage)}
            Learning: {friend.learningLanguage}
          </span>
        </div>

        {/* BUTTON */}
        <Link
          to={`/chat/${friend._id}`}
          className="  btn  btn-primary rounded-2xl  w-full  hover:scale-[1.02]  hover:shadow-lg  hover:shadow-primary/30  transition-all "
        >
          Message
        </Link>
      </div>

      {/* Shine Effect */}
      <div
        className="  absolute  top-0  -left-full  w-[120%]  h-full  bg-gradient-to-r  from-transparent  via-white/20  to-transparent  rotate-12
          group-hover:left-full transition-all   duration-700 "
      />
    </motion.div>
  );
};

export default FriendCard;

export function getLanguageFlag(language) {
  if (!language) return null;

  const langLower = language.toLowerCase();
  const countryCode = LANGUAGE_TO_FLAG[langLower];

  if (countryCode) {
    return (
      <img
        src={`https://flagcdn.com/24x18/${countryCode}.png`}
        alt={`${langLower} flag`}
        className="h-3 mr-1 inline-block"
      />
    );
  }

  return null;
}
