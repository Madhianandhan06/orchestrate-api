import mongoose from "mongoose";

const imageSchema = new mongoose.Schema(
  {
    imageUrl: String,
    publicId: String,
  },
  { timestamps: true }
);

export default mongoose.model("Image", imageSchema);