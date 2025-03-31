import express from "express";
import {
  getBookings,
  addBooking,
  bookingCount,
  getAllBookings,
  getBookingStats,
  updateBooking,
  updateBookingStatus,
  getBooking,
  deleteBooking
} from "../controllers/booking.controller.js";

// import { getBookings, addBooking, bookingCount, getBookingStats } from "../controllers/booking.controller.js";

import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();
router.get("/stats", verifyToken, getBookingStats);

router.get("/count", verifyToken, bookingCount);
router.get("/", verifyToken, getAllBookings);
router.get("/user", verifyToken, getBookings);
router.get("/:id", verifyToken, getBooking );
// router.put("/:id", updateBooking);
router.post("/", addBooking);

router.delete("/:id", verifyToken, deleteBooking)

// router.get("/", verifyToken, getBookings);

router.put("/update-status", updateBookingStatus);


export default router;
