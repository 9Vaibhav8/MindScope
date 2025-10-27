
import User from "../models/User.js";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const verifyGoogleAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token" });

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    
    
    let user = await User.findOne({ userId: payload.sub });
    if (!user) {
      user = await User.create({
        userId: payload.sub,
        name: payload.name,
        email: payload.email,
        picture: payload.picture,
      });
      console.log("✅ New user created:", user.email);
    }

    req.user = {
      userId: user.userId,
      name: user.name,
      email: user.email
    };

    next();
  } catch (error) {
    console.error("Auth error:", error);
    res.status(403).json({ error: "Invalid token" });
  }
};