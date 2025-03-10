import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import {
  addPost,
  deletePost,
  deletePostDetail,
  getPost,
  getPosts,
  updatePost,
  updatePostDetails,
} from "../controllers/post.controller.js";

const router = express.Router();

router.get("/", getPosts);
router.get("/:id", getPost);
router.post("/", verifyToken, addPost);
// router.put("/:id", verifyToken, updatePost);
router.put("/:id", verifyToken, updatePostDetails);
// router.delete("/:id", verifyToken, deletePost);
router.delete("/:id", verifyToken, deletePostDetail);

export default router;
