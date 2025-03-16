import express from "express";
import { payment } from "../controllers/payment.controller.js";

const router = express.Router();

router.post("/", payment );

export default router;
