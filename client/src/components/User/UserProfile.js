import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import { db, auth, storage } from "../../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import "./UserProfile.css";

const UserProfile = () => {
  const { userId } = useParams();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [userPosts, setUserPosts] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [newBio, setNewBio] = useState("");
  const [newPhotoFile, setNewPhotoFile] = useState(null);

  const currentUserEmail = auth.currentUser?.email;
  const isCurrentUser = userId === currentUserEmail;

  useEffect(() => {
    const fetchUser = async () => {
      const userSnap = await getDoc(doc(db, "users", userId));
      if (userSnap.exists()) {
        const data = userSnap.data();
        setUserData(data);
        setNewBio(data.bio || "");
      }
      if (currentUserEmail && userId !== currentUserEmail) {
        const currentSnap = await getDoc(doc(db, "users", currentUserEmail));
        const followingList = currentSnap.data()?.following || [];
        setIsFollowing(followingList.includes(userId));
      }
      setLoading(false);
    };

    fetchUser();
  }, [userId, currentUserEmail]);

  useEffect(() => {
    const q = query(
      collection(db, "posts"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUserPosts(postsData);
    });

    return () => unsubscribe();
  }, [userId]);

  const handleFollowToggle = async () => {
    const currentUserRef = doc(db, "users", currentUserEmail);
    const viewedUserRef = doc(db, "users", userId);

    if (isFollowing) {
      await updateDoc(currentUserRef, {
        following: arrayRemove(userId),
      });
      await updateDoc(viewedUserRef, {
        followers: arrayRemove(currentUserEmail),
      });
    } else {
      await updateDoc(currentUserRef, {
        following: arrayUnion(userId),
      });
      await updateDoc(viewedUserRef, {
        followers: arrayUnion(currentUserEmail),
      });
    }

    setIsFollowing(!isFollowing);
  };

  const handleSaveProfile = async () => {
    const userRef = doc(db, "users", userId);
    let photoURL = userData.photoURL || "";

    if (newPhotoFile) {
      const storageRef = ref(storage, `profilePictures/${userId}`);
      await uploadBytes(storageRef, newPhotoFile);
      photoURL = await getDownloadURL(storageRef);
    }

    await updateDoc(userRef, {
      bio: newBio,
      photoURL,
    });

    setUserData({ ...userData, bio: newBio, photoURL });
    setIsEditing(false);
    setNewPhotoFile(null);
  };

  if (loading) return <p>Loading profile...</p>;
  if (!userData) return <p>User not found.</p>;

  return (
    <div className="profile-container">
      {userData.photoURL && (
        <img src={userData.photoURL} alt="Profile" className="profile-picture" />
      )}

      <h2>{userData.username || userData.email}'s Profile</h2>
      <p>Email: {userData.email}</p>

      {isEditing ? (
        <div className="edit-section">
          <label>
            Bio:
            <textarea
              value={newBio}
              onChange={(e) => setNewBio(e.target.value)}
              rows={3}
            />
          </label>
          <label>
            Profile Picture:
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setNewPhotoFile(e.target.files[0])}
            />
          </label>
          <button onClick={handleSaveProfile}>Save</button>
          <button onClick={() => setIsEditing(false)}>Cancel</button>
        </div>
      ) : (
        <>
          {userData.bio && <p className="user-bio">Bio: {userData.bio}</p>}
          {isCurrentUser && (
            <button onClick={() => setIsEditing(true)}>Edit Profile</button>
          )}
        </>
      )}

      <div className="followers-list">
        <p><strong>Followers ({userData.followers?.length || 0}):</strong></p>
        <ul>
          {userData.followers?.map((followerEmail) => (
            <li key={followerEmail}>
              <Link to={`/profile/${followerEmail}`} className="follower-link">
                {followerEmail}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="following-list">
        <p><strong>Following ({userData.following?.length || 0}):</strong></p>
        <ul>
          {userData.following?.map((followedEmail) => (
            <li key={followedEmail}>
              <Link to={`/profile/${followedEmail}`} className="follower-link">
                {followedEmail}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {!isCurrentUser && (
        <button className="follow-btn" onClick={handleFollowToggle}>
          {isFollowing ? "Unfollow" : "Follow"}
        </button>
      )}

      <div className="user-posts">
        <h3>Posts</h3>
        {userPosts.length === 0 ? (
          <p>No posts yet.</p>
        ) : (
          userPosts.map((post) => (
            <div key={post.id} className="profile-post">
              <p>{post.createdAt?.toDate().toLocaleString()}</p>
              {post.imageUrl && (
                <img
                  src={post.imageUrl}
                  alt={post.caption}
                  className="profile-post-image"
                />
              )}
              <p>{post.caption}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UserProfile;
