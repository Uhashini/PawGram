import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db, auth } from "../../firebase";
import "./UserProfile.css";

const UserProfile = () => {
  const { userId } = useParams(); // profile being viewed
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  const currentUserEmail = auth.currentUser?.email;

  useEffect(() => {
    const fetchUser = async () => {
      const docRef = doc(db, "users", userId);
      const userSnap = await getDoc(docRef);

      if (userSnap.exists()) {
        setUserData(userSnap.data());
      } else {
        setUserData(null);
      }

      if (currentUserEmail && userId !== currentUserEmail) {
        const currentUserRef = doc(db, "users", currentUserEmail);
        const currentSnap = await getDoc(currentUserRef);
        if (currentSnap.exists()) {
          const followingList = currentSnap.data().following || [];
          setIsFollowing(followingList.includes(userId));
        }
      }

      setLoading(false);
    };

    fetchUser();
  }, [userId, currentUserEmail]);

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

  if (loading) return <p>Loading profile...</p>;
  if (!userData) return <p>User not found.</p>;

  return (
    <div className="profile-container">
      <h2>{userData.username || userData.email}'s Profile</h2>
      <p>Email: {userData.email}</p>
      <p>Followers: {userData.followers?.length || 0}</p>
      <p>Following: {userData.following?.length || 0}</p>

      {userId !== currentUserEmail && (
        <button className="follow-btn" onClick={handleFollowToggle}>
          {isFollowing ? "Unfollow" : "Follow"}
        </button>
      )}
    </div>
  );
};

export default UserProfile;
