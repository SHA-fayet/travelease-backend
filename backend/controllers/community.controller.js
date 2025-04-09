import Post from "../models/post.model.js";
import Comment from "../models/comment.model.js";

// Fetch all posts with their authors and comment counts
export const getPosts = async (req, res) => {
  try {
    const { type, destination } = req.query;
    let query = {};
    if (type) query.type = type;
    if (destination) query.destination = { $regex: destination, $options: "i" };

    const posts = await Post.find(query)
      .populate("author", "username avatar lookingForPartner")
      .sort({ createdAt: -1 });

    const postsWithCounts = await Promise.all(posts.map(async (post) => {
      const commentCount = await Comment.countDocuments({ post: post._id });
      return { ...post.toObject(), commentCount };
    }));

    res.status(200).send({ success: true, posts: postsWithCounts });
  } catch (error) {
    res.status(500).send({ success: false, message: "Error fetching posts" });
  }
};

// Create a new post
export const createPost = async (req, res) => {
  try {
    const authorId = req.user?.id || req.user?._id;
    const { type, title, content, destination } = req.body;
    let image = req.file ? req.file.filename : "";

    const newPost = await Post.create({ author: authorId, type, title, content, destination, image });
    res.status(201).send({ success: true, post: newPost });
  } catch (error) {
    res.status(500).send({ success: false, message: "Error creating post" });
  }
};

// Toggle Like
export const toggleLike = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).send({ success: false, message: "Post not found" });

    const isLiked = post.likes.includes(userId);
    if (isLiked) {
      post.likes = post.likes.filter(id => id.toString() !== userId.toString());
    } else {
      post.likes.push(userId);
    }
    
    await post.save();
    res.status(200).send({ success: true, likes: post.likes.length });
  } catch (error) {
    res.status(500).send({ success: false, message: "Error liking post" });
  }
};

// Add a comment
export const addComment = async (req, res) => {
  try {
    const authorId = req.user?.id || req.user?._id;
    const { text } = req.body;
    const newComment = await Comment.create({ post: req.params.postId, author: authorId, text });
    
    const populatedComment = await newComment.populate("author", "username avatar");
    res.status(201).send({ success: true, comment: populatedComment });
  } catch (error) {
    res.status(500).send({ success: false, message: "Error adding comment" });
  }
};

// Get comments for a post
export const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .populate("author", "username avatar")
      .sort({ createdAt: 1 });
    res.status(200).send({ success: true, comments });
  } catch (error) {
    res.status(500).send({ success: false, message: "Error fetching comments" });
  }
};