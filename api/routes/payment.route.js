import express from "express";
import {
  createPayment,
  payment,
  updatePaymentStatus,
} from "../controllers/payment.controller.js";

const router = express.Router();

router.post("/", payment);
router.post("/save", createPayment);
router.put("/update", updatePaymentStatus);

export default router;
