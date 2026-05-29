import { useState } from "react";
import { useNavigate } from "react-router";
import useAuthUser from "../hooks/useAuthUser.js";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProfile } from "../lib/api.js";
import toast from "react-hot-toast";
import { LANGUAGES } from "../constants/index.js";

const EditProfilePage = () => {
  const { authUser } = useAuthUser();

  const queryClient = useQueryClient();

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: authUser?.fullName || "",
    bio: authUser?.bio || "",
    nativeLanguage: authUser?.nativeLanguage || "",
    learningLanguage: authUser?.learningLanguage || "",
    location: authUser?.location || "",
    profilePic: authUser?.profilePic || "",
  });

  const { mutate, isPending } = useMutation({
    mutationFn: updateProfile,

    onSuccess: () => {
      toast.success("Profile updated");

      navigate("/");

      queryClient.invalidateQueries({
        queryKey: ["authUser"],
      });
    },

    onError: () => {
      toast.error("Update failed");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    mutate(formData);
  };

  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center px-4 py-8 pb-24 lg:pb-0">
      <div className="w-full max-w-4xl bg-base-200 rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* LEFT SIDE */}
        <div className="bg-gradient-to-br from-primary to-secondary p-8 flex flex-col items-center justify-center text-white">
          <div className="avatar mb-5">
            <div className="w-32 rounded-full ring ring-white ring-offset-base-100 ring-offset-2">
              <img src={formData.profilePic} alt="Profile" />
            </div>
          </div>

          <h2 className="text-3xl font-bold text-center">Edit Your Profile</h2>

          <p className="mt-3 text-center opacity-90">
            Keep your profile updated so friends can know you better.
          </p>
        </div>

        {/* RIGHT SIDE */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
          <div>
            <label className="label">
              <span className="label-text font-medium">Full Name</span>
            </label>

            <input
              type="text"
              className="input input-bordered w-full"
              value={formData.fullName}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  fullName: e.target.value,
                })
              }
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text font-medium">Bio</span>
            </label>

            <textarea
              className="textarea textarea-bordered w-full h-24 resize-none"
              maxLength={150}
              value={formData.bio}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  bio: e.target.value,
                })
              }
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">
                <span className="label-text font-medium">Native Language</span>
              </label>

              <select
                className="select select-bordered w-full"
                value={formData.nativeLanguage}
                onChange={(e) =>
                  setFormData({ ...formData, nativeLanguage: e.target.value })
                }
              >
                <option value="">{formData.nativeLanguage}</option>

                {LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">
                <span className="label-text font-medium">
                  Learning Language
                </span>
              </label>

              <select
                className="select select-bordered w-full"
                value={formData.learningLanguage}
                onChange={(e) =>
                  setFormData({ ...formData, learningLanguage: e.target.value })
                }
              >
                <option value="">{formData.learningLanguage}</option>

                {LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label">
              <span className="label-text font-medium">Location</span>
            </label>

            <input
              type="text"
              className="input input-bordered w-full"
              value={formData.location}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  location: e.target.value,
                })
              }
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full mt-4"
            disabled={isPending}
          >
            {isPending ? "Updating..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProfilePage;
