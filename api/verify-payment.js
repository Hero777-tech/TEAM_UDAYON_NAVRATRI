// api/verify-payment.js

const Razorpay = require("razorpay");
const crypto = require("crypto");

const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { order_id, razorpay_payment_id, razorpay_signature, amount } = req.body;
        
        // Step 1: VERIFY THE SIGNATURE (This is crucial for security)
        const generated_signature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(order_id + "|" + razorpay_payment_id)
            .digest('hex');

        if (generated_signature !== razorpay_signature) {
            return res.status(400).json({ status: 'failure', message: 'Signature verification failed' });
        }

        // Step 2: CAPTURE THE PAYMENT
        await instance.payments.capture(razorpay_payment_id, amount, "INR");
        
        // Step 3: RESPOND WITH SUCCESS
        res.status(200).json({ status: 'success', orderId: order_id, paymentId: razorpay_payment_id });

    } catch (error) {
        console.error("Error verifying payment:", error);

        // ** NEW LOGIC TO HANDLE 'ORDER_ALREADY_PAID' **
        // Check if the error is because the payment was already captured (e.g., by auto-capture).
        // If so, we'll consider it a success because the user has paid.
        if (error.statusCode === 400 && error.error && error.error.reason === 'order_already_paid') {
            console.log("Payment was already captured. Treating as success.");
            // Return a success response to the website.
            return res.status(200).json({ 
                status: 'success', 
                orderId: req.body.order_id, 
                paymentId: req.body.razorpay_payment_id 
            });
        }

        // For all other types of errors, respond with a failure.
        res.status(500).json({ status: 'failure', message: 'Internal Server Error' });
    }
};