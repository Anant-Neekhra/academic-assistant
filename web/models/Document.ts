import mongoose, {
  Schema,
  model,
  models,
  type Document as MongoDocument,
} from "mongoose";

export interface IDocument extends MongoDocument {
  title: string;
  fileUrl: string;
  clerkUserId: string;
  pageCount?: number;
  status: "processing" | "ready" | "error";
  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema = new Schema<IDocument>(
  {
    title: {
      type: String,
      required: [true, "Document title is required"],
      trim: true,
      maxlength: [260, "Title cannot exceed 260 characters"],
    },
    fileUrl: {
      type: String,
      required: [true, "File URL is required"],
    },
    clerkUserId: {
      type: String,
      required: [true, "Clerk User ID is required"],
      index: true, // We'll query by userId often, so index it
    },
    pageCount: {
      type: Number,
      default: null,
    },
    status: {
      type: String,
      enum: ["processing", "ready", "error"],
      default: "processing",
    },
  },
  {
    timestamps: true, // auto-manages createdAt and updatedAt
  },
);

// Prevent model recompilation during hot-reload in development
export const DocumentModel =
  models.Document ?? model<IDocument>("Document", DocumentSchema);
