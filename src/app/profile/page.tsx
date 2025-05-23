"use client"

import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation'
import { isAuthenticated } from "@/utils/auth"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { CreditCard, User, MapPin, Lock, PlusCircle, Edit, Trash2, Ticket, Calendar, Clock } from "lucide-react"
import { OrderHeader } from "@/components/order/OrderHeader"
import { useUserProfile } from "@/hooks/useUserProfile"
import { usePaymentCards } from "@/hooks/usePaymentCards"
import { useUserOrders } from "@/hooks/useUserOrders"
import { Skeleton } from "@/components/ui/skeleton"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { format } from "date-fns"

export default function Profile() {
  const router = useRouter()
  const [editingPersonal, setEditingPersonal] = useState(false)
  const [editingAddress, setEditingAddress] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    streetAddress: "",
    city: "",
    state: "",
    zipCode: "",
    promotionSubscription: false
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newCard, setNewCard] = useState({
    cardholderName: "",
    cardNumber: "",
    expirationDate: "",
    cvv: "",
    cardAddress: ""
  })
  const [cardErrors, setCardErrors] = useState({
    cardholderName: "",
    cardNumber: "",
    expirationDate: "",
    cvv: ""
  })
  const [editingCard, setEditingCard] = useState<{id: number, address: string} | null>(null);
  
  const { profile, loading: profileLoading, error: profileError, updateProfileLocally } = useUserProfile();
  const { cards, loading: cardsLoading, error: cardsError, refreshCards } = usePaymentCards();
  const { bookings, loading: bookingsLoading, error: bookingsError } = useUserOrders();
  
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [passwordErrors, setPasswordErrors] = useState<string[]>([])
  const [passwordChanging, setPasswordChanging] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Format date for nicer display
  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return format(date, "MMM d, yyyy");
    } catch (e: any) {
      return dateString;
    }
  };

  // Format time for nicer display
  const formatTime = (timeString: string | null | undefined): string => {
    if (!timeString) return "N/A";
    try {
      // Handle HH:MM:SS format
      const parts = timeString.split(':');
      const hours = parseInt(parts[0]);
      const minutes = parts[1];
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12; // Convert 0 to 12 for 12 AM
      return `${displayHours}:${minutes} ${ampm}`;
    } catch (e: any) {
      return timeString;
    }
  };

  // Check authentication first and redirect if not logged in
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/signup')
    }
  }, [router])

  // Update form data when profile is loaded
  useEffect(() => {
    if (profile) {
      console.log("Profile data loaded:", profile);
      setFormData({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        streetAddress: profile.streetAddress || "",
        city: profile.city || "",
        state: profile.state || "",
        zipCode: profile.zipCode || "",
        promotionSubscription: profile.promotionSubscription === true
      });
    }
  }, [profile]);

  const handlePersonalInfoChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const savePersonalInfo = async () => {
    try {
      setIsSubmitting(true);
      const response = await fetch("http://localhost:8080/api/users/update-details", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: profile.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          promotionSubscription: formData.promotionSubscription
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update personal information");
      }

      // Instead of reloading the page, update the profile data locally
      updateProfileLocally({
        firstName: formData.firstName,
        lastName: formData.lastName,
        promotionSubscription: formData.promotionSubscription
      });
      
      setEditingPersonal(false);
      alert("Personal information updated successfully!");
      
    } catch (error) {
      console.error("Error updating personal info:", error);
      alert("Failed to update personal information. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveAddressInfo = async () => {
    try {
      setIsSubmitting(true);
      
      console.log("Updating address with data:", formData);
      
      // Use the email from the profile data that's already loaded
      if (!profile || !profile.email) {
        throw new Error("Profile data not available");
      }
      
      const userEmail = profile.email;
      console.log("Using email from profile:", userEmail);
      
      // Add debugging to see the actual request payload
      const requestBody = {
        email: userEmail,
        streetAddress: formData.streetAddress,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode
      };
      console.log("Sending request body:", requestBody);
      
      // Now use the email to update the user
      const updateResponse = await fetch("http://localhost:8080/api/users/update-address", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
      
      if (!updateResponse.ok) {
        const errorText = await updateResponse.text();
        console.error("Server response:", errorText);
        throw new Error(`Failed to update address: ${errorText}`);
      }
      
      const responseData = await updateResponse.json();
      console.log("Server response:", responseData);
      
      // Update the profile data in state (without reloading)
      updateProfileLocally({
        streetAddress: formData.streetAddress,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode
      });
      
      alert("Address updated successfully!");
    } catch (error) {
      console.error("Error updating address info:", error);
      alert(`Failed to update address information: ${error.message}`);
    } finally {
      setIsSubmitting(false);
      setEditingAddress(false);
    }
  };

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

  const handleChangePassword = async () => {
    setPasswordChanging(true)
    setError("") // Clear previous errors
    setSuccess("") // Clear previous success message
    
    // Check if new password and confirm password match
    if (newPassword !== confirmNewPassword) {
      setError("New passwords do not match")
      setPasswordChanging(false)
      return
    }
    
    // Validate password strength
    const errors = validatePassword(newPassword)
    if (errors.length > 0) {
      setError("New password does not meet security requirements")
      setPasswordChanging(false)
      return
    }

    try {
      // Change the endpoint to the correct backend URL
      const response = await fetch('http://localhost:8080/api/users/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          oldPassword: currentPassword,
          newPassword: newPassword
        }),
      })

      // Check if the response is JSON
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        // If it's not JSON, get the text to see the actual error
        const text = await response.text()
        console.error("Non-JSON response:", text)
        throw new Error("The server returned an invalid response")
      }

      const data = await response.json()

      if (response.ok) {
        setSuccess("Password changed successfully")
        // Reset password fields
        setCurrentPassword("")
        setNewPassword("")
        setConfirmNewPassword("")
        setPasswordStrength(0)
        setPasswordErrors([])
        
        // Close the dialog after successful password change
        document.dispatchEvent(new KeyboardEvent('keydown', {'key': 'Escape'}))
      } else {
        setError(data.error || "Failed to change password")
      }
    } catch (err) {
      console.error("Password change error:", err)
      setError("An error occurred. Please try again.")
    }
    
    setPasswordChanging(false)
  }

  const validateCardInput = () => {
    let isValid = true;
    const errors = {
      cardholderName: "",
      cardNumber: "",
      expirationDate: "",
      cvv: ""
    };

    // Validate cardholder name (required, letters and spaces only)
    if (!newCard.cardholderName.trim()) {
      errors.cardholderName = "Cardholder name is required";
      isValid = false;
    } else if (!/^[a-zA-Z\s]+$/.test(newCard.cardholderName.trim())) {
      errors.cardholderName = "Name should contain only letters and spaces";
      isValid = false;
    }

    // Validate card number (required, numbers only, 16 digits)
    const cardNumberClean = newCard.cardNumber.replace(/\s/g, '');
    if (!cardNumberClean) {
      errors.cardNumber = "Card number is required";
      isValid = false;
    } else if (!/^\d+$/.test(cardNumberClean)) {
      errors.cardNumber = "Card number should contain only digits";
      isValid = false;
    } else if (cardNumberClean.length !== 16) {
      errors.cardNumber = "Card number should be 16 digits";
      isValid = false;
    }

    // Validate expiration date (required, format MM/YY)
    if (!newCard.expirationDate) {
      errors.expirationDate = "Expiration date is required";
      isValid = false;
    } else if (!/^\d{2}\/\d{2}$/.test(newCard.expirationDate)) {
      errors.expirationDate = "Use format MM/YY";
      isValid = false;
    } else {
      // Check if date is valid and not expired
      const [month, year] = newCard.expirationDate.split('/');
      const expiryMonth = parseInt(month, 10);
      const expiryYear = parseInt(year, 10) + 2000; // Convert YY to 20YY
      
      const now = new Date();
      const currentMonth = now.getMonth() + 1; // getMonth is 0-indexed
      const currentYear = now.getFullYear();
      
      if (expiryMonth < 1 || expiryMonth > 12) {
        errors.expirationDate = "Invalid month";
        isValid = false;
      } else if (expiryYear < currentYear || (expiryYear === currentYear && expiryMonth < currentMonth)) {
        errors.expirationDate = "Card has expired";
        isValid = false;
      }
    }

    // Validate CVV (required, 3-4 digits)
    if (!newCard.cvv) {
      errors.cvv = "CVV is required";
      isValid = false;
    } else if (!/^\d{3,4}$/.test(newCard.cvv)) {
      errors.cvv = "CVV should be 3 or 4 digits";
      isValid = false;
    }

    setCardErrors(errors);
    return isValid;
  };

  const handleCardInputChange = (e) => {
    const { id, value } = e.target;
    
    // Format card number with spaces after every 4 digits while typing
    if (id === 'cardNumber') {
      // Remove any non-digit characters
      const cleaned = value.replace(/\D/g, '');
      // Add a space after every 4 digits
      let formatted = '';
      for (let i = 0; i < cleaned.length; i++) {
        if (i > 0 && i % 4 === 0) {
          formatted += ' ';
        }
        formatted += cleaned[i];
      }
      // Limit to 19 characters (16 digits + 3 spaces)
      formatted = formatted.substring(0, 19);
      
      setNewCard(prev => ({
        ...prev,
        [id]: formatted
      }));
    }
    // Format expiration date with / after first two digits
    else if (id === 'expirationDate') {
      // Remove any non-digit characters except for a single /
      const cleaned = value.replace(/[^\d\/]/g, '').replace(/\/+/g, '/');
      let formatted = cleaned;
      
      // If we have at least 2 digits and no slash yet, add one
      if (cleaned.length >= 2 && !cleaned.includes('/')) {
        formatted = cleaned.substring(0, 2) + '/' + cleaned.substring(2);
      }
      
      // Limit to 5 characters (MM/YY)
      formatted = formatted.substring(0, 5);
      
      setNewCard(prev => ({
        ...prev,
        [id]: formatted
      }));
    }
    // Limit CVV to 4 digits
    else if (id === 'cvv') {
      const cleaned = value.replace(/\D/g, '').substring(0, 4);
      setNewCard(prev => ({
        ...prev,
        [id]: cleaned
      }));
    }
    else {
      setNewCard(prev => ({
        ...prev,
        [id]: value
      }));
    }
    
    // Clear the error message for this field when typing
    setCardErrors(prev => ({
      ...prev,
      [id]: ""
    }));
  };

  const addPaymentMethod = async () => {
    try {
      // Validate form before submission
      if (!validateCardInput()) {
        return; // Stop if validation fails
      }
      
      setIsSubmitting(true);

      // Use the billing address if provided, otherwise use profile address
      const cardAddress = newCard.cardAddress || 
        `${profile.streetAddress}, ${profile.city}, ${profile.state} ${profile.zipCode}`;
      
      // Clean card number to remove spaces before sending
      const cleanCardNumber = newCard.cardNumber.replace(/\s/g, '');
      
      const response = await fetch("http://localhost:8080/api/cards/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cardholderName: newCard.cardholderName,
          cardNumber: cleanCardNumber,
          cvv: newCard.cvv,
          cardAddress: cardAddress,
          expirationDate: newCard.expirationDate
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add payment method");
      }

      // Refresh the cards data
      refreshCards();
      
      // Reset form and close dialog
      setNewCard({
        cardholderName: "",
        cardNumber: "",
        expirationDate: "",
        cvv: "",
        cardAddress: ""
      });
      setCardErrors({
        cardholderName: "",
        cardNumber: "",
        expirationDate: "",
        cvv: ""
      });
      
      // Close dialog by clicking escape key
      document.dispatchEvent(new KeyboardEvent('keydown', {'key': 'Escape'}));
      
    } catch (error) {
      console.error("Error adding payment method:", error);
      alert("Failed to add payment method: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const deletePaymentMethod = async (cardId) => {
    if (!confirm("Are you sure you want to delete this payment method?")) {
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:8080/api/cards/${cardId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete payment method");
      }

      // Refresh the cards data
      refreshCards();
    } catch (error) {
      console.error("Error deleting payment method:", error);
      alert("Failed to delete payment method. Please try again.");
    }
  };

  const maskCardNumber = (cardNumber) => {
    // Show only last 4 characters
    return "•••• •••• •••• " + cardNumber.slice(-4)
  }

  const handleCardAddressChange = (e) => {
    const { value } = e.target;
    setEditingCard(prev => prev ? {...prev, address: value} : null);
  };

  const updateCardAddress = async (cardId) => {
    try {
      setIsSubmitting(true);
      
      if (!editingCard) return;
      
      const response = await fetch(`http://localhost:8080/api/cards/${cardId}/update-address`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cardAddress: editingCard.address
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update card address");
      }

      // Refresh the cards data
      refreshCards();
      setEditingCard(null);
    } catch (error) {
      console.error("Error updating card address:", error);
      alert("Failed to update card address. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePromotionChange = (checked) => {
    if (!editingPersonal) return;
    
    setFormData(prev => ({
      ...prev,
      promotionSubscription: checked
    }));
  };

  if (profileLoading) {
    return (
      <>
        <OrderHeader />
        <div className="container mx-auto py-8 px-4 max-w-5xl">
          <div className="flex items-center space-x-4 mb-8">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
          <Skeleton className="h-[600px] w-full" />
        </div>
      </>
    )
  }

  if (profileError) {
    return (
      <>
        <OrderHeader />
        <div className="container mx-auto py-8 px-4 max-w-5xl">
          <div className="p-4 bg-red-50 text-red-500 rounded-md">
            {profileError}
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <OrderHeader />
      <div className="container mx-auto py-8 px-4 max-w-5xl">
        <div className="mb-8 flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8">
          <div className="h-24 w-24 flex items-center justify-center bg-muted rounded-full">
            <User className="h-12 w-12 text-muted-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {profile?.firstName} {profile?.lastName}
            </h1>
            <p className="text-muted-foreground">{profile?.email}</p>
          </div>
        </div>

        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid grid-cols-4 w-full md:w-[500px] mb-8">
            <TabsTrigger value="personal" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Personal Info</span>
            </TabsTrigger>
            <TabsTrigger value="address" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span className="hidden sm:inline">Address</span>
            </TabsTrigger>
            <TabsTrigger value="payment" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Payment</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <Ticket className="h-4 w-4" />
              <span className="hidden sm:inline">Order History</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="personal">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Manage your personal details and account settings</CardDescription>
                </div>
                {!editingPersonal && (
                  <Button onClick={() => setEditingPersonal(true)} variant="outline" className="flex items-center gap-2">
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={handlePersonalInfoChange}
                        readOnly={!editingPersonal}
                        className={!editingPersonal ? "opacity-70" : ""}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={handlePersonalInfoChange}
                        readOnly={!editingPersonal}
                        className={!editingPersonal ? "opacity-70" : ""}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={profile?.email || ""} readOnly className="opacity-70" />
                  </div>
                  <div className="flex items-center space-x-2 pt-2">
                    <Checkbox 
                      id="promotions" 
                      checked={formData.promotionSubscription}
                      onCheckedChange={handlePromotionChange}
                      disabled={!editingPersonal && !isSubmitting}
                    />
                    <label
                      htmlFor="promotions"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Subscribe to promotional offers
                    </label>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-medium mb-2">Security</h3>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        Change Password
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Change Password</DialogTitle>
                        <DialogDescription>Enter your current password and a new password.</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-6">
                        {error && (
                          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded">
                            {error}
                          </div>
                        )}
                        {success && (
                          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded">
                            {success}
                          </div>
                        )}
                        
                        <div className="space-y-1">
                          <Label htmlFor="current-password">Current Password</Label>
                          <Input 
                            id="current-password" 
                            type="password" 
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-1">
                          <Label htmlFor="new-password">New Password</Label>
                          <Input 
                            id="new-password" 
                            type="password" 
                            value={newPassword}
                            onChange={(e) => {
                              const newPwd = e.target.value;
                              setNewPassword(newPwd);
                              setPasswordStrength(calculatePasswordStrength(newPwd));
                              setPasswordErrors(validatePassword(newPwd));
                            }}
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
                                <li className={newPassword.length >= 8 ? "text-green-500" : ""}>
                                  At least 8 characters
                                </li>
                                <li className={/[A-Z]/.test(newPassword) ? "text-green-500" : ""}>
                                  At least one uppercase letter
                                </li>
                                <li className={/[0-9]/.test(newPassword) ? "text-green-500" : ""}>
                                  At least one number
                                </li>
                                <li className={/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword) ? "text-green-500" : ""}>
                                  At least one special character
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <Label htmlFor="confirm-password">Confirm New Password</Label>
                          <Input 
                            id="confirm-password" 
                            type="password" 
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                          />
                          {newPassword && confirmNewPassword && newPassword !== confirmNewPassword && (
                            <p className="text-xs text-red-500">Passwords do not match</p>
                          )}
                        </div>
                        
                        <Button 
                          onClick={handleChangePassword} 
                          disabled={passwordChanging || !currentPassword || !newPassword || !confirmNewPassword}
                          className="w-full"
                        >
                          {passwordChanging ? "Changing Password..." : "Change Password"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
              {editingPersonal && (
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => setEditingPersonal(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={savePersonalInfo} 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </Button>
                </CardFooter>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="address">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Address Information</CardTitle>
                  <CardDescription>Manage your address</CardDescription>
                </div>
                {!editingAddress && (
                  <Button onClick={() => setEditingAddress(true)} variant="outline" className="flex items-center gap-2">
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="streetAddress">Street Address</Label>
                    <Input
                      id="streetAddress"
                      value={formData.streetAddress}
                      onChange={handlePersonalInfoChange}
                      readOnly={!editingAddress}
                      className={!editingAddress ? "opacity-70" : ""}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={handlePersonalInfoChange}
                        readOnly={!editingAddress}
                        className={!editingAddress ? "opacity-70" : ""}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={handlePersonalInfoChange}
                        readOnly={!editingAddress}
                        className={!editingAddress ? "opacity-70" : ""}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">ZIP Code</Label>
                      <Input
                        id="zipCode"
                        value={formData.zipCode}
                        onChange={handlePersonalInfoChange}
                        readOnly={!editingAddress}
                        className={!editingAddress ? "opacity-70" : ""}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              {editingAddress && (
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => setEditingAddress(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={saveAddressInfo}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Saving..." : "Save Address"}
                  </Button>
                </CardFooter>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="payment">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Payment Methods</CardTitle>
                  <CardDescription>Manage your payment methods and billing details</CardDescription>
                </div>
                {cards.length < 3 && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="flex items-center gap-2">
                        <PlusCircle className="h-4 w-4" />
                        Add Payment Method
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Payment Method</DialogTitle>
                        <DialogDescription>Enter your card details to add a new payment method.</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="cardholderName" className="flex items-center">
                            Card Holder <span className="text-red-500 ml-1">*</span>
                          </Label>
                          <Input 
                            id="cardholderName" 
                            placeholder="Name on card" 
                            value={newCard.cardholderName}
                            onChange={handleCardInputChange}
                            className={cardErrors.cardholderName ? "border-red-500" : ""}
                          />
                          {cardErrors.cardholderName && (
                            <p className="text-xs text-red-500">{cardErrors.cardholderName}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cardNumber" className="flex items-center">
                            Card Number <span className="text-red-500 ml-1">*</span>
                          </Label>
                          <Input 
                            id="cardNumber" 
                            placeholder="1234 5678 9012 3456" 
                            value={newCard.cardNumber}
                            onChange={handleCardInputChange}
                            className={cardErrors.cardNumber ? "border-red-500" : ""}
                          />
                          {cardErrors.cardNumber && (
                            <p className="text-xs text-red-500">{cardErrors.cardNumber}</p>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="expirationDate" className="flex items-center">
                              Expiry Date <span className="text-red-500 ml-1">*</span>
                            </Label>
                            <Input 
                              id="expirationDate" 
                              placeholder="MM/YY" 
                              value={newCard.expirationDate}
                              onChange={handleCardInputChange}
                              className={cardErrors.expirationDate ? "border-red-500" : ""}
                            />
                            {cardErrors.expirationDate && (
                              <p className="text-xs text-red-500">{cardErrors.expirationDate}</p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="cvv" className="flex items-center">
                              CVC <span className="text-red-500 ml-1">*</span>
                            </Label>
                            <Input 
                              id="cvv" 
                              placeholder="123" 
                              value={newCard.cvv}
                              onChange={handleCardInputChange}
                              className={cardErrors.cvv ? "border-red-500" : ""}
                            />
                            {cardErrors.cvv && (
                              <p className="text-xs text-red-500">{cardErrors.cvv}</p>
                            )}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cardAddress">Billing Address</Label>
                          <Input 
                            id="cardAddress" 
                            placeholder="Enter your billing address (or leave blank to use profile address)" 
                            value={newCard.cardAddress}
                            onChange={handleCardInputChange}
                          />
                          <p className="text-xs text-muted-foreground">
                            If left blank, your profile address will be used
                          </p>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button 
                          type="submit" 
                          onClick={addPaymentMethod}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? "Adding..." : "Add Payment Method"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                {cardsLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                ) : cardsError ? (
                  <div className="text-center py-8 text-red-500">{cardsError}</div>
                ) : cards.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No payment methods added yet.</div>
                ) : (
                  <>
                    {cards.map((card) => (
                      <div key={card.id} className="flex flex-col md:flex-row gap-4 p-4 border rounded-lg">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5 text-muted-foreground" />
                            <span className="font-medium">{maskCardNumber(card.cardNumber)}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <div>{card.cardholderName}</div>
                            {editingCard && editingCard.id === card.id ? (
                              <Input
                                value={editingCard.address}
                                onChange={handleCardAddressChange}
                                className="mt-2 mb-2"
                                placeholder="Enter new billing address"
                              />
                            ) : (
                              <div>{card.cardAddress}</div>
                            )}
                            {card.expirationDate && <div>Expires: {card.expirationDate}</div>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 self-end md:self-center">
                          {editingCard && editingCard.id === card.id ? (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex items-center gap-2"
                                onClick={() => setEditingCard(null)}
                              >
                                Cancel
                              </Button>
                              <Button 
                                variant="default" 
                                size="sm" 
                                className="flex items-center gap-2"
                                onClick={() => updateCardAddress(card.id)}
                                disabled={isSubmitting}
                              >
                                {isSubmitting ? "Saving..." : "Save"}
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex items-center gap-2"
                                onClick={() => setEditingCard({id: card.id, address: card.cardAddress})}
                              >
                                <Edit className="h-4 w-4" />
                                <span className="hidden sm:inline">Edit</span>
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm" 
                                className="flex items-center gap-2" 
                                onClick={() => deletePaymentMethod(card.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="hidden sm:inline">Delete</span>
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                    {cards.length >= 3 && (
                      <div className="text-sm text-muted-foreground mt-2">Maximum of 3 payment methods allowed.</div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
                <CardDescription>View your past movie ticket purchases</CardDescription>
              </CardHeader>
              <CardContent>
                {bookingsLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                ) : bookings.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <div className="mb-4">
                      <Ticket className="mx-auto h-12 w-12 opacity-20" />
                    </div>
                    <p>You haven't purchased any tickets yet.</p>
                    <Button 
                      onClick={() => router.push('/movies')} 
                      variant="outline" 
                      className="mt-4"
                    >
                      Browse Movies
                    </Button>
                  </div>
                ) : bookingsError ? (
                  <div className="text-center py-8 text-red-500">{bookingsError}</div>
                ) : (
                  <Accordion type="single" collapsible className="w-full">
                    {bookings.map((booking) => (
                      <AccordionItem key={booking.bookingId} value={`booking-${booking.bookingId}`}>
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full text-left">
                            <div className="font-medium">Order #{booking.bookingId}</div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(booking.bookingDatetime)}</span>
                              <span className="hidden sm:inline">•</span>
                              <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800">
                                {booking.status}
                              </span>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          {!booking.tickets || booking.tickets.length === 0 ? (
                            <div className="text-center py-4 text-sm text-muted-foreground">
                              No tickets found for this order.
                            </div>
                          ) : (
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Movie</TableHead>
                                  <TableHead>Seat</TableHead>
                                  <TableHead>Type</TableHead>
                                  <TableHead className="text-right">Price</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {booking.tickets.map((ticket) => (
                                  <TableRow key={ticket.ticketId}>
                                    <TableCell className="font-medium">
                                      {ticket.movieTitle || "Unknown Movie"}
                                    </TableCell>
                                    <TableCell>{ticket.seatNumber}</TableCell>
                                    <TableCell>
                                      <span className="capitalize">{ticket.ticketType}</span>
                                    </TableCell>
                                    <TableCell className="text-right">${Number(ticket.price).toFixed(2)}</TableCell>
                                  </TableRow>
                                ))}
                                <TableRow>
                                  <TableCell colSpan={3} className="text-right font-medium">
                                    Total
                                  </TableCell>
                                  <TableCell className="text-right font-bold">
                                    ${booking.tickets.reduce((sum, ticket) => sum + Number(ticket.price), 0).toFixed(2)}
                                  </TableCell>
                                </TableRow>
                              </TableBody>
                            </Table>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}