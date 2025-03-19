'use client';

import { useState } from 'react';
import styles from './page.module.css'; // Import the CSS Module
import { OrderHeader } from '@/components/order/OrderHeader';

interface PaymentMethod {
  id: number;
  cardNumber: string;
  expiration: string;
  cardholder: string;
  CVV: string;
}

const Profile = () => {
  // Mock user data
  const [user, setUser] = useState({
    name: 'John Doe',
    email: 'johndoe@example.com',
    paymentMethods: [
      { id: 1, cardNumber: 'Visa **** 1234', expiration: '12/25', cardholder: 'John Doe' },
    ],
    previousOrders: [
      { movie: 'Inception', date: '2024-02-20', seats: ['A1', 'A2'] },
      { movie: 'Interstellar', date: '2024-02-18', seats: ['B5', 'B6'] },
    ],
  });

  const [hoveredPayment, setHoveredPayment] = useState<number | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [newPayment, setNewPayment] = useState<PaymentMethod>({
    id: Date.now(),
    cardNumber: '',
    expiration: '',
    cardholder: '',
    CVV: '',
  });

  const [editing, setEditing] = useState(false); // Track edit mode
  const [updatedUser, setUpdatedUser] = useState({ ...user }); // Temporary changes during editing

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUpdatedUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Save changes
  const handleSave = () => {
    setUser(updatedUser); // Save updated user data
    setEditing(false); // Exit edit mode
  };

  // Cancel editing
  const handleCancel = () => {
    setUpdatedUser({ ...user }); // Reset to original user data
    setEditing(false); // Exit edit mode
  };

  // Format card number as "Visa **** 1234 - MM/YY"
  const formatCardDisplay = (cardNumber: string, expiration: string) => {
    const lastFour = cardNumber.slice(-4);
    return `Visa **** ${lastFour} - ${expiration}`;
  };

  const handleDeletePayment = (id: number) => {
    if (confirm('Are you sure you want to delete this payment method?')) {
      setUser((prev) => ({
        ...prev,
        paymentMethods: prev.paymentMethods.filter((payment) => payment.id !== id),
      }));
    }
  };

  const handleAddPayment = () => {
    const formattedCard = formatCardDisplay(newPayment.cardNumber, newPayment.expiration);
    setUser((prev) => ({
      ...prev,
      paymentMethods: [...prev.paymentMethods, { ...newPayment, id: Date.now(), cardNumber: formattedCard }],
    }));
    setShowPaymentForm(false);
    setNewPayment({ id: Date.now(), cardNumber: '', expiration: '', cardholder: '', CVV: '' });
  };

  return (
    <>
      <OrderHeader />
      <div className={styles.container}>
        <h1 className={styles.title}>User Profile</h1>

        {/* User Info */}
        <div className="mb-4">
          <label className="font-semibold">Name:</label>
          {editing ? (
            <input
              type="text"
              name="name"
              value={updatedUser.name}
              onChange={handleChange}
              className="border p-2 w-full"
            />
          ) : (
            <p className="p-2 border">{user.name}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="font-semibold">Email:</label>
          {editing ? (
            <input
              type="email"
              name="email"
              value={updatedUser.email}
              onChange={handleChange}
              className="border p-2 w-full"
            />
          ) : (
            <p className="p-2 border">{user.email}</p>
          )}
        </div>

        {/* Edit Button (Right After Email Input) */}
        <div className="mb-4">
          {editing ? (
            <div className="flex gap-4">
              <button
                className={styles.buttonSuccess}
                onClick={handleSave}
              >
                Save
              </button>
              <button
                className={styles.cancelButton}
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              className={styles.buttonPrimary}
              onClick={() => setEditing(true)}
            >
              Edit Name & Email
            </button>
          )}
        </div>

        {/* Payments Section */}
        <div className={styles.mb6}>
          <h2 className={styles.label}>Payment Methods</h2>
          <div className={styles.spaceY2}>
            {user.paymentMethods.map((payment) => (
              <div
                key={payment.id}
                className={styles.paymentMethod}
                onMouseEnter={() => setHoveredPayment(payment.id)}
                onMouseLeave={() => setHoveredPayment(null)}
              >
                <p>{payment.cardNumber}</p>
                {hoveredPayment === payment.id && (
                  <div className={styles.hoverActions}>
                    <button className={styles.buttonPrimary}>Edit</button>
                    <button
                      className={styles.buttonDanger}
                      onClick={() => handleDeletePayment(payment.id)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

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
                value={newPayment.cardholder}
                onChange={(e) => setNewPayment({ ...newPayment, cardholder: e.target.value })}
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
                value={newPayment.expiration}
                onChange={(e) => setNewPayment({ ...newPayment, expiration: e.target.value })}
                className={styles.inputField}
              />
              <input
                type="text"
                placeholder="CVV"
                value={newPayment.CVV}
                onChange={(e) => setNewPayment({ ...newPayment, CVV: e.target.value })}
                className={styles.inputField}
              />

              <div className={styles.flex}>
                <button
                  className={styles.buttonSuccess}
                  onClick={handleAddPayment}
                >
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

        {/* Previous Orders */}
        <div className={styles.mb6}>
          <h2 className={styles.label}>Previous Orders</h2>
          {user.previousOrders.length > 0 ? (
            <ul className={styles.previousOrders}>
              {user.previousOrders.map((order, index) => (
                <li key={index} className={styles.orderItem}>
                  <p><strong>Movie:</strong> {order.movie}</p>
                  <p><strong>Date:</strong> {order.date}</p>
                  <p><strong>Seats:</strong> {order.seats.join(', ')}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.p2}>No previous orders.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default Profile;