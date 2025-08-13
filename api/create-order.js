// api/create-order.js

const Razorpay = require("razorpay");

// Initialize Razorpay instance with your keys
// IMPORTANT: Store these in Vercel's Environment Variables, not in the code!
const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

module.exports = async (req, res) => {
    // We only want to handle POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { amount, currency } = req.body;

        const options = {
            amount: amount, // amount in the smallest currency unit
            currency: currency,
            receipt: `receipt_order_${new Date().getTime()}`,
        };

        const order = await instance.orders.create(options);
        
        if (!order) {
          return res.status(500).json({ error: 'Error creating order' });
        }

        // Send back the order details
        res.status(200).json(order);

    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};