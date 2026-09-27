import { useState } from "react";

export default function UploadImage() {
  const [image, setImage] = useState(null);
  const [uploadedUrl, setUploadedUrl] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const uploadImage = async () => {
    if (!image) {
      setErrorMessage("Select an image to upload.");
      return;
    }

    setErrorMessage("");
    const formData = new FormData();
    formData.append("image", image);

    try {
      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Image upload failed.");
      }

      setUploadedUrl(data.imageUrl);
    } catch (error) {
      setErrorMessage(error.message || "Image upload failed.");
    }
  };

  return (
    <div className="bg-amber-200">
      <h2>Upload Image</h2>

      <input
        className="border p-2 m-2 cursor-pointer"
        type="file"
        accept="image/*"
        onChange={(e) => setImage(e.target.files[0])}
      />

      <button className="bg-red-600 text-white m-2 p-2 rounded-lg" onClick={uploadImage}>Upload</button>

      {errorMessage && <p role="alert">{errorMessage}</p>}

      {uploadedUrl && (
        <img src={uploadedUrl} alt="Uploaded" width="250" />
      )}
    </div>
  );
}