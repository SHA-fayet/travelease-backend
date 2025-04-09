import Booking from "../models/booking.model.js";
import Package from "../models/package.model.js";
import Hotel from "../models/hotel.model.js";
import Transportation from "../models/transportation.model.js";
import Guide from "../models/guide.model.js";
import User from "../models/user.model.js"; 
import mongoose from "mongoose";

// 1. Book Package
export const bookPackage = async (req, res) => {
  try {
    const packageRef = req.params.packageId || req.body.packageDetails || req.body.packageId;
    const bookingDate = req.body.date || req.body.travelDate;
    const totalPersons = Number(req.body.persons || req.body.travelersCount || 1);
    const buyerId = req.user?.id || req.user?._id;

    if (!packageRef || !buyerId || !bookingDate || !totalPersons) {
      return res.status(400).send({ success: false, message: "All fields are required!" });
    }

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const existingRecentBooking = await Booking.findOne({
      $or: [{ buyer: buyerId }, { userId: buyerId }],$or: [{ packageDetails: packageRef }, { packageId: packageRef }],
      createdAt: { $gt: fiveMinutesAgo }
    });

    if (existingRecentBooking) {
      return res.status(429).send({
        success: false,
        message: "You already initiated a booking for this tour. Wait 5 minutes before trying again.",
      });
    }

    const validPackage = await Package.findById(packageRef);
    if (!validPackage) return res.status(404).send({ success: false, message: "Package Not Found!" });

    const unitPrice = validPackage.packageOffer && validPackage.packageDiscountPrice > 0
        ? validPackage.packageDiscountPrice
        : validPackage.packagePrice;

    const calculatedTotalPrice = unitPrice * totalPersons;

    const newBooking = await Booking.create({
      packageId: packageRef,
      packageDetails: packageRef,
      userId: buyerId,
      buyer: buyerId,
      travelDate: bookingDate,
      date: bookingDate,
      travelersCount: totalPersons,
      persons: totalPersons,
      totalPrice: calculatedTotalPrice,
      status: "Booked",
      bookingStatus: "Confirmed",
      paymentStatus: "Paid"
    });

    if (newBooking) {
      return res.status(201).send({ success: true, message: "Package Booked Successfully!", booking: newBooking });
    } else {
      return res.status(500).send({ success: false, message: "Booking failed!" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send({ success: false, message: "Server error during booking." });
  }
};

// 2. Book Standalone Service (Hotel, Transport, Guide)
export const bookService = async (req, res) => {
  try {
    const { serviceId, itemType, serviceName, totalPrice, travelDate, persons } = req.body;
    const buyerId = req.user?.id || req.user?._id;

    if (!serviceId || !itemType || !buyerId || !travelDate) {
      return res.status(400).send({ success: false, message: "Missing required booking fields" });
    }

    const newBooking = await Booking.create({
      userId: buyerId,
      buyer: buyerId,
      itemType,
      serviceId,
      serviceName,
      travelDate,
      date: travelDate,
      travelersCount: persons || 1,
      persons: persons || 1,
      totalPrice,
      status: "Booked",
      bookingStatus: "Confirmed",
      paymentStatus: "Paid"
    });

    res.status(201).send({ success: true, message: `${itemType} booked successfully!`, booking: newBooking });
  } catch (error) {
    console.error("Service Booking Error:", error);
    res.status(500).send({ success: false, message: "Server error during booking" });
  }
};

// 3. Get current bookings for admin
export const getCurrentBookings = async (req, res) => {
  try {
    const searchTerm = req?.query?.searchTerm || "";
    const bookings = await Booking.find({
      $or: [{ date: {$gt: new Date().toISOString() } }, { travelDate: { $gt: new Date().toISOString() } }],$or: [{ status: "Booked" }, { bookingStatus: "Confirmed" }]
    })
      .populate({ path: "packageDetails", strictPopulate: false })
      .populate({ path: "packageId", strictPopulate: false })
      .populate({ path: "serviceId", strictPopulate: false }) // CRITICAL FIX
      .populate({ path: "buyer", strictPopulate: false, match: { $or: [{ username: { $regex: searchTerm,$options: "i" } }, { email: { $regex: searchTerm,$options: "i" } }] } })
      .sort({ createdAt: "asc" });

    let bookingsFiltered = bookings.filter((booking) => booking.buyer || booking.userId);
    return res.status(200).send(bookingsFiltered.length ? { success: true, bookings: bookingsFiltered } : { success: false, message: "No Bookings Available" });
  } catch (error) {
    res.status(500).send({ success: false });
  }
};

// 4. Get all bookings admin
export const getAllBookings = async (req, res) => {
  try {
    const searchTerm = req?.query?.searchTerm || "";
    const bookings = await Booking.find({})
      .populate({ path: "packageDetails", strictPopulate: false })
      .populate({ path: "packageId", strictPopulate: false })
      .populate({ path: "serviceId", strictPopulate: false }) // CRITICAL FIX
      .populate({ 
        path: "buyer", 
        strictPopulate: false, 
        match: { $or: [{ username: { $regex: searchTerm,$options: "i" } }, { email: { $regex: searchTerm,$options: "i" } }] } 
      })
      .populate({ path: "userId", strictPopulate: false }) 
      .populate({ path: "user", strictPopulate: false })
      .sort({ createdAt: "asc" });

    let bookingsFiltered = bookings.filter((booking) => booking.buyer || booking.userId || booking.user);
    
    return res.status(200).send(
      bookingsFiltered.length ? { success: true, bookings: bookingsFiltered } : { success: false, message: "No Bookings Available" }
    );
  } catch (error) {
    console.error("Fetch All Bookings Error:", error);
    res.status(500).send({ success: false });
  }
};

// 5. Get current bookings for user by id
export const getUserCurrentBookings = async (req, res) => {
  try {
    const authId = req.user?.id || req.user?._id;
    if (String(authId) !== String(req?.params?.id)) return res.status(401).send({ success: false, message: "Unauthorized request" });
    
    const searchTerm = req?.query?.searchTerm || "";
    const bookings = await Booking.find({
      $or: [{ buyer: new mongoose.Types.ObjectId(req.params.id) }, { userId: new mongoose.Types.ObjectId(req.params.id) }],
      $or: [{ date: {$gt: new Date().toISOString() } }, { travelDate: { $gt: new Date().toISOString() } }],$or: [{ status: "Booked" }, { bookingStatus: "Confirmed" }, { status: "Pending Payment" }, { status: "Cancellation Requested" }]
    })
      .populate({ path: "packageDetails", strictPopulate: false, match: { packageName: { $regex: searchTerm,$options: "i" } } })
      .populate({ path: "packageId", strictPopulate: false, match: { packageName: { $regex: searchTerm,$options: "i" } } })
      .populate({ path: "serviceId", strictPopulate: false }) // CRITICAL FIX
      .sort({ createdAt: "asc" });

    let bookingsFiltered = bookings.filter((booking) => booking.packageDetails || booking.packageId || booking.serviceId);
    return res.status(200).send(bookingsFiltered.length ? { success: true, bookings: bookingsFiltered } : { success: false, message: "No Bookings Available" });
  } catch (error) {
    res.status(500).send({ success: false });
  }
};

// 6. Get all bookings by user id
export const getAllUserBookings = async (req, res) => {
  try {
    const authId = req.user?.id || req.user?._id;
    if (String(authId) !== String(req?.params?.id)) return res.status(401).send({ success: false, message: "Unauthorized request" });
    
    const searchTerm = req?.query?.searchTerm || "";
    const bookings = await Booking.find({
      $or: [{ buyer: new mongoose.Types.ObjectId(req.params.id) }, { userId: new mongoose.Types.ObjectId(req.params.id) }]
    })
      .populate({ path: "packageDetails", strictPopulate: false, match: { packageName: { $regex: searchTerm,$options: "i" } } })
      .populate({ path: "packageId", strictPopulate: false, match: { packageName: { $regex: searchTerm,$options: "i" } } })
      .populate({ path: "serviceId", strictPopulate: false }) // CRITICAL FIX
      .sort({ createdAt: "asc" });

    let bookingsFiltered = bookings.filter((booking) => booking.packageDetails || booking.packageId || booking.serviceId);
    return res.status(200).send(bookingsFiltered.length ? { success: true, bookings: bookingsFiltered } : { success: false, message: "No Bookings Available" });
  } catch (error) {
    res.status(500).send({ success: false });
  }
};

// 7. Delete booking history
export const deleteBookingHistory = async (req, res) => {
  try {
    const authId = req.user?.id || req.user?._id;
    const requestingUser = await User.findById(authId);
    const isAdmin = requestingUser && requestingUser.user_role === 1;

    if (!isAdmin && String(authId) !== String(req?.params?.userId)) {
      return res.status(401).send({ success: false, message: "Unauthorized request" });
    }
    
    const deleteHistory = await Booking.findByIdAndDelete(req?.params?.id);
    return res.status(200).send(deleteHistory ? { success: true, message: "History Deleted!" } : { success: false, message: "Failed to delete" });
  } catch (error) {
    res.status(500).send({ success: false });
  }
};

// 8. Cancel Booking 
export const cancelBooking = async (req, res) => {
  try {
    const authId = req.user?.id || req.user?._id;
    const { reason } = req.body;
    
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).send({ success: false, message: "Booking not found" });

    const requestingUser = await User.findById(authId);
    const isAdmin = requestingUser && requestingUser.user_role === 1;

    if (isAdmin) {
      await Booking.findByIdAndUpdate(req.params.id, { 
        status: "Cancelled", 
        bookingStatus: "Cancelled",
        cancellationReason: reason || "Cancelled directly by Administrator"
      }, { strict: false }); 
      return res.status(200).send({ success: true, message: "Trip permanently cancelled by Admin." });
    }

    if (String(authId) !== String(req.params.userId)) {
      return res.status(401).send({ success: false, message: "Unauthorized request. You do not own this booking." });
    }

    if (!reason || reason.trim() === "") {
      return res.status(400).send({ success: false, message: "A cancellation reason is required." });
    }

    await Booking.findByIdAndUpdate(req.params.id, { 
      status: "Cancellation Requested", 
      cancellationReason: reason 
    }, { strict: false });

    return res.status(200).send({ success: true, message: "Cancellation request sent successfully." });
    
  } catch (error) {
    console.error("Cancel Booking Backend Error:", error);
    res.status(500).send({ success: false, message: "Server error during cancellation." });
  }
};

// 9. Get bookings exclusively for a specific agency's packages AND standalone services
export const getAgencyBookings = async (req, res) => {
  try {
    const agencyId = req.user?.id || req.user?._id;

    // 1. Get Packages
    const agencyPackages = await Package.find({ $or: [{ agencyId }, { userRef: agencyId }] }).select("_id");
    const packageIds = agencyPackages.map((pkg) => pkg._id);

    // 2. Get Standalone Services
    const agencyHotels = await Hotel.find({ agencyId }).select("_id");
    const agencyTransports = await Transportation.find({ agencyId }).select("_id");
    const agencyGuides = await Guide.find({ agencyId }).select("_id");
    
    const serviceIds = [
      ...agencyHotels.map(h => h._id),
      ...agencyTransports.map(t => t._id),
      ...agencyGuides.map(g => g._id)
    ];

    // 3. Find bookings matching either packageIds OR serviceIds
    const bookings = await Booking.find({
      $or: [
        { packageId: { $in: packageIds } },
        { packageDetails: { $in: packageIds } },
        { serviceId: { $in: serviceIds } }
      ]
    }).sort({ createdAt: -1 });

    res.status(200).send({
      success: true,
      bookings,
    });
  } catch (error) {
    console.error("Agency Booking Fetch Error:", error);
    res.status(500).send({ success: false, message: "Server error fetching agency bookings" });
  }
};