const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const payment = async (number, cvc, exp_month, exp_year, amount) => {
  try {
    const paymentMethod = await stripe.paymentMethods.create({
      type: "card",
      card: {
        number,
        exp_month,
        exp_year,
        cvc,
      },
    });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, 
      currency: "bdt", // CORRECTED: Changed from "pkr" to "bdt"
      payment_method: paymentMethod.id,
      confirm: true,
      return_url: "http://localhost:5173/", 
    });

    return paymentIntent;
  } catch (error) {
    console.error("Stripe payment error:", error);
    return { error: error.message };
  }
};

export default payment;