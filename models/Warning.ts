import mongoose, { Document, Schema } from "mongoose";

export interface IWarning extends Document {
  _id: string;
  message: string;
  createdAt: Date;
  acknowledged: boolean;
  acknowledgedAt?: Date;
}

const WarningSchema: Schema = new Schema<IWarning>({
  message: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  acknowledged: {
    type: Boolean,
    default: false,
  },
  acknowledgedAt: {
    type: Date,
  },
});

// Export the model
const Warning =
  mongoose.models.Warning || mongoose.model<IWarning>("Warning", WarningSchema);

export default Warning;
