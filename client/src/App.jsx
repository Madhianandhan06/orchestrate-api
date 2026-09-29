import { useEffect, useState } from "react";
import Cropper from "react-easy-crop";

export default function UploadImage() {
  const [image, setImage] = useState(null);

  const [imageUrl, setImageUrl] = useState("");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

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

const getCroppedImage = async () => {
  const imageElement = new Image();

  imageElement.src = imageUrl;

  await new Promise((resolve) => {
    imageElement.onload = resolve;
  });

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = croppedAreaPixels.width;
  canvas.height = croppedAreaPixels.height;

  ctx.drawImage(
    imageElement,
    croppedAreaPixels.x,
    croppedAreaPixels.y,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
    0,
    0,
    croppedAreaPixels.width,
    croppedAreaPixels.height
  );

  const blob = await new Promise((resolve) => {
    canvas.toBlob(resolve, "image/jpeg");
  });

  return new File([blob], "cropped-image.jpg", {
    type: "image/jpeg",
  });
};

  const uploadImage = async () => {
      if (!image) {
        setErrorMessage("Select an image to upload.");
        return;
      }

      setErrorMessage("");

      if (!croppedAreaPixels) {
        setErrorMessage("Crop the image first.");
        return;
      }

      setErrorMessage("");

      const croppedFile = await getCroppedImage();

      const formData = new FormData();
      formData.append("image", croppedFile);

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
    } finally {
      setImageUrl('')
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

    setImages((currentImages) =>
      currentImages.map((img) =>
        img._id === id ? updated : img
      )
    );
  };

  const deleteImage = async (id) => {
    await fetch(`http://localhost:5000/images/${id}`, {
      method: "DELETE",
    });

    setImages((currentImages) =>
      currentImages.filter((img) => img._id !== id)
    );
  };

  return (
    <div className="bg-amber-200">
      <h2>Upload Image</h2>

      <input
        className="border p-2 m-2 cursor-pointer"
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files[0];

          setImage(file);
          setImageUrl(URL.createObjectURL(file));
        }}
      />

      {imageUrl && (
        <div className="relative w-100 h-100">
          <Cropper
            image={imageUrl}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={(_, croppedAreaPixels) =>
              setCroppedAreaPixels(croppedAreaPixels)
            }
          />
        </div>
      )}

      <button
        className="bg-red-600 text-white m-2 p-2 rounded-lg"
        onClick={uploadImage}
      >
        Upload
      </button>

      {errorMessage && <p role="alert">{errorMessage}</p>}

      {images.map((img) => (
        <div className="flex" key={img._id}>
          <img
            src={img.imageUrl}
            alt="Uploaded"
            width="350"
          />

          <button
            className="w-12 h-8 bg-red-600 rounded-lg"
            onClick={() => replaceImage(img._id)}
          >
            Change
          </button>

          <button
            className="w-12 h-8 bg-red-600 rounded-lg"
            onClick={() => deleteImage(img._id)}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}