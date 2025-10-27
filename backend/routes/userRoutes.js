import express from "express";
import { verifyFirebaseToken } from "../middleware/verifyFirebaseToken.js";

const router = express.Router();

router.get("/profile", verifyFirebaseToken, async (req, res) => {
  res.json({ message: "Protected route accessed", user: req.user });
});

export default router;
