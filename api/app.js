import express from "express";
import cors from "cors";
// const dotenv = require("dotenv");
import cookieParser from "cookie-parser";
import authRoute from "./routes/auth.route.js";
import postRoute from "./routes/post.route.js";
import testRoute from "./routes/test.route.js";
import userRoute from "./routes/user.route.js";
import chatRoute from "./routes/chat.route.js";
import messageRoute from "./routes/message.route.js";
import paymentRoute from "./routes/payment.route.js";
import completeRoute from "./routes/complete.route.js";
import callbackRoute from "./routes/callback.route.js";
// import { payment } from "./controllers/payment.controller.js";

// import { confirmOrder } from "../controllers/complete.controller.js";
// const app = express();

// app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
// const allowedOrigins = [process.env.CLIENT_URL1, process.env.CLIENT_URL2, process.env.CLIENT_URL3];

import bookingRoute from "./routes/booking.route.js";

const app = express();

// app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
const allowedOrigins = [
  process.env.CLIENT_URL1,
  process.env.CLIENT_URL2,
  process.env.CLIENT_URL3,
  process.env.CLIENT_URL4,
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/posts", postRoute);
app.use("/api/test", testRoute);
app.use("/api/chats", chatRoute);
app.use("/api/messages", messageRoute);

// app.use("/payment", payment);
// app.use("/completeorder", confirmOrder);

app.use("/api/bookings", bookingRoute);
app.use("/api/payment", paymentRoute);
app.use("/api/complete", completeRoute);

app.use("/api/callback", callbackRoute);

app.listen(3000, () => {
  console.log("Server is running!");
});
