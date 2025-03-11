import express from "express";
import { getBookings, addBooking, bookingCount } from "../controllers/booking.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/count", verifyToken, bookingCount);
router.get("/", verifyToken, getBookings);

router.post("/", verifyToken, addBooking);

export default router;