import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import "./PostFeed.css"
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { auth } from "../../firebase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/free-solid-svg-icons";
import { arrayRemove } from "firebase/firestore";


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


const handleLike = async (postId, currentLikes) => {
  const postRef = doc(db, "posts", postId);
  const userEmail = auth.currentUser.email;

  if (currentLikes && currentLikes.includes(userEmail)) {
    // User already liked — remove their like (unlike)
    await updateDoc(postRef, {
      likes: arrayRemove(userEmail),
    });
  } else {
    // User hasn't liked — add their like
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
          <p>
            <span className="caption">Caption: </span>
            {post.caption}
          </p>

          <p>
            <span className="caption">Likes: </span>
            {post.likes?.length || 0}
          </p>
          
          <button onClick={() => handleLike(post.id, post.likes)}> 
  {post.likes?.includes(auth.currentUser.email) ? "❤️ Unlike" : "🤍 Like"}
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
