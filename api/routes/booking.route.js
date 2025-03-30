import express from "express";
import {
  getBookings,
  addBooking,
  bookingCount,
  getAllBookings,
  getBookingStats,
  updateBooking,
  updateBookingStatus
} from "../controllers/booking.controller.js";

// import { getBookings, addBooking, bookingCount, getBookingStats } from "../controllers/booking.controller.js";

import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/", verifyToken, getAllBookings);
router.get("/user", verifyToken, getBookings);
router.post("/", addBooking);
// router.put("/:id", updateBooking);
router.get("/count", verifyToken, bookingCount);
router.get("/stats", verifyToken, getBookingStats);

// router.get("/", verifyToken, getBookings);

router.put("/update-status", updateBookingStatus);


export default router;
