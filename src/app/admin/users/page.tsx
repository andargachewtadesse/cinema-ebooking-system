"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Plus, Trash2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface User {
  userId: number
  firstName: string
  lastName: string
  email: string
  isAdmin: boolean
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [currentAdminEmail, setCurrentAdminEmail] = useState<string>("")

  // New user state
  const [newUser, setNewUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [formError, setFormError] = useState("")

  // New state variables for password
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [passwordMatch, setPasswordMatch] = useState(true)
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({})

  // Get current admin's email
  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        if (user?.email) {
          setCurrentAdminEmail(user.email.toLowerCase())
        }
      } catch (err) {
        console.error("Error parsing user from localStorage:", err)
      }
    }
  }, [])

  // Fetch all users
  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError("")
      
      const response = await fetch("http://localhost:8080/api/users")
      
      if (!response.ok) {
        throw new Error("Failed to fetch users")
      }
      
      const data = await response.json()
      
      // Log the entire first user object to see what we're actually getting
      if (data.length > 0) {
        console.log("First user object:", JSON.stringify(data[0], null, 2))
      }
      
      // Need to fetch admin information separately since it's not in the main user API
      const adminResponse = await fetch("http://localhost:8080/api/users/admin/all", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("authToken")}`
        }
      })
      
      let adminEmails: string[] = []
      if (adminResponse.ok) {
        const admins = await adminResponse.json()
        adminEmails = admins.map((admin: any) => admin.email.toLowerCase())
        console.log("Admin emails:", adminEmails)
      }
      
      // Transform the data with admin status determined by email match
      const processedUsers = data.map(user => {
        const isUserAdmin = adminEmails.includes(user.email.toLowerCase())
        
        return {
          userId: user.userId || user.user_id,
          firstName: user.firstName || user.first_name,
          lastName: user.lastName || user.last_name,
          email: user.email,
          isAdmin: isUserAdmin
        }
      })
      
      setUsers(processedUsers)
    } catch (err) {
      console.error("Error fetching users:", err)
      setError("Failed to load users. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  // Handle add user form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setNewUser(prev => ({
      ...prev,
      [id]: value
    }))
    
    // Mark field as touched
    setTouchedFields(prev => ({
      ...prev,
      [id]: true
    }))
    
    // Calculate password strength if password field changes
    if (id === 'password') {
      calculatePasswordStrength(value)
    }
    
    // Check if passwords match whenever either password field changes
    if (id === 'password' || id === 'confirmPassword') {
      const otherValue = id === 'password' 
        ? newUser.confirmPassword 
        : newUser.password
      setPasswordMatch(value === otherValue || value === '' || otherValue === '')
    }
  }
  
  // Calculate password strength
  const calculatePasswordStrength = (password: string) => {
    if (!password) {
      setPasswordStrength(0)
      return
    }
    
    let strength = 0
    
    // Length check
    if (password.length >= 8) strength += 25
    
    // Character variety checks
    if (/[A-Z]/.test(password)) strength += 25 // Has uppercase
    if (/[0-9]/.test(password)) strength += 25 // Has number
    if (/[^A-Za-z0-9]/.test(password)) strength += 25 // Has special char
    
    setPasswordStrength(strength)
  }
  
  // Get color for password strength bar
  const getStrengthColor = () => {
    if (passwordStrength < 50) return "bg-red-500"
    if (passwordStrength < 75) return "bg-yellow-500"
    return "bg-green-500"
  }
  
  // Check if a field is required and empty
  const isFieldInvalid = (fieldName: string) => {
    return touchedFields[fieldName] && !newUser[fieldName as keyof typeof newUser]
  }

  // Handle add user form submission
  const handleAddUser = async () => {
    if (!validateForm()) return
    
    try {
      setFormError("")
      
      const response = await fetch("http://localhost:8080/api/users/admin/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("authToken")}`
        },
        body: JSON.stringify({
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          email: newUser.email,
          password: newUser.password,
          isAdmin: true,
          statusId: 2,  // Explicitly set to inactive (2) 
        })
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to create user")
      }
      
      // Reset form and close dialog
      setNewUser({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
      })
      setDialogOpen(false)
      
      // Refresh user list
      fetchUsers()
    } catch (err) {
      console.error("Error creating user:", err)
      setFormError(err instanceof Error ? err.message : "Failed to create user")
    }
  }

  // Validate form before submission
  const validateForm = () => {
    if (!newUser.firstName || !newUser.lastName || !newUser.email || !newUser.password || !newUser.confirmPassword) {
      setFormError("All fields are required")
      return false
    }
    
    if (newUser.password !== newUser.confirmPassword) {
      setFormError("Passwords do not match")
      return false
    }
    
    if (newUser.password.length < 8) {
      setFormError("Password must be at least 8 characters")
      return false
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newUser.email)) {
      setFormError("Please enter a valid email address")
      return false
    }
    
    return true
  }

  // Delete user
  const handleDeleteUser = async () => {
    if (!selectedUser) return
    
    try {
      const response = await fetch(`http://localhost:8080/api/users/${selectedUser.userId}`, {
        method: "DELETE"
      })
      
      if (!response.ok) {
        throw new Error("Failed to delete user")
      }
      
      // Close dialog and refresh list
      setDeleteDialogOpen(false)
      setSelectedUser(null)
      fetchUsers()
    } catch (err) {
      console.error("Error deleting user:", err)
      setError("Failed to delete user. Please try again.")
    }
  }

  // Open delete confirmation dialog
  const confirmDelete = (user: User) => {
    setSelectedUser(user)
    setDeleteDialogOpen(true)
  }

  // Check if the user is the current admin
  const isCurrentAdmin = (userEmail: string) => {
    return userEmail.toLowerCase() === currentAdminEmail
  }

  // Get text for password strength
  const getPasswordStrengthText = () => {
    if (passwordStrength < 25) return "Very weak"
    if (passwordStrength < 50) return "Weak"
    if (passwordStrength < 75) return "Medium"
    return "Strong"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">User Management</h1>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Admin User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Admin User</DialogTitle>
              <DialogDescription>
                Create a new administrator account for the system. New admin accounts are created with inactive status and need to be verified.
              </DialogDescription>
            </DialogHeader>
            
            {formError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="flex items-center">
                    First Name <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    placeholder="Enter first name"
                    value={newUser.firstName}
                    onChange={handleInputChange}
                    className={isFieldInvalid('firstName') ? "border-red-500" : ""}
                  />
                  {isFieldInvalid('firstName') && (
                    <p className="text-red-500 text-xs mt-1">First name is required</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="flex items-center">
                    Last Name <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    placeholder="Enter last name"
                    value={newUser.lastName}
                    onChange={handleInputChange}
                    className={isFieldInvalid('lastName') ? "border-red-500" : ""}
                  />
                  {isFieldInvalid('lastName') && (
                    <p className="text-red-500 text-xs mt-1">Last name is required</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center">
                  Email <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email address"
                  value={newUser.email}
                  onChange={handleInputChange}
                  className={isFieldInvalid('email') ? "border-red-500" : ""}
                />
                {isFieldInvalid('email') && (
                  <p className="text-red-500 text-xs mt-1">Email is required</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center">
                  Password <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  value={newUser.password}
                  onChange={handleInputChange}
                  className={isFieldInvalid('password') ? "border-red-500" : ""}
                />
                
                {/* Password strength indicator - signup page style */}
                {newUser.password && (
                  <div className="mt-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium">Password strength</span>
                      <span className={`text-xs font-medium
                        ${passwordStrength < 50 ? "text-red-500" : 
                          passwordStrength < 75 ? "text-yellow-500" : "text-green-500"}
                      `}>
                        {getPasswordStrengthText()}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${getStrengthColor()}`}
                        style={{ width: `${passwordStrength}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                
                {/* Password requirements */}
                <div className="mt-3 space-y-2">
                  <p className="text-xs font-medium text-gray-600">Your password must include:</p>
                  <div className="grid grid-cols-1 gap-y-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center
                        ${newUser.password.length >= 8 ? "bg-green-100" : "bg-gray-100"}`}>
                        <div className={`w-2 h-2 rounded-full 
                          ${newUser.password.length >= 8 ? "bg-green-500" : "bg-gray-300"}`}>
                        </div>
                      </div>
                      <span className={`text-xs ${newUser.password.length >= 8 ? "text-green-600" : "text-gray-600"}`}>
                        Minimum 8 characters
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center
                        ${/[A-Z]/.test(newUser.password) ? "bg-green-100" : "bg-gray-100"}`}>
                        <div className={`w-2 h-2 rounded-full 
                          ${/[A-Z]/.test(newUser.password) ? "bg-green-500" : "bg-gray-300"}`}>
                        </div>
                      </div>
                      <span className={`text-xs ${/[A-Z]/.test(newUser.password) ? "text-green-600" : "text-gray-600"}`}>
                        At least one uppercase letter
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center
                        ${/[0-9]/.test(newUser.password) ? "bg-green-100" : "bg-gray-100"}`}>
                        <div className={`w-2 h-2 rounded-full 
                          ${/[0-9]/.test(newUser.password) ? "bg-green-500" : "bg-gray-300"}`}>
                        </div>
                      </div>
                      <span className={`text-xs ${/[0-9]/.test(newUser.password) ? "text-green-600" : "text-gray-600"}`}>
                        At least one number
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center
                        ${/[^A-Za-z0-9]/.test(newUser.password) ? "bg-green-100" : "bg-gray-100"}`}>
                        <div className={`w-2 h-2 rounded-full 
                          ${/[^A-Za-z0-9]/.test(newUser.password) ? "bg-green-500" : "bg-gray-300"}`}>
                        </div>
                      </div>
                      <span className={`text-xs ${/[^A-Za-z0-9]/.test(newUser.password) ? "text-green-600" : "text-gray-600"}`}>
                        At least one special character
                      </span>
                    </div>
                  </div>
                </div>
                
                {isFieldInvalid('password') && (
                  <p className="text-red-500 text-xs">Password is required</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="flex items-center">
                  Confirm Password <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={newUser.confirmPassword}
                  onChange={handleInputChange}
                  className={
                    isFieldInvalid('confirmPassword') || 
                    (newUser.confirmPassword && !passwordMatch) 
                      ? "border-red-500" 
                      : ""
                  }
                />
                {isFieldInvalid('confirmPassword') && (
                  <p className="text-red-500 text-xs mt-1">Please confirm your password</p>
                )}
                {newUser.confirmPassword && !passwordMatch && (
                  <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
                )}
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleAddUser} 
                disabled={
                  !newUser.firstName || 
                  !newUser.lastName || 
                  !newUser.email || 
                  !newUser.password || 
                  !newUser.confirmPassword || 
                  !passwordMatch || 
                  passwordStrength < 75
                }
              >
                Create Admin
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {loading ? (
            <div className="text-center py-4">Loading users...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.userId}>
                      <TableCell>{user.userId}</TableCell>
                      <TableCell>{user.firstName} {user.lastName}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <span className={user.isAdmin ? "font-medium text-blue-600" : ""}>
                          {user.isAdmin ? "Admin" : "Customer"}
                        </span>
                      </TableCell>
                      <TableCell>
                        {isCurrentAdmin(user.email) ? (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled
                            title="You cannot delete your own account"
                          >
                            <Trash2 className="h-4 w-4 text-gray-400" />
                          </Button>
                        ) : (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => confirmDelete(user)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedUser?.firstName} {selectedUser?.lastName}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 