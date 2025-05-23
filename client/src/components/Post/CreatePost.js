import React, { useState } from "react";
import { storage, db, auth } from "../../firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import "./Createpost.css";

const CreatePost = () => {
  const [image, setImage] = useState(null);
  const [caption, setCaption] = useState("");
  const [progress, setProgress] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
      setShowForm(true);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!image) {
      alert("Please select an image first!");
      return;
    }
    console.log("User ID:", auth.currentUser?.uid);


    const storageRef = ref(storage, `posts/${auth.currentUser.uid}/${image.name}`);
    const uploadTask = uploadBytesResumable(storageRef, image);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const percent = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(percent);
      },
      (error) => {
        console.error("Upload failed:", error);
        alert("Upload failed, try again.");
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
          try {
            await addDoc(collection(db, "posts"), {
              imageUrl: downloadURL,
              caption: caption,
              userId: auth.currentUser.uid,
              createdAt: serverTimestamp(),
            });

            setProgress(0);
            setCaption("");
            setImage(null);
            
            alert("Post uploaded successfully!");
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000); // hides after 3 seconds
          } catch (error) {
            console.error("Error saving post: ", error);
            alert("Failed to save post.");
          }
        });
      }
    );
  };

  return (
    <div className="create-post-container">
      <input
        type="file"
        accept="image/*"
        id="fileInput"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
      <label htmlFor="fileInput">
        <img src="/upload.png" alt="Upload" className="upload-icon" />
      </label>

      {showForm && (
        <form onSubmit={handleSubmit} className="post-form">
          <input
            type="text"
            placeholder="Write a caption..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          />
          <button type="submit">Post</button>
        </form>
      )}

      {progress > 0 && (
        <progress value={progress} max="100">
          {progress}%
        </progress>
      )}
      {showSuccess && (
  <div className="success-popup">Post uploaded successfully!</div>
      )}
    </div>
  );
};

export default CreatePost;
