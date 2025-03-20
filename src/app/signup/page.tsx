"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertCircle, PlusCircle, MinusCircle, CreditCard, ChevronDown, ChevronUp } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Progress } from "@/components/ui/progress"
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const [step, setStep] = useState(1)
  const [error, setError] = useState("")
  const [verificationSent, setVerificationSent] = useState(false)

  // Personal Information
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [subscribeToPromotions, setSubscribeToPromotions] = useState(false)

  // Address Information (Optional)
  const [street, setStreet] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [zipCode, setZipCode] = useState("")

  // Payment Information (Optional)
  const [paymentMethods, setPaymentMethods] = useState<
    Array<{
      id: string
      cardType: string
      cardNumber: string
      expirationMonth: string
      expirationYear: string
      cvv: string
      isOpen: boolean
      billingAddressSame: boolean
      billingStreet: string
      billingCity: string
      billingState: string
      billingZipCode: string
    }>
  >([])

  // Add state for password
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [passwordErrors, setPasswordErrors] = useState<string[]>([])

  // Verification
  const [verificationCode, setVerificationCode] = useState("")

  const router = useRouter()

  const handlePersonalInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate personal information
    if (!firstName || !lastName || !email || !phone || !password || !confirmPassword) {
      setError("Please fill in all required fields")
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address")
      return
    }

    // Phone number validation - must be exactly 10 digits
    const phoneClean = phone.replace(/\D/g, "")
    if (phoneClean.length !== 10) {
      setError("Phone number must be 10 digits")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    // Password strength validation
    const errors = validatePassword(password)
    if (errors.length > 0) {
      setError("Password does not meet security requirements")
      return
    }

    setError("")
    setStep(2)
  }

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Address is optional - without validation
    setError("")
    setStep(3)
  }

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate payment information if user added any
    if (paymentMethods.length > 0) {
      for (const method of paymentMethods) {
        if (
          !method.cardType ||
          !method.cardNumber ||
          !method.expirationMonth ||
          !method.expirationYear ||
          !method.cvv
        ) {
          setError("Please fill in all payment fields")
          return
        }

        // Improved card number validation - remove spaces and check length
        const cardNumClean = method.cardNumber.replace(/\s/g, "")
        if (!/^\d{16}$/.test(cardNumClean)) {
          setError("Card number must be exactly 16 digits")
          return
        }

        // Improved CVV validation based on card type
        if (method.cardType === "amex") {
          // American Express uses 4-digit CVV
          if (!/^\d{4}$/.test(method.cvv)) {
            setError("American Express cards require a 4-digit CVV")
            return
          }
        } else {
          // Other card types use 3-digit CVV
          if (!/^\d{3}$/.test(method.cvv)) {
            setError("Please enter a valid 3-digit CVV")
            return
          }
        }

        // Validate billing address if not same as shipping
        if (!method.billingAddressSame) {
          if (!method.billingStreet || !method.billingCity || !method.billingState || !method.billingZipCode) {
            setError("Please fill in all billing address fields")
            return
          }
        }
      }
    }

    try {
      // Create user data object
      const userData = {
        firstName: firstName,
        lastName: lastName,
        email: email,
        phone: phone,
        password: password,
        promotionSubscription: subscribeToPromotions,
        address: street ? {
          street: street,
          city: city,
          state: state,
          zipCode: zipCode
        } : null,
      }

      // Send signup request to API
      const response = await fetch('/api/users/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.error || "Registration failed. Please try again.")
        return
      }

      // Get the user ID from the response
      const responseData = await response.json()
      const userId = responseData.userId

      // If there are payment methods, register them with the specific user ID
      if (paymentMethods.length > 0 && userId) {
        for (const method of paymentMethods) {
          // Determine the billing address
          const billingAddress = method.billingAddressSame
            ? `${street}, ${city}, ${state} ${zipCode}`
            : `${method.billingStreet}, ${method.billingCity}, ${method.billingState} ${method.billingZipCode}`

          // Format expiration date
          const expirationDate = `${method.expirationMonth}/${method.expirationYear.slice(-2)}`

          // Prepare card data
          const cardData = {
            cardholderName: `${firstName} ${lastName}`,
            cardNumber: method.cardNumber.replace(/\s/g, ""),
            cvv: method.cvv,
            cardAddress: billingAddress,
            expiration_date: expirationDate,
          }

          // Send card registration request with user ID
          const cardResponse = await fetch('/api/cards/register-with-user', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              cardData,
              userId
            }),
          })

          if (!cardResponse.ok) {
            console.error("Failed to register payment method:", await cardResponse.text())
            // Continue with verification even if card registration fails
          }
        }
      }

      // Signup successful, proceed to verification step
      setError("")
      setVerificationSent(true)
      setStep(4)
    } catch (error) {
      console.error("Signup error:", error)
      setError("An error occurred during registration. Please try again.")
    }
  }

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!verificationCode) {
      setError("Please enter the verification code")
      return
    }

    try {
      // Send verification request to the backend
      const response = await fetch('/api/users/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          verificationCode: verificationCode
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.error || "Verification failed. Please check your code and try again.")
        return
      }

      // Verification successful
      setError("")
      
      // Redirect to the confirmation page
      router.push('/signup/confirmation')
    } catch (error) {
      console.error("Verification error:", error)
      setError("An error occurred during verification. Please try again.")
    }
  }

  const renderStepIndicator = () => {
    return (
      <div className="flex justify-center mb-6">
        <div className="flex items-center">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center">
              <div
                className={`rounded-full h-8 w-8 flex items-center justify-center ${
                  i === step ? "bg-black text-white" : i < step ? "bg-green-500 text-white" : "bg-gray-200"
                }`}
              >
                {i < step ? "✓" : i}
              </div>
              {i < 4 && <div className={`h-1 w-10 ${i < step ? "bg-green-500" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>
      </div>
    )
  }

  const validatePassword = (password: string): string[] => {
    const errors: string[] = []

    if (password.length < 8) {
      errors.push("Password must be at least 8 characters long")
    }

    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter")
    }

    if (!/[0-9]/.test(password)) {
      errors.push("Password must contain at least one number")
    }

    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
      errors.push("Password must contain at least one special character")
    }

    return errors
  }

  const calculatePasswordStrength = (password: string): number => {
    if (!password) return 0

    let strength = 0

    // Length check
    if (password.length >= 8) strength += 25

    // Character type checks
    if (/[A-Z]/.test(password)) strength += 25
    if (/[0-9]/.test(password)) strength += 25
    if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) strength += 25

    return strength
  }

  const addPaymentMethod = () => {
    if (paymentMethods.length >= 3) {
      setError("You can only add up to three payment methods")
      return
    }

    setPaymentMethods([
      ...paymentMethods,
      {
        id: Date.now().toString(),
        cardType: "",
        cardNumber: "",
        expirationMonth: "",
        expirationYear: "",
        cvv: "",
        isOpen: true,
        billingAddressSame: true,
        billingStreet: street,
        billingCity: city,
        billingState: state,
        billingZipCode: zipCode,
      },
    ])
  }

  const removePaymentMethod = (id: string) => {
    setPaymentMethods(paymentMethods.filter((method) => method.id !== id))
  }

  const updatePaymentMethod = (id: string, field: string, value: any) => {
    setPaymentMethods(paymentMethods.map((method) => (method.id === id ? { ...method, [field]: value } : method)))
  }

  const togglePaymentMethod = (id: string) => {
    setPaymentMethods(
      paymentMethods.map((method) => (method.id === id ? { ...method, isOpen: !method.isOpen } : method)),
    )
  }

  // Add a helper function to format card number with spaces
  const formatCardNumber = (value: string): string => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    const matches = v.match(/\d{4,16}/g)
    const match = matches && matches[0] || ""
    const parts = []
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    
    if (parts.length) {
      return parts.join(" ")
    } else {
      return value
    }
  }

  // Add this to handle card number input
  const handleCardNumberChange = (id: string, value: string) => {
    const formattedValue = formatCardNumber(value)
    updatePaymentMethod(id, "cardNumber", formattedValue)
  }

  // Add a helper function to format phone number
  const formatPhoneNumber = (value: string): string => {
    const phoneNumber = value.replace(/\D/g, "")
    const phoneNumberLength = phoneNumber.length
    
    if (phoneNumberLength < 4) return phoneNumber
    if (phoneNumberLength < 7) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`
    }
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`
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
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-center">Create Your Account</CardTitle>
            <CardDescription className="text-center">
              {step === 1 && "Step 1: Personal Information"}
              {step === 2 && "Step 2: Address Information (Optional)"}
              {step === 3 && "Step 3: Payment Information (Optional)"}
              {step === 4 && "Step 4: Verify Your Email"}
            </CardDescription>
            {renderStepIndicator()}
          </CardHeader>

          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {step === 1 && (
              <form onSubmit={handlePersonalInfoSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <p className="text-xs text-gray-500">This will be your login username and cannot be changed later</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(123) 456-7890"
                    value={phone}
                    onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
                    maxLength={14}
                    required
                  />
                  <p className="text-xs text-gray-500">Format: (123) 456-7890</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => {
                        const newPassword = e.target.value
                        setPassword(newPassword)
                        setPasswordStrength(calculatePasswordStrength(newPassword))
                        setPasswordErrors(validatePassword(newPassword))
                      }}
                      required
                    />
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Strength:</span>
                        <span>
                          {passwordStrength === 0 && "Very Weak"}
                          {passwordStrength === 25 && "Weak"}
                          {passwordStrength === 50 && "Medium"}
                          {passwordStrength === 75 && "Strong"}
                          {passwordStrength === 100 && "Very Strong"}
                        </span>
                      </div>
                      <Progress value={passwordStrength} className="h-2" />
                      <div className="text-xs text-gray-500">
                        Password must contain:
                        <ul className="list-disc pl-5 mt-1">
                          <li className={password.length >= 8 ? "text-green-500" : ""}>At least 8 characters</li>
                          <li className={/[A-Z]/.test(password) ? "text-green-500" : ""}>
                            At least one uppercase letter
                          </li>
                          <li className={/[0-9]/.test(password) ? "text-green-500" : ""}>At least one number</li>
                          <li className={/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password) ? "text-green-500" : ""}>
                            At least one special character
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    {password && confirmPassword && password !== confirmPassword && (
                      <p className="text-xs text-red-500">Passwords do not match</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="subscribeToPromotions"
                    checked={subscribeToPromotions}
                    onCheckedChange={(checked) => setSubscribeToPromotions(checked as boolean)}
                  />
                  <Label htmlFor="subscribeToPromotions">Subscribe to promotions and special offers</Label>
                </div>

                <Button type="submit" className="w-full bg-black text-white hover:bg-gray-800">
                  Continue
                </Button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleAddressSubmit} className="space-y-4">
                <p className="text-sm text-gray-500 mb-4">
                  Address information is optional. You can skip this step if you prefer.
                </p>

                <div className="space-y-2">
                  <Label htmlFor="street">Street Address</Label>
                  <Input id="street" value={street} onChange={(e) => setStreet(e.target.value)} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input id="state" value={state} onChange={(e) => setState(e.target.value)} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input id="zipCode" value={zipCode} onChange={(e) => setZipCode(e.target.value)} />
                </div>

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button type="submit" className="bg-black text-white hover:bg-gray-800">
                    Continue
                  </Button>
                </div>
              </form>
            )}

            {step === 3 && (
              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                <p className="text-sm text-gray-500 mb-4">
                  Adding a payment method is optional. You can add up to three payment methods.
                </p>

                {paymentMethods.length === 0 ? (
                  <div className="flex justify-center mb-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addPaymentMethod}
                      className="flex items-center gap-2"
                    >
                      <PlusCircle className="h-4 w-4" />
                      Add Payment Method
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {paymentMethods.map((method, index) => (
                      <Collapsible key={method.id} open={method.isOpen} className="border rounded-md p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5" />
                            <h3 className="font-medium">
                              {method.cardType || "Payment Method"} {index + 1}
                              {method.cardNumber && ` - xxxx-${method.cardNumber.slice(-4)}`}
                            </h3>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removePaymentMethod(method.id)}
                            >
                              <MinusCircle className="h-4 w-4" />
                            </Button>
                            <CollapsibleTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => togglePaymentMethod(method.id)}
                              >
                                {method.isOpen ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </Button>
                            </CollapsibleTrigger>
                          </div>
                        </div>

                        <CollapsibleContent className="mt-4 space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor={`cardType-${method.id}`}>Card Type</Label>
                            <Select
                              value={method.cardType}
                              onValueChange={(value) => updatePaymentMethod(method.id, "cardType", value)}
                            >
                              <SelectTrigger id={`cardType-${method.id}`}>
                                <SelectValue placeholder="Select card type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="visa">Visa</SelectItem>
                                <SelectItem value="mastercard">Mastercard</SelectItem>
                                <SelectItem value="amex">American Express</SelectItem>
                                <SelectItem value="discover">Discover</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`cardNumber-${method.id}`}>Card Number</Label>
                            <Input
                              id={`cardNumber-${method.id}`}
                              placeholder="1234 5678 9012 3456"
                              value={method.cardNumber}
                              onChange={(e) => handleCardNumberChange(method.id, e.target.value)}
                              maxLength={19}
                            />
                            <p className="text-xs text-gray-500">16 digits required</p>
                          </div>

                          <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor={`expirationMonth-${method.id}`}>Expiration Month</Label>
                              <Select
                                value={method.expirationMonth}
                                onValueChange={(value) => updatePaymentMethod(method.id, "expirationMonth", value)}
                              >
                                <SelectTrigger id={`expirationMonth-${method.id}`}>
                                  <SelectValue placeholder="MM" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Array.from({ length: 12 }, (_, i) => {
                                    const month = (i + 1).toString().padStart(2, "0")
                                    return (
                                      <SelectItem key={month} value={month}>
                                        {month}
                                      </SelectItem>
                                    )
                                  })}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor={`expirationYear-${method.id}`}>Expiration Year</Label>
                              <Select
                                value={method.expirationYear}
                                onValueChange={(value) => updatePaymentMethod(method.id, "expirationYear", value)}
                              >
                                <SelectTrigger id={`expirationYear-${method.id}`}>
                                  <SelectValue placeholder="YYYY" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Array.from({ length: 10 }, (_, i) => {
                                    const year = (new Date().getFullYear() + i).toString()
                                    return (
                                      <SelectItem key={year} value={year}>
                                        {year}
                                      </SelectItem>
                                    )
                                  })}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor={`cvv-${method.id}`}>CVV</Label>
                              <Input
                                id={`cvv-${method.id}`}
                                placeholder={method.cardType === "amex" ? "1234" : "123"}
                                value={method.cvv}
                                onChange={(e) => {
                                  const value = e.target.value.replace(/\D/g, "")
                                  updatePaymentMethod(method.id, "cvv", value)
                                }}
                                maxLength={method.cardType === "amex" ? 4 : 3}
                              />
                              <p className="text-xs text-gray-500">
                                {method.cardType === "amex" ? "4 digits (Amex)" : "3 digits"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`billingAddressSame-${method.id}`}
                              checked={method.billingAddressSame}
                              onCheckedChange={(checked) =>
                                updatePaymentMethod(method.id, "billingAddressSame", checked as boolean)
                              }
                            />
                            <Label htmlFor={`billingAddressSame-${method.id}`}>
                              Billing address is the same as shipping address
                            </Label>
                          </div>

                          {!method.billingAddressSame && (
                            <div className="space-y-4 mt-4 border-t pt-4">
                              <h4 className="font-medium">Billing Address</h4>

                              <div className="space-y-2">
                                <Label htmlFor={`billingStreet-${method.id}`}>Street Address</Label>
                                <Input
                                  id={`billingStreet-${method.id}`}
                                  value={method.billingStreet}
                                  onChange={(e) => updatePaymentMethod(method.id, "billingStreet", e.target.value)}
                                />
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor={`billingCity-${method.id}`}>City</Label>
                                  <Input
                                    id={`billingCity-${method.id}`}
                                    value={method.billingCity}
                                    onChange={(e) => updatePaymentMethod(method.id, "billingCity", e.target.value)}
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor={`billingState-${method.id}`}>State</Label>
                                  <Input
                                    id={`billingState-${method.id}`}
                                    value={method.billingState}
                                    onChange={(e) => updatePaymentMethod(method.id, "billingState", e.target.value)}
                                  />
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor={`billingZipCode-${method.id}`}>ZIP Code</Label>
                                <Input
                                  id={`billingZipCode-${method.id}`}
                                  value={method.billingZipCode}
                                  onChange={(e) => updatePaymentMethod(method.id, "billingZipCode", e.target.value)}
                                />
                              </div>
                            </div>
                          )}
                        </CollapsibleContent>
                      </Collapsible>
                    ))}

                    {paymentMethods.length < 3 && (
                      <div className="flex justify-center">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={addPaymentMethod}
                          className="flex items-center gap-2"
                        >
                          <PlusCircle className="h-4 w-4" />
                          Add Another Payment Method
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => setStep(2)}>
                    Back
                  </Button>
                  <Button type="submit" className="bg-black text-white hover:bg-gray-800">
                    {paymentMethods.length > 0 ? "Continue" : "Skip & Continue"}
                  </Button>
                </div>
              </form>
            )}

            {step === 4 && (
              <form onSubmit={handleVerificationSubmit} className="space-y-4">
                {verificationSent ? (
                  <>
                    <Alert className="mb-4">
                      <AlertDescription>
                        A verification code has been sent to your email address. Please check your inbox and enter the
                        code below.
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-2">
                      <Label htmlFor="verificationCode">Verification Code</Label>
                      <Input
                        id="verificationCode"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        required
                      />
                    </div>

                    <Button type="submit" className="w-full bg-black text-white hover:bg-gray-800">
                      Verify & Complete Registration
                    </Button>

                    <p className="text-sm text-center text-gray-500">
                      Didn&apos;t receive the code?{" "}
                      <Button variant="link" className="p-0 h-auto" onClick={() => setVerificationSent(false)}>
                        Resend
                      </Button>
                    </p>
                  </>
                ) : (
                  <div className="flex justify-center">
                    <div className="text-center">
                      <div className="mb-4">Sending verification code...</div>
                      {}
                    </div>
                  </div>
                )}
              </form>
            )}
          </CardContent>

          <CardFooter className="flex justify-center">
            <p className="text-sm text-gray-500">
              {step < 4 ? (
                <>
                  Already have an account?{" "}
                  <Link href="/login" className="text-blue-600 hover:underline">
                    Login
                  </Link>
                </>
              ) : (
                <>
                  By completing registration, you agree to our{" "}
                  <Link href="/terms" className="text-blue-600 hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-blue-600 hover:underline">
                    Privacy Policy
                  </Link>
                </>
              )}
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

