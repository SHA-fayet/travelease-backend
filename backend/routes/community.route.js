import express from "express";
import { requireSignIn } from "../middlewares/authMiddleware.js";
import { getPosts, createPost, toggleLike, addComment, getComments } from "../controllers/community.controller.js";
import upload from "../middlewares/multer.js";

const router = express.Router();

router.get("/posts", getPosts);
router.post("/posts/create", requireSignIn, upload.single("image"), createPost);
router.put("/posts/:id/like", requireSignIn, toggleLike);
router.get("/posts/:postId/comments", getComments);
router.post("/posts/:postId/comments", requireSignIn, addComment);

export default router;