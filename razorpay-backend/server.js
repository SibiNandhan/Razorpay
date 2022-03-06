const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Razorpay = require("razorpay");
const Order = require("./models/OrderModel");
dotenv.config({ path: "./config.env" });
const app = express();
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected Successfully"));

app.use(express.json());

app.get("/get-razorpay-key", (req, res) => {
  res.send({ key: process.env.RAZORPAY_KEY_ID });
});

app.post("/create-order", async (req, res) => {
  try {
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_SECRET,
    });
    const options = {
      amount: req.body.amount,
      currency: "INR",
    };
    const order = await instance.orders.create(options);
    if (!order) return res.status(500).send("Some error occured");
    res.send(order);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.post("/pay-order", async (req, res) => {
  try {
    const { amount, razorpayPaymentId, razorpayOrderId, razorpaySignature } =
      req.body;
    const newOrder = Order({
      isPaid: true,
      amount: amount,
      razorpay: {
        orderId: razorpayOrderId,
        paymentId: razorpayPaymentId,
        signature: razorpaySignature,
      },
    });
    await newOrder.save();
    res.send({
      msg: "Payment was successfull",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

app.get("/list-orders", async (req, res) => {
  const orders = await Order.find();
  res.send(orders);
});

app.listen(process.env.POST || 4000, () => {
  console.log("Server started Successfully");
});
