
import express from "express";
import { handleDarajaCallback } from "../controllers/callback.controller.js";

const router = express.Router();

router.post("/", handleDarajaCallback);

export default router;
