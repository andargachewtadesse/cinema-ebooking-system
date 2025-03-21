"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [resetEmail, setResetEmail] = useState("")
  const [error, setError] = useState("")
  const [resetSent, setResetSent] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }
  
    try {
      const response = await fetch("http://localhost:8080/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, rememberMe }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        console.log("Login successful:", data);
        setError("");
        
        // Store authentication data differently based on remember me
        if (rememberMe) {
          // For long-term storage, use localStorage
          localStorage.setItem("authToken", data.token);
          localStorage.setItem("user", JSON.stringify({
            userId: data.userId,
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName
          }));
        } else {
          // For session-only storage, use sessionStorage
          sessionStorage.setItem("authToken", data.token);
          sessionStorage.setItem("user", JSON.stringify({
            userId: data.userId,
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName
          }));
        }
        
        // Redirect to home page or dashboard
        window.location.href = "/";
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Something went wrong. Please try again.");
    }
  };
  

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resetEmail) {
      setError("Please enter your email address")
      return
    }
    
    try {
      const response = await fetch("http://localhost:8080/api/users/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: resetEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        setError("")
        setResetSent(true)
      } else {
        setError(data.error || "Failed to send reset link")
      }
    } catch (err) {
      console.error("Password reset error:", err)
      setError("Something went wrong. Please try again.")
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="flex items-center justify-between mb-12">
        <Link href="/">
          <h1 className="text-2xl font-bold">Bulldawgs Cinema</h1>
        </Link>
        <div className="flex gap-4">
          <Link href="/login">
            <Button variant="ghost">Login</Button>
          </Link>
          <Link href="/signup">
            <Button className="bg-black text-white hover:bg-gray-800">Sign Up</Button>
          </Link>
        </div>
      </header>

      <div className="flex justify-center">
        <Card className="w-full max-w-md">
          <Tabs defaultValue="login">
            <CardHeader>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="reset">Forgot Password</TabsTrigger>
              </TabsList>
            </CardHeader>

            <TabsContent value="login">
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="flex items-center space-x-2 my-2">
                    <Checkbox 
                      id="remember" 
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked === true)}
                    />
                    <label
                      htmlFor="remember"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Remember me
                    </label>
                  </div>

                  <Button type="submit" className="w-full bg-black text-white hover:bg-gray-800">
                    Login
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="flex flex-col items-center">
                <p className="text-sm text-gray-500">
                  Don&apos;t have an account?{" "}
                  <Link href="/signup" className="text-blue-600 hover:underline">
                    Sign up
                  </Link>
                </p>
              </CardFooter>
            </TabsContent>

            <TabsContent value="reset">
              <CardContent>
                <form onSubmit={handlePasswordReset} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {resetSent ? (
                    <Alert>
                      <AlertDescription>
                        If an account exists with this email, you will receive password reset instructions shortly.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <>
                      <CardDescription>
                        Enter your email address and we&apos;ll send you a link to reset your password.
                      </CardDescription>

                      <div className="space-y-2">
                        <Label htmlFor="reset-email">Email</Label>
                        <Input
                          id="reset-email"
                          type="email"
                          placeholder="your.email@example.com"
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          required
                        />
                      </div>

                      <Button type="submit" className="w-full bg-black text-white hover:bg-gray-800">
                        Send Reset Link
                      </Button>
                    </>
                  )}
                </form>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button variant="link" onClick={() => setResetSent(false)}>
                  Back to login
                </Button>
              </CardFooter>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  )
}

