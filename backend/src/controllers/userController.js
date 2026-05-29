import FriendRequest from "../models/friendRequest.js";
import User from "../models/User.js";

export async function getRecommendedUser(req, res) {
  try {
    const currentUserId = req.user.id;
    const currentUser = req.user;

    const recommendedUser =
      await User.aggregate([

        {
          $match: {
            _id: {
              $nin: [
                ...currentUser.friends,
                currentUserId,
              ],
            },

            isOnboarded: true,
          },
        },

        {
          $addFields: {
            random: {
              $rand: {},
            },
          },
        },

        {
          $sort: {
            random: 1,
          },
        },

      ]);
    res.status(200).json(recommendedUser);
  } catch (err) {
    console.log("Error in getRecommendedUser controller", err.message);
    res.status(500).json({ message: "Internel Server Error" });
  }
}

export async function getMyFriends(req, res) {
  try {
    const user = await User.findById(req.user.id)
      .select("friends")
      .populate(
        "friends",
        "fullName profilePic nativeLanguage learningLanguage",
      );

    res.status(200).json(user.friends);
  } catch (err) {
    console.log("Error in getMyFriends Controller", err.message);
    res.status(500).json({ message: "Internel Server Error" });
  }
}

export async function sendFriendRequest(req, res) {
  try {
    const myId = req.user.id;
    const { id: recipientId } = req.params;

    if (myId === recipientId)
      return res
        .status(400)
        .json({ message: "You can't send friend request to yourself" });

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: "User not found" });
    }

    if (recipient.friends.includes(myId)) {
      return res
        .status(400)
        .json({ message: "You are already friend with this user" });
    }

    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: myId, recipient: recipientId },
        { sender: recipientId, recipient: myId },
      ],
    });

    if (existingRequest) {
      return res
        .status(400)
        .json({ message: "You already send a friend request" });
    }

    const friendRequest = await FriendRequest.create({
      sender: myId,
      recipient: recipientId,
    });

    res.status(200).json(friendRequest);
  } catch (err) {
    console.log("Error in friendRequest Controller", err.message);
    console.log(err);
    res.status(500).json({ message: "Internel Server Error" });
  }
}

export async function acceptFriendRequest(req, res) {
  try {
    const { id: requestId } = req.params;

    const friendRequest = await FriendRequest.findById(requestId);

    if (!friendRequest) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    //verify the current user in recipient
    if (friendRequest.recipient.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You are not authorized to accept this request" });
    }

    friendRequest.status = "accepted";
    await friendRequest.save();

    //add each user to the other's friend s array
    //$addToSet : add element to an array only if they do not already exist

    await User.findByIdAndUpdate(friendRequest.sender, {
      $addToSet: { friends: friendRequest.recipient },
    });
    await User.findByIdAndUpdate(friendRequest.recipient, {
      $addToSet: { friends: friendRequest.sender },
    });

    res.status(200).json({ message: "Friend request accepted" });
  } catch (err) {
    console.log("Error in acceptFriendRequest Controller");
    res.status(500).json({ message: "Internel Server Error" });
  }
}

export async function getFriendRequests(req, res) {
  try {
    const incomingReqs = await FriendRequest.find({
      recipient: req.user.id,
      status: "pending",
    }).populate(
      "sender",
      "fullName profilePic nativeLanguage learningLanguage",
    );

    const acceptedReqs = await FriendRequest.find({
      sender: req.user.id,
      status: "accepted",
    }).populate("recipient", "fullName profilePic");

    res.status(200).json({ incomingReqs, acceptedReqs });
  } catch (err) {
    console.log("Error in getFriendRequests Controller", err.message);
    console.log(err);
    res.status(500).json({ message: "Internel Server Error" });
  }
}

export async function getOutgoingFrinedReqs(req, res) {
  try {
    const outgoingRequests = await FriendRequest.find({
      sender: req.user.id,
      status: "pending",
    }).populate(
      "recipient",
      "fullName profilePic nativeLanguage learningLanguage",
    );

    res.status(200).json(outgoingRequests);
  } catch (err) {
    console.log("Error in getOutgoingFriendReqs Controller", err.message);
    res.status(500).json({ message: "Internel Server Error" });
  }
}

export const searchUsers = async (req, res) => {
  try {
    const query = req.query.query;

    // CHECK EMPTY QUERY
    if (!query) {
      return res.status(400).json({
        message: "Search query required",
      });
    }

    // SEARCH ONLY BY NAME
    const users = await User.find({
      $and: [
        // SEARCH BY NAME
        {
          fullName: {
            $regex: query,
            $options: "i",
          },
        },

        // EXCLUDE LOGGED IN USER
        {
          _id: {
            $ne: req.user._id,
          },
        },
      ],
    })
      .select("-password")
      .limit(10);

    res.status(200).json(users);
  } catch (error) {
    console.log("Search users error", error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    const {
      fullName,
      bio,
      nativeLanguage,
      learningLanguage,
      location,
      profilePic,
    } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        fullName,
        bio,
        nativeLanguage,
        learningLanguage,
        location,
        profilePic,
      },
      { new: true },
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

export const unfriendUser = async (req, res) => {
  try {
    const { id: targetUserId } = req.params;

    const userId = req.user._id;

    // REMOVE FRIENDS

    await User.findByIdAndUpdate(userId, {
      $pull: {
        friends: targetUserId,
      },
    });

    await User.findByIdAndUpdate(targetUserId, {
      $pull: {
        friends: userId,
      },
    });

    // DELETE OLD REQUESTS

    await FriendRequest.deleteMany({
      $or: [
        {
          sender: userId,
          recipient: targetUserId,
        },

        {
          sender: targetUserId,
          recipient: userId,
        },
      ],
    });

    res.status(200).json({
      message: "Friend removed",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
