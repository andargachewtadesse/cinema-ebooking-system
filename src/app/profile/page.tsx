'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import { OrderHeader } from '@/components/order/OrderHeader';

interface User {
  firstName: string;
  lastName: string;
  email: string;
}

interface PaymentMethod {
  id: number;
  cardNumber: string;
  expiration_date: string;
  cardholderName: string;
  cardAddress?: string; // Optional field
}

const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [editing, setEditing] = useState(false);
  const [updatedUser, setUpdatedUser] = useState<User | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [newPayment, setNewPayment] = useState<PaymentMethod>({
    id: Date.now(),
    cardNumber: '',
    expiration_date: '',
    cardholderName: '',
  });

  // Fetch user data and payment methods on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userResponse = await fetch('http://localhost:8080/api/users/profileLoad');
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData);
          setUpdatedUser(userData);
        } else {
          console.error('Failed to fetch user profile');
        }

        // Fetch active payment methods
        const paymentResponse = await fetch('http://localhost:8080/api/cards/activeCards');
        if (paymentResponse.ok) {
          const paymentData = await paymentResponse.json();
          setPaymentMethods(paymentData);
        } else {
          console.error('Failed to fetch payment methods');
        }
      } catch (error) {
        console.error('Error fetching profile or payment methods:', error);
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

  const handleAddPayment = () => {
    setPaymentMethods((prev) => [
      ...prev,
      { ...newPayment, id: Date.now() },
    ]);
    setShowPaymentForm(false);
    setNewPayment({
      id: Date.now(),
      cardNumber: '',
      expiration_date: '',
      cardholderName: '',
    });
  };

  const handleDeletePayment = (id: number) => {
    setPaymentMethods((prev) => prev.filter((payment) => payment.id !== id));
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

        {/* Payment Methods */}
        <div className="mb-4">
          <h2 className="font-semibold">Payment Methods</h2>
          {paymentMethods.length > 0 ? (
            paymentMethods.map((payment) => (
              <div key={payment.id} className={`${styles.cardBox} mb-4`}>
                <div className={styles.cardInfo}>
                  <p>Card Holder: {payment.cardholderName}</p>
                  <p>Card Number: {payment.cardNumber}</p>
                  <p>Expires: {payment.expiration_date}</p>
                  {payment.cardAddress && <p>Address: {payment.cardAddress}</p>}
                </div>

                <div className={styles.cardActions}>
                  <button
                    className={styles.buttonDanger}
                    onClick={() => handleDeletePayment(payment.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p>No payment methods available.</p>
          )}

          <button
            className={styles.buttonPrimary}
            onClick={() => setShowPaymentForm(true)}
          >
            Add Payment Method
          </button>

          {/* Add Payment Form */}
          {showPaymentForm && (
            <div className={`${styles.p4} ${styles.border} ${styles.rounded}`}>
              <h3 className={styles.label}>New Payment Method</h3>
              <input
                type="text"
                placeholder="Cardholder's Name"
                value={newPayment.cardholderName}
                onChange={(e) => setNewPayment({ ...newPayment, cardholderName: e.target.value })}
                className={styles.inputField}
              />
              <input
                type="text"
                placeholder="Card Number"
                value={newPayment.cardNumber}
                onChange={(e) => setNewPayment({ ...newPayment, cardNumber: e.target.value })}
                className={styles.inputField}
              />
              <input
                type="text"
                placeholder="Expiration Date (MM/YY)"
                value={newPayment.expiration_date}
                onChange={(e) => setNewPayment({ ...newPayment, expiration_date: e.target.value })}
                className={styles.inputField}
              />
              <input
                type="text"
                placeholder="Card Address"
                value={newPayment.cardAddress || ''}
                onChange={(e) => setNewPayment({ ...newPayment, cardAddress: e.target.value })}
                className={styles.inputField}
              />

              <div className={styles.flex}>
                <button className={styles.buttonSuccess} onClick={handleAddPayment}>
                  Save Payment
                </button>
                <button
                  className={styles.cancelButton}
                  onClick={() => setShowPaymentForm(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Profile;
