import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";

const UserProfile = () => {
  const { userId } = useParams(); // Get userId from URL
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const docRef = doc(db, "users", userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setUserData(docSnap.data());
      } else {
        setUserData(null); // user not found
      }
      setLoading(false);
    };

    fetchUser();
  }, [userId]);

  if (loading) return <p>Loading profile...</p>;
  if (!userData) return <p>User not found.</p>;

  return (
    <div>
      <h2>{userData.username || userData.email}'s Profile</h2>
      <p>Email: {userData.email}</p>
      <p>Followers: {userData.followers?.length || 0}</p>
      <p>Following: {userData.following?.length || 0}</p>
      {/* Add more user info as needed */}
    </div>
  );
};

export default UserProfile;
