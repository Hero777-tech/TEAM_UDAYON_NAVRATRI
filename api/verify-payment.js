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
        
        // 1. VERIFY THE SIGNATURE
        const generated_signature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(order_id + "|" + razorpay_payment_id)
            .digest('hex');

        if (generated_signature !== razorpay_signature) {
            return res.status(400).json({ status: 'failure', message: 'Signature verification failed' });
        }

        // 2. CAPTURE THE PAYMENT
        // If the signature is valid, capture the payment to your account
        await instance.payments.capture(razorpay_payment_id, amount, "INR");
        
        // 3. RESPOND WITH SUCCESS
        res.status(200).json({ status: 'success', orderId: order_id, paymentId: razorpay_payment_id });

    } catch (error) {
        console.error("Error verifying payment:", error);
        res.status(500).json({ status: 'failure', message: 'Internal Server Error' });
    }
};