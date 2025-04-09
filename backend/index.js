import dotenv from "dotenv";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import cookieParser from "cookie-parser";
import aiRoute from "./routes/ai.route.js";
dotenv.config();

import { connectDB } from "./config/connectDB.js";
import authRoute from "./routes/auth.route.js";
import userRoute from "./routes/user.route.js";
import packageRoute from "./routes/package.route.js";
import ratingRoute from "./routes/rating.route.js";
import bookingRoute from "./routes/booking.route.js";
import paymentRoutes from "./routes/payment.routes.js";
import adminRoute from "./routes/admin.route.js";
import chatbotRouter from "./routes/chatbot.route.js";
import serviceRoute from "./routes/service.route.js"; 
import communityRoute from "./routes/community.route.js"; // <-- NEW

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
connectDB();

app.use(cors({ origin: ["http://localhost:5173", "http://localhost:5174"], credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use("/images", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoute);
app.use("/api/user", userRoute);
app.use("/api/package", packageRoute);
app.use("/api/rating", ratingRoute);
app.use("/api/booking", bookingRoute);
app.use("/api/admin", adminRoute);
app.use("/api/payment", paymentRoutes); 
app.use("/api/chatbot", chatbotRouter);
app.use("/api/services", serviceRoute); 
app.use("/api/community", communityRoute); // <-- NEW
app.use("/api/ai", aiRoute); // <-- NEW
if (process.env.NODE_ENV_CUSTOM === "production") {
  app.use(express.static(path.join(__dirname, "/client/dist")));
  app.get("*", (req, res) => res.sendFile(path.join(__dirname, "client", "dist", "index.html")));
} else {
  app.get("/", (req, res) => res.send("Welcome to TravelEase API"));
}

const PORT = 8000;
app.listen(PORT, () => console.log(`listening on ${PORT}`));