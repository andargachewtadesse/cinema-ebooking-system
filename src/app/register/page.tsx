'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const Register: React.FC = () => {
  const router = useRouter();

  // State for SignUp details
  const [fName, setfName] = useState('');
  const [lName, setlName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const userData = {
      fName,
      lName,
      email,
      password,
    };

    try {
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const result = await response.json();
      if (result.success) {
        alert('Sign up successful!');
        router.push('/');
      } else {
        alert('Error signing up: ' + result.message);
      }
    } catch (error) {
      console.error('Error submitting signup:', error);
      alert('An unexpected error occurred.');
    }
  };

  return (
    <div className="p-4">
      <div>
        <h2 className="text-3xl font-bold">Sign Up</h2>
        <form onSubmit={handleSignUpSubmit} className="space-y-4">
          <div>
            <label>First Name:</label>
            <input
              type="text"
              value={fName}
              onChange={(e) => setfName(e.target.value)}
              className="border p-2 w-full"
              required
            />
          </div>
          <div>
            <label>Last Name:</label>
            <input
              type="text"
              value={lName}
              onChange={(e) => setlName(e.target.value)}
              className="border p-2 w-full"
              required
            />
          </div>
          <div>
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border p-2 w-full"
              required
            />
          </div>
          <div>
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border p-2 w-full"
              required
            />
          </div>
          <div>
            <button className="bg-blue-600 text-white rounded px-4 py-2" type="submit">
              Finish
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;