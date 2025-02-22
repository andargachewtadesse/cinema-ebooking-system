'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';

const Login = () => {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Track login state

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // CALL BACKEND API TO Login users using email and password.
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const result = await response.json();

    if (response.ok && result.success) {
      // Set login state to true after successful login
      setIsLoggedIn(true);

      // Store login status in localStorage (optional)
      localStorage.setItem('isLoggedIn', 'true');

      alert('Login successful!');
      
      // Redirect to home page
      router.push('/');
    } else {
      // Handle login error
      alert('Login failed: ' + result.message);
    }
  };

  return (
    <>
    <Header/>
    <div className="p-4">
      <h1 className="text-3xl font-bold">Login</h1>
      <form onSubmit={handleLogin} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 w-full"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 w-full"
          required
        />
        <button type="submit" className="bg-blue-600 text-white rounded px-4 py-2">
          Login
        </button>
      </form>
    </div>
    </>
  );
};

export default Login;
