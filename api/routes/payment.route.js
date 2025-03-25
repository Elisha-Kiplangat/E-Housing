import express from "express";
import { createPayment, getMonthlyPaymentStats, getPayments, getPaymentStats, payment, totalPayments } from "../controllers/payment.controller.js";

const router = express.Router();

router.get("/", getPayments);
router.get("/total", totalPayments);
router.get("/stats", getPaymentStats);
router.get("/monthly-stats", getMonthlyPaymentStats);
router.post("/save", createPayment)
router.post("/", payment );

export default router;
