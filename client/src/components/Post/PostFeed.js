import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import "./PostFeed.css"
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { auth } from "../../firebase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/free-solid-svg-icons";


const PostFeed = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const postsRef = collection(db, "posts");
    const q = query(postsRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(postsData);
    });

    return () => unsubscribe();
  }, []);

  const [commentInput, setCommentInput] = useState({});

const handleCommentChange = (postId, value) => {
  setCommentInput(prev => ({ ...prev, [postId]: value }));
};

const handleLike = async (postId) => {
  const postRef = doc(db, "posts", postId);
  const post = posts.find(p => p.id === postId);
  const userEmail = auth.currentUser.email;

  if (!post.likes?.includes(userEmail)) {
    await updateDoc(postRef, {
      likes: arrayUnion(userEmail),
    });
  }
};


const handleComment = async (postId) => {
  const postRef = doc(db, "posts", postId);
  const commentText = commentInput[postId];
  if (commentText.trim()) {
    await updateDoc(postRef, {
      comments: arrayUnion(`${auth.currentUser.email}: ${commentText}`),
    });
    setCommentInput(prev => ({ ...prev, [postId]: "" }));
  }
};


  return (
    <div className="post-feed">
      {posts.length === 0 && <p>No posts yet.</p>}
      {posts.map(post => (
        <div key={post.id} className="post">
          <p className="userid"><strong>User: {post.userId}</strong></p>
          <p>{post.createdAt?.toDate().toLocaleString()}</p>
          <img src={post.imageUrl} alt={post.caption} className="post-image" />
           {/* You can replace userId with email if you save it */}
          <p>Caption: {post.caption}</p>
          <p>Likes: {post.likes?.length || 0}</p>
          <button
  onClick={() => handleLike(post.id)}
  style={{
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "24px",
    color: post.likes?.includes(auth.currentUser.email) ? "red" : "gray",
  }}
>
  <FontAwesomeIcon icon={faHeart} />
</button>

          <input
            type="text"
            value={commentInput[post.id] || ""}
            onChange={(e) => handleCommentChange(post.id, e.target.value)}
            placeholder="Write a comment..."
          />
          <button onClick={() => handleComment(post.id)}>Post</button>

          <div className="comments">
            <strong>Comments:</strong>
            {post.comments?.length > 0 ? (
              post.comments.map((comment, index) => (
                <p key={index}>• {comment}</p>
              ))
            ) : (
              <p>No comments yet.</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PostFeed;
