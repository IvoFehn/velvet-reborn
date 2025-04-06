// models/WikiPage.js
import mongoose from "mongoose";

// Schema für eine Wiki-Seite
const WikiPageSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  lastModified: {
    type: Date,
    default: Date.now,
  },
  author: {
    type: String,
    required: true,
  },
});

// Erstellt das Model nur, wenn es noch nicht existiert
export default mongoose.models.WikiPage ||
  mongoose.model("WikiPage", WikiPageSchema);
