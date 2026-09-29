import { useEffect, useState } from "react";

export default function UploadImage() {
  const [image, setImage] = useState(null);
  const [images, setImages] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  console.log(images);
  
  useEffect(() => {
    const getImages = async () => {
      try {
        const response = await fetch("http://localhost:5000/images");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Could not load images.");
        }

        setImages(data);
      } catch (error) {
        setErrorMessage(error.message || "Could not load images.");
      }
    };

    getImages();
  }, []);

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

      setImages((currentImages) => [data.image, ...currentImages]);
    } catch (error) {
      setErrorMessage(error.message || "Image upload failed.");
    }
  };

  const replaceImage = async (id) => {
  const formData = new FormData();

  formData.append("image", image);

  const response = await fetch(
    `http://localhost:5000/images/${id}`,
    {
      method: "PUT",
      body: formData,
    }
  );

  const updated = await response.json();

  setImages(images.map((img) =>
    img._id === id ? updated : img
  ));
};

  const deleteImage = async (id) => {
  await fetch(`http://localhost:5000/images/${id}`, {
    method: "DELETE",
  });

  setImages(images.filter((img) => img._id !== id));
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

      {images.map((img) => (

        <div className="flex" key={img._id}>
            <img 
              src={img.imageUrl} 
              alt="Uploaded" 
              width="250" 
            />
            <button className=" w-12 h-8 bg-red-600 rounded-lg" onClick={() => replaceImage(img._id)}>
             Change
            </button>
            <button className=" w-12 h-8 bg-red-600 rounded-lg" onClick={() => deleteImage(img._id)}>
              Delete
            </button>
        </div>

        
      ))}
    </div>
  );
}