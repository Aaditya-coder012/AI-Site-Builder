import mongoose from "mongoose";

mongoose.set("bufferCommands", false);

const MONGODB_URI = process.env.MONGODB_URI || "";

let isConnected = false;

export const connectMongoDB = async () => {
  if (!MONGODB_URI) {
    return false;
  }
  if (isConnected || mongoose.connection.readyState === 1) {
    return true;
  }
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 3000,
    });
    isConnected = true;
    console.log("[MongoDB] Connected successfully to MongoDB");
    return true;
  } catch (error: any) {
    console.warn("[MongoDB] Not connected to external MongoDB (using in-memory fallback):", error.message);
    return false;
  }
};

// Attempt non-blocking connection on server start
if (MONGODB_URI) {
  connectMongoDB().catch(() => {});
}

// Mongoose Schemas & Models
const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  name: { type: String, required: true },
  totalCreation: { type: Number, default: 0 },
  credits: { type: Number, default: 20 },
  emailVerified: { type: Boolean, default: false },
}, { timestamps: true });

const websiteProjectSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  initial_prompt: { type: String, required: true },
  current_code: { type: String, default: null },
  current_version_index: { type: String, default: "" },
  userId: { type: String, required: true },
  isPublished: { type: Boolean, default: false },
}, { timestamps: true });

const conversationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  role: { type: String, enum: ["user", "assistant"], required: true },
  content: { type: String, required: true },
  projectId: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const versionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  code: { type: String, required: true },
  description: { type: String, default: null },
  projectId: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

export const UserModel = mongoose.models.User || mongoose.model("User", userSchema);
export const WebsiteProjectModel = mongoose.models.WebsiteProject || mongoose.model("WebsiteProject", websiteProjectSchema);
export const ConversationModel = mongoose.models.Conversation || mongoose.model("Conversation", conversationSchema);
export const VersionModel = mongoose.models.Version || mongoose.model("Version", versionSchema);
