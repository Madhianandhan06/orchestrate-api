import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./db.js";
import Image from "./models/Image.js";
import multer from "multer";
import cloudinary from "./services/cloudinaryService.js";

dotenv.config();
await connectDB();

const upload = multer({ dest: "uploads/" });

const app = express();
app.use(cors());
app.use(express.json()); 

app.get("/", (req, res) => {
  res.send("Hello from the server!");
});

app.get("/images", async (req, res) => {
  const images = await Image.find();

  res.json(images);
});

app.post("/upload", upload.single("image"), async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ message: "Select an image to upload." });
  }

  try {
    const result = await cloudinary.uploader.upload(req.file.path);
    const image = await Image.create({
      imageUrl: result.secure_url,
      publicId: result.public_id,
    });

    res.json({
      image,
      message: "File received",
    });
  } catch (error) {
    next(error);
  }
});

app.put("/images/:id", upload.single("image"), async (req, res) => {
  const image = await Image.findById(req.params.id);

  await cloudinary.uploader.destroy(image.publicId);

  const result = await cloudinary.uploader.upload(req.file.path);

  image.imageUrl = result.secure_url;
  image.publicId = result.public_id;

  await image.save();

  res.json(image);
});

app.delete("/images/:id", async (req, res) => {
  const image = await Image.findById(req.params.id);

  await cloudinary.uploader.destroy(image.publicId);

  await Image.findByIdAndDelete(req.params.id);

  res.json({ message: "Deleted successfully" });
});

app.use((error, req, res, next) => {
  console.error("Request failed:", error);
  res.status(error.status || error.statusCode || 500).json({
    message: error.message || "Request failed",
  });
});

app.listen(5000, () => console.log("Server is running on port 5000"));
