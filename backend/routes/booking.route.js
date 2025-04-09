import express from "express";
import {
  bookPackage,
  bookService,
  cancelBooking,
  deleteBookingHistory,
  getAllBookings,
  getAllUserBookings,
  getCurrentBookings,
  getUserCurrentBookings,
  getAgencyBookings,
} from "../controllers/booking.controller.js";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Support both frontend endpoints (legacy and new checkout flow)
router.post("/create", requireSignIn, bookPackage);
router.post("/book-package/:packageId", requireSignIn, bookPackage);

// NEW: Book independent services
router.post("/book-service", requireSignIn, bookService);

// Get all current bookings admin
router.get("/get-currentBookings", requireSignIn, isAdmin, getCurrentBookings);

// Get all bookings admin
router.get("/get-allBookings", requireSignIn, isAdmin, getAllBookings);

// Get specific agency bookings (No isAdmin check required, just requireSignIn)
router.get("/get-agency-bookings", requireSignIn, getAgencyBookings);

// Get all current bookings by user id
router.get("/get-UserCurrentBookings/:id", requireSignIn, getUserCurrentBookings);

// Get all bookings by user id
router.get("/get-allUserBookings/:id", requireSignIn, getAllUserBookings);

// Delete history of booking
router.delete("/delete-booking-history/:id/:userId", requireSignIn, deleteBookingHistory);

// Cancel booking by id 
router.post("/cancel-booking/:id/:userId", requireSignIn, cancelBooking);

export default router;