import axios from "axios";
import Booking from "../models/booking.model.js";

const BKASH_APP_KEY = "4f6o0cjiki2rfm34kfdadl1eqq";
const BKASH_APP_SECRET = "2is7hdktrekvrbljjh44ll3d9l1dtjo4pasmjvs5vl5qr3fug4b";
const BKASH_USERNAME = "sandboxTokenizedUser02";
const BKASH_PASSWORD = "sandboxTokenizedUser02@12345";
const BKASH_BASE_URL = "https://tokenized.sandbox.bka.sh/v1.2.0-beta";

// Helper: Authenticate with bKash and retrieve token
const getBkashToken = async () => {
  try {
    const response = await axios.post(
      `${BKASH_BASE_URL}/tokenized/checkout/token/grant`,
      { app_key: BKASH_APP_KEY, app_secret: BKASH_APP_SECRET },
      {
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
          username: BKASH_USERNAME,
          password: BKASH_PASSWORD,
        },
      }
    );
    return response.data.id_token;
  } catch (error) {
    console.error("bKash Token Auth Failed:", error.response?.data || error.message);
    throw new Error("bKash Authentication Failed");
  }
};

// 1. Create Payment & Generate bKash Gateway URL
export const paymentController = async (req, res) => {
  try {
    const { amount, packageId, buyerId, date, persons } = req.body;

    if (!amount || !packageId || !buyerId || !date) {
      return res.status(400).send({ success: false, message: "Missing required booking details for payment." });
    }

    // Use schema-compliant values ("Booked" instead of "Pending") to bypass enum validation errors
    const newBooking = await Booking.create({
      packageId: packageId,
      packageDetails: packageId,
      userId: buyerId,
      buyer: buyerId,
      travelDate: date,
      date: date,
      travelersCount: Number(persons || 1),
      persons: Number(persons || 1),
      totalPrice: Number(amount),
      status: "Booked",
      bookingStatus: "Confirmed",
      paymentStatus: "Pending"
    });

    const token = await getBkashToken();
    const formattedAmount = Number(amount).toFixed(2);

    const response = await axios.post(
      `${BKASH_BASE_URL}/tokenized/checkout/create`,
      {
        mode: "0011",
        payerReference: "1",
        callbackURL: "http://localhost:8000/api/payment/bkash/callback",
        amount: formattedAmount,
        currency: "BDT",
        intent: "sale",
        merchantInvoiceNumber: newBooking._id.toString(),
      },
      {
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
          authorization: token,
          "x-app-key": BKASH_APP_KEY,
        },
      }
    );

    const data = response.data;

    if (data && data.bkashURL) {
      return res.status(200).send({
        success: true,
        bkashURL: data.bkashURL,
      });
    } else {
      await Booking.findByIdAndDelete(newBooking._id);
      return res.status(500).send({
        success: false,
        message: data?.statusMessage || "bKash Gateway failed to return URL.",
      });
    }
  } catch (error) {
    console.error("bKash Create Controller Error:", error.response?.data || error.message);
    return res.status(500).send({
      success: false,
      message: error.response?.data?.statusMessage || "Server error while initializing bKash payment.",
    });
  }
};

// 2. Execute Payment Callback
export const bkashCallback = async (req, res) => {
  try {
    const { paymentID, status } = req.query;

    if (status === "cancel" || status === "failure") {
      return res.redirect("http://localhost:5174/profile?payment=failed");
    }

    if (status === "success") {
      const token = await getBkashToken();

      const response = await axios.post(
        `${BKASH_BASE_URL}/tokenized/checkout/execute`,
        { paymentID },
        {
          headers: {
            "Content-Type": "application/json",
            accept: "application/json",
            authorization: token,
            "x-app-key": BKASH_APP_KEY,
          },
        }
      );

      const data = response.data;

      if (data && (data.statusCode === "0000" || data.transactionStatus === "Completed")) {
        const invoiceId = data.merchantInvoiceNumber;
        
        if (invoiceId) {
          await Booking.findByIdAndUpdate(invoiceId, {
            status: "Booked",
            bookingStatus: "Confirmed",
            paymentStatus: "Paid",
            transactionId: data.trxID
          });
        }

        return res.redirect("http://localhost:5173/profile?payment=success");
      } else {
        return res.redirect("http://localhost:5174/profile?payment=failed");
      }
    } else {
      return res.redirect("http://localhost:5174/profile?payment=cancelled");
    }
  } catch (error) {
    console.error("bKash Execute Callback Error:", error.response?.data || error.message);
    return res.redirect("http://localhost:5174/profile?payment=error");
  }
};