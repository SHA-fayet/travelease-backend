import express from "express";
import Booking from "../models/booking.model.js";

const router = express.Router();

const cleanEnv = (val) => val?.replace(/"/g, '')?.trim();

const authenticateBkash = async () => {
    try {
        const response = await fetch(`${cleanEnv(process.env.BKASH_BASE_URL)}/tokenized/checkout/token/grant`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "username": cleanEnv(process.env.BKASH_USERNAME),
                "password": cleanEnv(process.env.BKASH_PASSWORD),
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            },
            body: JSON.stringify({
                app_key: cleanEnv(process.env.BKASH_APP_KEY),
                app_secret: cleanEnv(process.env.BKASH_APP_SECRET),
            })
        });
        
        const responseText = await response.text();
        
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            console.error("bKash Raw Error (WAF Block):", responseText);
            throw new Error(`bKash Firewall blocked the request. Raw response: ${responseText.substring(0, 50)}`);
        }
        
        if (!response.ok || !data.id_token) {
            throw new Error(`Auth Failed: ${data.statusMessage || response.statusText}`);
        }
        return data.id_token;
    } catch (error) {
        console.error("bKash Auth Error:", error.message);
        throw new Error("bKash Authentication Failed");
    }
};

router.post("/create-payment", async (req, res) => {
    try {
        const { amount, packageId, buyerId, date, persons } = req.body;
        
        const token = await authenticateBkash();

        const response = await fetch(`${cleanEnv(process.env.BKASH_BASE_URL)}/tokenized/checkout/create`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": token,
                "X-APP-Key": cleanEnv(process.env.BKASH_APP_KEY),
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            },
            body: JSON.stringify({
                mode: "0011",
                payerReference: buyerId.toString(),
                callbackURL: `http://localhost:8000/api/payment/bkash-callback?packageId=${packageId}&buyerId=${buyerId}&date=${date}&persons=${persons}&amount=${amount}`,
                amount: amount.toString(),
                currency: "BDT",
                intent: "sale",
                merchantInvoiceNumber: "Inv" + Date.now()
            })
        });

        const responseText = await response.text();
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            throw new Error("Invalid JSON in create response");
        }

        if (data && data.bkashURL) {
            return res.status(200).json({ success: true, bkashURL: data.bkashURL });
        } else {
            return res.status(400).json({ success: false, message: data.statusMessage || "Failed to connect to bKash gateway" });
        }
    } catch (error) {
        console.error("bKash Gateway Error:", error);
        res.status(500).json({ success: false, message: "Payment connection failed." });
    }
});

router.get("/bkash-callback", async (req, res) => {
    const { paymentID, status, packageId, buyerId, date, persons, amount } = req.query;
    
    if (status === "success" || status === "0000") {
        try {
            const token = await authenticateBkash();
            
            const response = await fetch(`${cleanEnv(process.env.BKASH_BASE_URL)}/tokenized/checkout/execute`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Authorization": token,
                    "X-APP-Key": cleanEnv(process.env.BKASH_APP_KEY),
                    "User-Agent": "Mozilla/5.0"
                },
                body: JSON.stringify({ paymentID })
            });
            
            const data = await response.json();

            if (data && (data.statusCode === "0000" || data.transactionStatus === "Completed")) {
                const newBooking = new Booking({
                    packageId,
                    userId: buyerId, // PERFECT FIX: Fulfills strict Mongoose Schema requirement
                    user: buyerId,
                    buyerId,
                    travelDate: date,
                    date,
                    persons,
                    travelersCount: persons,
                    totalPrice: amount,
                    status: "Confirmed",
                    paymentMethod: "bKash",
                    transactionId: data.trxID
                });
                await newBooking.save();
                
                return res.redirect("http://localhost:5173/profile/user");
            } else {
                return res.redirect(`http://localhost:5173/booking/${packageId}?error=ExecuteFailed`);
            }
        } catch (error) {
            console.error("bKash Execute Error:", error);
            return res.redirect(`http://localhost:5173/booking/${packageId}?error=ExecutionError`);
        }
    } else {
        return res.redirect(`http://localhost:5173/booking/${packageId}?error=${status}`);
    }
});

// 4. MOCK CREDIT/DEBIT CARD PAYMENT (FOR DEFENSE DEMO)
router.post("/dummy-card-payment", async (req, res) => {
    try {
        const { amount, packageId, buyerId, date, persons, cardNumber } = req.body;
        
        if (!cardNumber || cardNumber.replace(/\s/g, '').length < 15) {
            return res.status(400).json({ success: false, message: "Please enter a valid 16-digit card number." });
        }

        const newBooking = new Booking({
            packageId,
            userId: buyerId, // PERFECT FIX: Fulfills strict Mongoose Schema requirement
            user: buyerId,
            buyerId,
            travelDate: date,
            date,
            persons,
            travelersCount: persons,
            totalPrice: amount,
            status: "Confirmed",
            paymentMethod: "Credit/Debit Card",
            transactionId: "TXN_CARD_" + Math.floor(Math.random() * 1000000000)
        });

        await newBooking.save();

        return res.status(200).json({ success: true, message: "Card payment processed successfully!" });
    } catch (error) {
        console.error("Dummy Card Error:", error);
        res.status(500).json({ success: false, message: "Card payment failed." });
    }
});

export default router;