import express from "express";
import {
  getBookings,
  addBooking,
  bookingCount,
  getAllBookings,
} from "../controllers/booking.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/count", verifyToken, bookingCount);
router.get("/user", verifyToken, getBookings);
router.get("/", verifyToken, getAllBookings);

router.post("/", addBooking);

export default router;
