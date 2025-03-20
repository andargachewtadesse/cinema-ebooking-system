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
  cardNumber: string;
  expiration_date: string;
  cvv: string;
  cardholderName: string;
  cardAddress: string; // Optional field
}

const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [editing, setEditing] = useState(false);
  const [updatedUser, setUpdatedUser] = useState<User | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [newPayment, setNewPayment] = useState<PaymentMethod>({
    cardNumber: '',
    expiration_date: '',
    cvv: '',
    cardholderName: '',
    cardAddress: '',
  });

  // Manage editing a payment method
  const [editingPaymentId, setEditingPaymentId] = useState<String | null>(null);
  const [editedCardAddress, setEditedCardAddress] = useState<string>('');

  // Fetch user data
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
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };
    fetchUserProfile();
  }, []);

  // Fetch payment methods
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const paymentResponse = await fetch('http://localhost:8080/api/cards/activeCards');
        if (paymentResponse.ok) {
          const paymentData = await paymentResponse.json();
          setPaymentMethods(paymentData);
        } else {
          console.error('Failed to fetch payment methods');
        }
      } catch (error) {
        console.error('Error fetching payment methods:', error);
      }
    };
    fetchPaymentMethods();
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
      const response = await fetch('http://localhost:8080/api/users/update-details', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: updatedUser.email,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log(result.message);  // "User details updated successfully"
        setUser(updatedUser);        // Update the state with the new details
        setEditing(false);           // Disable editing mode
      } else {
        const error = await response.json();
        console.error(error.error || 'Failed to update user details');
      }
    } catch (error) {
      console.error('Error updating user profile:', error);
    }
  };


  const handleCancel = () => {
    setUpdatedUser({ ...user });
    setEditing(false);
  };

  const handleAddPayment = async () => {
    if (
      newPayment.cardNumber &&
      newPayment.cardholderName &&
      newPayment.expiration_date &&
      newPayment.cvv &&
      newPayment.cardAddress
    ) {
      try {
        const response = await fetch('http://localhost:8080/api/cards/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newPayment),
        });

        if (response.ok) {
          const cardData = await response.json();
          setPaymentMethods((prev) => [
            ...prev,
            cardData, // Add the new card returned from the server
          ]);
          setShowPaymentForm(false);
          setNewPayment({
            cardNumber: '',
            expiration_date: '',
            cvv: '',
            cardholderName: '',
            cardAddress: '',
          });
        } else {
          const errorMessage = await response.text();
          alert(errorMessage); // Display the error message from the server
        }
      } catch (error) {
        console.error('Error adding payment:', error);
        alert('An error occurred while adding the payment method.');
      }
    } else {
      alert('Please fill all the payment details.');
    }
  };

  const handleDeletePayment = async (cardNumber: string) => {
    try {
      const response = await fetch(`http://localhost:8080/api/cards/${cardNumber}`, {
        method: 'DELETE',
      });
  
      if (response.ok) {
        console.log(`Successfully deleted card with ID: ${cardNumber}`);
        setPaymentMethods((prev) => prev.filter((payment) => payment.cardNumber !== cardNumber));
      } else if (response.status === 404) {
        console.error(`No card found with ID: ${cardNumber}`);
        alert("Card not found. It may have already been deleted.");
      } else {
        const errorMessage = await response.text();
        console.error(`Error deleting card: ${errorMessage}`);
        alert(`Failed to delete card: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error deleting payment method:', error);
      alert('An unexpected error occurred while deleting the payment method.');
    }
  };
  

  const handleEditCardAddress = (cardNumber: String, cardAddress: string) => {
    setEditingPaymentId(cardNumber);
    setEditedCardAddress(cardAddress || ''); // pre-fill the address for editing
  };

  const handleSaveCardAddress = (cardNumber: string) => {
    // Send the updated card address to the backend for saving
    fetch(`http://localhost:8080/api/cards/edit/${cardNumber}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(editedCardAddress),
    })
      .then((response) => {
        if (response.ok) {
          // Update the local paymentMethods state to reflect the change
          setPaymentMethods((prev) =>
            prev.map((payment) =>
              payment.cardNumber === cardNumber ? { ...payment, cardAddress: editedCardAddress } : payment
            )
          );
          setEditingPaymentId(null);
        } else {
          alert('Failed to update the card address.');
        }
      })
      .catch((error) => {
        console.error('Error updating card address:', error);
        alert('An error occurred while updating the card address.');
      });
  };
  

  const handleCancelCardAddress = () => {
    setEditingPaymentId(null);
    setEditedCardAddress('');
  };

  return (
    <>
      <OrderHeader />
      <div className={styles.container}>
        <h1 className={styles.title}>User Profile</h1>

        {/* User Info */}
        <div className="mb-4">
          <h2 className="font-semibold">User Information</h2>
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
        </div>

        {/* Payment Methods */}
        <div className="mb-4">
          <h2 className="font-semibold">Payment Methods</h2>
          {paymentMethods.length > 0 ? (
            paymentMethods.map((payment) => (
              <div key={payment.cardNumber} className={`${styles.cardBox} mb-4`}>
                <div className={styles.cardInfo}>
                  <p>Card Holder: {payment.cardholderName}</p>
                  <p>Card Number: {payment.cardNumber}</p>
                  {/* Billing Address Editable */}
                  {editingPaymentId === payment.cardNumber ? (
                    <div>
                      <input
                        type="text"
                        value={editedCardAddress}
                        onChange={(e) => setEditedCardAddress(e.target.value)}
                        placeholder="Billing Address"
                        className="border p-2 w-full"
                      />
                      <div className="flex gap-4 mt-2">
                        <button
                          className={styles.buttonSuccess}
                          onClick={() => handleSaveCardAddress(payment.cardNumber)}
                        >
                          Save Address
                        </button>
                        <button
                          className={styles.cancelButton}
                          onClick={handleCancelCardAddress}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    payment.cardAddress && <p>Address: {payment.cardAddress}</p>
                  )}
                </div>

                <div className={styles.cardActions}>
                  <button
                    className={styles.buttonDanger}
                    onClick={() => handleDeletePayment(payment.cardNumber)}
                  >
                    Delete
                  </button>
                  <button
                    className={styles.buttonPrimary}
                    onClick={() => handleEditCardAddress(payment.cardNumber, payment.cardAddress || '')}
                  >
                    Edit Address
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
                placeholder="CVV"
                value={newPayment.cvv}
                onChange={(e) => setNewPayment({ ...newPayment, cvv: e.target.value })}
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
