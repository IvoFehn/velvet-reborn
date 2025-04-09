/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose, { Document, Model } from "mongoose";

// Define interfaces for the documents
interface IAnswer {
  questionId: string;
  response: "yes" | "maybe" | "no";
  reason: string;
}

interface ISurvey extends Document {
  answers: IAnswer[];
  averageScore: number;
  submittedAt: Date;
  calculateAverage: () => number;
}

// Define interface for the Survey model with static methods
interface ISurveyModel extends Model<ISurvey> {
  canRetake(): Promise<boolean>;
}

// Schema definitions
const answerSchema = new mongoose.Schema<IAnswer>({
  questionId: String,
  response: { type: String, enum: ["yes", "maybe", "no"] },
  reason: String,
});

const surveySchema = new mongoose.Schema<ISurvey>({
  answers: [answerSchema],
  averageScore: Number,
  submittedAt: { type: Date, default: Date.now },
});

// Method to check if a new survey can be taken
surveySchema.statics.canRetake = async function (): Promise<boolean> {
  const lastSurvey = await this.findOne().sort({ submittedAt: -1 });
  if (!lastSurvey) return true;

  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  return lastSurvey.submittedAt < threeMonthsAgo;
};

// Method to calculate average score
surveySchema.methods.calculateAverage = function (): number {
  const scores = this.answers.map((a: any) => {
    if (a.response === "yes") return 100;
    if (a.response === "maybe") return 50;
    return 0;
  });

  if (scores.length === 0) return 0;
  return scores.reduce((a: any, b: any) => a + b, 0) / scores.length;
};

// Create and export the model
const Survey =
  (mongoose.models.Survey as ISurveyModel) ||
  mongoose.model<ISurvey, ISurveyModel>("Survey", surveySchema);

export default Survey;
