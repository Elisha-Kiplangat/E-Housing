import express from "express";<<<<<<< master
import {
  getBookings,
  addBooking,
  bookingCount,
  getAllBookings,
  getBookingStats
} from "../controllers/booking.controller.js";

// import { getBookings, addBooking, bookingCount, getBookingStats } from "../controllers/booking.controller.js";

import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/count", verifyToken, bookingCount);

router.get("/user", verifyToken, getBookings);
router.get("/", verifyToken, getAllBookings);

router.get("/stats", verifyToken, getBookingStats);
// router.get("/", verifyToken, getBookings);


router.post("/", addBooking);

export default router;
