// models/UserDailyLogin.js
import mongoose from "mongoose";

const UserDailyLoginSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  consecutiveDays: { type: Number, default: 0 },
  lastClaimAt: { type: Date },
  lastVisitAt: { type: Date },
});

export default mongoose.models.UserDailyLogin ||
  mongoose.model("UserDailyLogin", UserDailyLoginSchema);
