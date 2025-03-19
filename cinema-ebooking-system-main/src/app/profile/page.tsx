'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import { OrderHeader } from '@/components/order/OrderHeader';

interface User {
  firstName: string;
  lastName: string;
  email: string;
}

const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [editing, setEditing] = useState(false);
  const [updatedUser, setUpdatedUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/users/profileLoad');
        if (response.ok) {
          const data = await response.json();
          setUser(data);
          setUpdatedUser(data);
        } else {
          console.error('Failed to fetch user profile');
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, []);

  if (!user) {
    return <div>Loading...</div>;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUpdatedUser((prev) => (prev ? { ...prev, [name]: value } : prev));
  };

  const handleSave = async () => {
    if (!updatedUser) return;

    try {
      const response = await fetch('http://localhost:8080/api/users/', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUser),
      });

      if (response.ok) {
        setUser(updatedUser);
        setEditing(false);
      } else {
        console.error('Failed to update user profile');
      }
    } catch (error) {
      console.error('Error updating user profile:', error);
    }
  };

  const handleCancel = () => {
    setUpdatedUser({ ...user });
    setEditing(false);
  };

  return (
    <>
      <OrderHeader />
      <div className={styles.container}>
        <h1 className={styles.title}>User Profile</h1>

        {/* User Info */}
        <div className="mb-4">
          <label className="font-semibold">First Name:</label>
          {editing ? (
            <input
              type="text"
              name="firstName"
              value={updatedUser?.firstName || ''}
              onChange={handleChange}
              className="border p-2 w-full"
            />
          ) : (
            <p className="p-2 border">{user.firstName}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="font-semibold">Last Name:</label>
          {editing ? (
            <input
              type="text"
              name="lastName"
              value={updatedUser?.lastName || ''}
              onChange={handleChange}
              className="border p-2 w-full"
            />
          ) : (
            <p className="p-2 border">{user.lastName}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="font-semibold">Email:</label>
          <p className="p-2 border">{user.email}</p> {/* Email is read-only */}
        </div>

        {/* Edit Button */}
        <div className="mb-4">
          {editing ? (
            <div className="flex gap-4">
              <button className={styles.buttonSuccess} onClick={handleSave}>
                Save
              </button>
              <button className={styles.cancelButton} onClick={handleCancel}>
                Cancel
              </button>
            </div>
          ) : (
            <button className={styles.buttonPrimary} onClick={() => setEditing(true)}>
              Edit Name
            </button>
          )}
        </div>

        {/* Payment Methods (Commented Out) */}
        {/* <div className="mb-4">
          <h2 className="font-semibold">Payment Methods</h2>
          <p>Card details are currently hidden.</p>
        </div> */}
      </div>
    </>
  );
};

export default Profile;
