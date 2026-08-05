import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import {
  addPost,
  countPosts,
  deletePost,
  deletePostDetail,
  getPost,
  getPosts,
  getPostStats,
  updatePost,
  updatePostDetails,
} from "../controllers/post.controller.js";

const router = express.Router();

router.get("/count", countPosts)
router.get("/stats", verifyToken, getPostStats);
router.get("/", getPosts);
router.get("/:id", getPost);
router.post("/", verifyToken, addPost);
// router.put("/:id", verifyToken, updatePost);
router.put("/:id", verifyToken, updatePostDetails);
// router.delete("/:id", verifyToken, deletePost);
router.delete("/:id", verifyToken, deletePostDetail);


export default router;
