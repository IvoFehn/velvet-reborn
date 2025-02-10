// models/Generator.ts
import { Schema, model, models, Model, Document } from "mongoose";

// **Exportiertes** Interface für das Dokument
export interface IGenerator extends Document {
  status?: "NEW" | "ACCEPTED" | "PENDING" | "DECLINED" | "DONE" | "FAILED";
  pose?: {
    chosenPose?: {
      id?: string;
      title?: string;
      description?: string;
      img?: string;
      additionalNote?: string;
    };
    additionalNote?: string;
  };
  outfit?: string;
  orgasmus?: string;
  kondome?: Array<{
    title?: string;
    amount?: number;
  }>;
  toys?: {
    additionalNote?: string;
    mouth?: Array<{
      title?: string;
      amount?: number;
    }>;
    pussy?: Array<{
      title?: string;
      amount?: number;
    }>;
    ass?: Array<{
      title?: string;
      amount?: number;
    }>;
  };
  regeln?: Array<{
    title?: string;
    description?: string;
    selected?: boolean;
  }>;
  loch?: {
    additionalNote?: string;
    mouth?: string;
    ass?: {
      title?: string;
      tags?: string[];
    };
    pussy?: {
      title?: string;
      tags?: string[];
    };
  };
  vorSex?: Array<{
    title?: string;
    description?: string;
    additionalNote?: string;
  }>;
  dringlichkeit?: {
    title?: string;
    description?: string;
  };
  ort?: {
    title?: string;
    additionalNote?: string;
  };
  iteratoren?: Array<{
    title?: string;
    description?: string;
    additionalNote?: string;
  }>;
  interval?: string[];
  gold?: number;
  exp?: number;
  blueBalls?: boolean;
  alreadyChangeRequested?: boolean;
  alreadyDeclineRequested?: boolean;
}

// Schema-Definition
const GeneratorSchema = new Schema<IGenerator>(
  {
    status: {
      type: String,
      enum: ["NEW", "ACCEPTED", "PENDING", "DONE", "DECLINED", "FAILED"],
      default: "NEW",
    },
    pose: {
      chosenPose: {
        id: { type: String },
        title: { type: String },
        description: { type: String },
        img: { type: String },
        additionalNote: { type: String, default: "" },
      },
      additionalNote: { type: String, default: "" },
    },
    outfit: { type: String },
    orgasmus: { type: String },
    kondome: [
      {
        title: { type: String },
        amount: { type: Number, min: 0 },
      },
    ],
    toys: {
      additionalNote: { type: String, default: "" },
      mouth: [
        {
          title: { type: String },
          amount: { type: Number, min: 0 },
        },
      ],
      pussy: [
        {
          title: { type: String },
          amount: { type: Number, min: 0 },
        },
      ],
      ass: [
        {
          title: { type: String },
          amount: { type: Number, min: 0 },
        },
      ],
    },
    regeln: [
      {
        title: { type: String },
        description: { type: String },
        selected: { type: Boolean },
      },
    ],
    loch: {
      additionalNote: { type: String, default: "" },
      mouth: { type: String },
      ass: {
        title: { type: String },
        tags: [{ type: String }],
      },
      pussy: {
        title: { type: String },
        tags: [{ type: String }],
      },
    },
    vorSex: [
      {
        title: { type: String },
        description: { type: String },
        additionalNote: { type: String, default: "" },
      },
    ],
    dringlichkeit: {
      title: { type: String },
      description: { type: String },
    },
    ort: {
      title: { type: String },
      additionalNote: { type: String, default: "" },
    },
    iteratoren: [
      {
        title: { type: String },
        description: { type: String },
        additionalNote: { type: String, default: "" },
      },
    ],
    interval: [
      {
        type: String, // ISO-Date Strings
      },
    ],
    gold: { type: Number, default: 0, min: 0 },
    exp: { type: Number, default: 0, min: 0 },
    blueBalls: { type: Boolean },
    alreadyChangeRequested: { type: Boolean },
    alreadyDeclineRequested: { type: Boolean },
  },
  { timestamps: true }
);

// Typisiertes Modell
const Generator: Model<IGenerator> =
  (models.Generator as Model<IGenerator>) ||
  model<IGenerator>("Generator", GeneratorSchema);

export default Generator;
