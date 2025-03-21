"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, ArrowLeft, Check } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [email, setEmail] = useState(searchParams.get("email") || "")
  const [verificationCode, setVerificationCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [touched, setTouched] = useState({
    email: false,
    verificationCode: false,
    newPassword: false,
    confirmPassword: false
  })
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [passwordFeedback, setPasswordFeedback] = useState("")

  // Password strength calculation
  useEffect(() => {
    if (!newPassword) {
      setPasswordStrength(0)
      setPasswordFeedback("")
      return
    }

    // Calculate password strength
    let strength = 0
    let feedback = []

    // Length check
    if (newPassword.length >= 8) {
      strength += 25
    } else {
      feedback.push("Password should be at least 8 characters")
    }

    // Uppercase check
    if (/[A-Z]/.test(newPassword)) {
      strength += 25
    } else {
      feedback.push("Include at least one uppercase letter")
    }

    // Lowercase check
    if (/[a-z]/.test(newPassword)) {
      strength += 25
    } else {
      feedback.push("Include at least one lowercase letter")
    }

    // Number or special char check
    if (/[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword)) {
      strength += 25
    } else {
      feedback.push("Include at least one number or special character")
    }

    setPasswordStrength(strength)
    setPasswordFeedback(feedback.join(", "))
  }, [newPassword])

  const getPasswordStrengthLabel = () => {
    if (passwordStrength === 0) return ""
    if (passwordStrength <= 25) return "Weak"
    if (passwordStrength <= 50) return "Fair"
    if (passwordStrength <= 75) return "Good"
    return "Strong"
  }

  const getStrengthColor = () => {
    if (passwordStrength <= 25) return "bg-red-500"
    if (passwordStrength <= 50) return "bg-yellow-500"
    if (passwordStrength <= 75) return "bg-blue-500"
    return "bg-green-500"
  }

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }))
  }

  const validateForm = () => {
    // Mark all fields as touched
    setTouched({
      email: true,
      verificationCode: true,
      newPassword: true,
      confirmPassword: true
    })

    if (!email) {
      setError("Email is required")
      return false
    }

    if (!verificationCode) {
      setError("Verification code is required")
      return false
    }

    if (!newPassword) {
      setError("New password is required")
      return false
    }

    if (passwordStrength < 75) {
      setError("Password is not strong enough: " + passwordFeedback)
      return false
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match")
      return false
    }

    return true
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setError("")
    
    // Validate the form
    if (!validateForm()) {
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const response = await fetch("http://localhost:8080/api/users/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          verificationCode,
          newPassword,
        }),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setSuccessMessage("Your password has been reset successfully")
        
        // Redirect to login page after 3 seconds
        setTimeout(() => {
          router.push("/login")
        }, 3000)
      } else {
        setError(data.error || "Failed to reset password")
      }
    } catch (error) {
      console.error("Error resetting password:", error)
      setError("Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
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
          <CardHeader>
            <CardTitle>Reset Password</CardTitle>
            <CardDescription>
              Enter your verification code and new password
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {successMessage && (
              <Alert className="mb-4 bg-green-50 border-green-200">
                <Check className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-600">{successMessage}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center">
                  Email <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => handleBlur('email')}
                  placeholder="Enter your email"
                  required
                  className={touched.email && !email ? "border-red-500" : ""}
                />
                {touched.email && !email && (
                  <p className="text-xs text-red-500 mt-1">Email is required</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="verification-code" className="flex items-center">
                  Verification Code <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="verification-code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  onBlur={() => handleBlur('verificationCode')}
                  placeholder="Enter the code sent to your email"
                  required
                  className={touched.verificationCode && !verificationCode ? "border-red-500" : ""}
                />
                {touched.verificationCode && !verificationCode && (
                  <p className="text-xs text-red-500 mt-1">Verification code is required</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password" className="flex items-center">
                  New Password <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  onBlur={() => handleBlur('newPassword')}
                  placeholder="Enter new password"
                  required
                  className={touched.newPassword && !newPassword ? "border-red-500" : ""}
                />
                {touched.newPassword && !newPassword && (
                  <p className="text-xs text-red-500 mt-1">New password is required</p>
                )}
                
                {/* Password requirements description */}
                <div className="text-xs text-gray-500 mt-1">
                  Password must be at least 8 characters and include uppercase, lowercase, 
                  and a number or special character.
                </div>
                
                {newPassword && (
                  <div className="space-y-1 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs">Password strength:</span>
                      <span className="text-xs font-medium">{getPasswordStrengthLabel()}</span>
                    </div>
                    <Progress value={passwordStrength} className="h-1" indicatorclassname={getStrengthColor()} />
                    {passwordFeedback && (
                      <p className="text-xs text-gray-500 mt-1">{passwordFeedback}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="flex items-center">
                  Confirm New Password <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onBlur={() => handleBlur('confirmPassword')}
                  placeholder="Confirm new password"
                  required
                  className={touched.confirmPassword && !confirmPassword ? "border-red-500" : ""}
                />
                {touched.confirmPassword && !confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">Please confirm your password</p>
                )}
                {touched.confirmPassword && confirmPassword && newPassword && confirmPassword !== newPassword && (
                  <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full bg-black text-white hover:bg-gray-800"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Resetting..." : "Reset Password"}
              </Button>
            </form>
          </CardContent>
          
          <CardFooter className="flex justify-center">
            <Link href="/login">
              <Button variant="link" className="flex items-center gap-1">
                <ArrowLeft className="h-4 w-4" />
                Back to Login
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
} 