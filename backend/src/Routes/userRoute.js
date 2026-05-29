import express from "express";
import { protectRoute } from "../middleware/authMiddleware.js";
import {
  acceptFriendRequest,
  getFriendRequests,
  getMyFriends,
  getOutgoingFrinedReqs,
  getRecommendedUser,
  searchUsers,
  sendFriendRequest,
  updateProfile,
  unfriendUser,
} from "../controllers/userController.js";

const router = express.Router();

router.use(protectRoute);

router.get("/", getRecommendedUser);
router.get("/friends", getMyFriends);

router.post("/friend-request/:id", sendFriendRequest);
router.put("/friend-request/:id/accept", acceptFriendRequest);

router.get("/friend-requests", getFriendRequests);
router.get("/outgoing-friend-requests", getOutgoingFrinedReqs);

router.get("/search", searchUsers);
router.put("/edit-profile", updateProfile);

router.delete(
  "/unfriend/:id",
  unfriendUser
);

export default router;
