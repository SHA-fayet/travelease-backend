import mongoose from "mongoose";
import dotenv from "dotenv";
import Post from "./models/post.model.js";
import Comment from "./models/comment.model.js";
import User from "./models/user.model.js";

dotenv.config();

const seedCommunity = async () => {
  try {
    console.log("Connecting to MongoDB...");
    const dbUri = process.env.MONGO_URL || process.env.MONGO || process.env.DATABASE_URL;
    
    if (!dbUri) {
      console.error("❌ ERROR: Could not find MongoDB URL in .env file.");
      process.exit(1);
    }
    await mongoose.connect(dbUri);
    console.log("Connected successfully!");

    // Fetch a couple of existing users to act as authors
    const users = await User.find().limit(2);
    
    if (users.length === 0) {
      console.error("❌ No users found in the database. Please register at least one user first.");
      process.exit(1);
    }

    const user1 = users[0]._id;
    const user2 = users.length > 1 ? users[1]._id : users[0]._id; // Fallback to user1 if only 1 user exists

    console.log("Creating dummy posts...");

    const postsData = [
      {
        author: user1,
        type: "Diary",
        title: "Chasing Clouds in Sajek Valley",
        content: "Just returned from an amazing 3-day trip to Sajek! The early morning view of the clouds covering the hills was breathtaking. Highly recommend trying the local bamboo chicken.",
        destination: "Sajek Valley",
        image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=90",
        likes: [user2]
      },
      {
        author: user2,
        type: "PartnerRequest",
        title: "Looking for a trekking partner for Keokradong",
        content: "Planning to summit Keokradong next month around the 15th. I have done some moderate treks before but would love to go with someone who has experience in Bandarban. Let me know if you are interested!",
        destination: "Bandarban",
        image: "",
        likes: []
      },
      {
        author: user1,
        type: "Diary",
        title: "A misty morning in Srimangal",
        content: "Visited the tea capitals of Bangladesh. Cycling through the trails of the tea gardens during the misty morning was the highlight of the trip. The 7-layer tea at Nilkantha is a must-try, even if just for the novelty.",
        destination: "Sylhet",
        image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=90",
        likes: [user1, user2]
      },
      {
        author: user2,
        type: "PartnerRequest",
        title: "Backpacking through the Sundarbans",
        content: "I want to arrange a small group of 4-5 people to hire a private boat and explore the deep canals of the Sundarbans for 3 days. Splitting the cost will make it super affordable for all of us.",
        destination: "Sundarbans",
        image: "",
        likes: [user1]
      }
    ];

    const insertedPosts = await Post.insertMany(postsData);
    console.log("✅ Dummy posts inserted!");

    console.log("Creating dummy comments...");
    const commentsData = [
      {
        post: insertedPosts[0]._id, // Comment on first post
        author: user2,
        text: "Wow, that looks incredible! Did you stay in a resort or a local cottage?"
      },
      {
        post: insertedPosts[1]._id, // Comment on second post
        author: user1,
        text: "I did the Keokradong trek last year! DM me, I can share my guide's contact info."
      }
    ];

    await Comment.insertMany(commentsData);
    console.log("✅ Dummy comments inserted!");

    console.log("🎉 Community database successfully enriched!");
    process.exit(0);

  } catch (error) {
    console.error("❌ Error seeding community database:", error);
    process.exit(1);
  }
};

seedCommunity();