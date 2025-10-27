import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String },
  messages: [
    {
      role: { type: String, enum: ["user", "ai"], required: true },
      text: { type: String, required: true },
    },
  ],
}, { timestamps: true });

export default mongoose.model("Chat", chatSchema);
