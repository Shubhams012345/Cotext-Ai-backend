import express from "express";
const router=express.Router();
import { deductCredits, login,logout, updatUserPayment } from "../controllers/auth.controller.js";

router.post("/login", login);
router.get("/logout",logout);
router.post("/update-plan",updatUserPayment)
router.post("/deduct-credits",deductCredits)
export default router