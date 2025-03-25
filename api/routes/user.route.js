import express from "express";
import {
  deleteUser,
  getUser,
  getUsers,
  updateUser,
  getSavedPosts,
  savePost,
  profilePosts,
  getNotificationNumber,
  totalUsers,
  deleteSavedPost,
  usersWithPosts,
  getUserStats,
  getLandlordStats,
} from "../controllers/user.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/count", verifyToken, totalUsers);
router.get("/landlords", verifyToken, usersWithPosts);
router.get("/stats", verifyToken, getUserStats);
router.get("/landlord-stats", verifyToken, getLandlordStats);
router.get("/saved", verifyToken, getSavedPosts);
router.get("/profilePosts", verifyToken, profilePosts);
router.get("/notification", verifyToken, getNotificationNumber);
router.get("/", verifyToken, getUsers);
router.get("/:id", verifyToken, getUser);
// router.get("/search/:id", verifyToken, getUser);
router.put("/:id", verifyToken, updateUser);
router.delete("/:id", verifyToken, deleteUser);
router.post("/save", verifyToken, savePost);
router.delete("/unsave/:postId", verifyToken, deleteSavedPost);

export default router;
