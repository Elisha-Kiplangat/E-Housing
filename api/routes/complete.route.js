import express from "express";
import { checkPaymentStatus } from "../controllers/complete.controller.js"; // Ensure correct path

const router = express.Router();

router.post("/", checkPaymentStatus);

export default router;
