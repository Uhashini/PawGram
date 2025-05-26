import React, { useState, useRef } from "react";
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

  const fileInputRef = useRef(null);

  const handleIconClick = () => {
    // If form is visible, clicking icon again hides it and resets state
    if (showForm) {
      setShowForm(false);
      setImage(null);
      setCaption("");
      setProgress(0);
    } else {
      fileInputRef.current.click(); // open file selector
    }
  };

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
              likes: [],
              comments: [],
            });

            setProgress(0);
            setCaption("");
            setImage(null);
            setShowForm(false);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000); // Hide after 3 sec
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
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
      <img
        src="/upload.png"
        alt="Upload"
        className="upload-icon"
        onClick={handleIconClick}
      />

      {showForm && (
        <form onSubmit={handleSubmit} className="post-form">
          <input
            type="text"
            placeholder="Write a caption..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          />
          <button type="submit" disabled={!caption.trim()}>Post</button>
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
