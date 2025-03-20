"use client"

import { useState } from "react"
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
import { CreditCard, User, MapPin, Lock, PlusCircle, Edit, Trash2 } from "lucide-react"
import { OrderHeader } from "@/components/order/OrderHeader"

export default function Profile() {
  const [editingPersonal, setEditingPersonal] = useState(false)
  const [editingAddress, setEditingAddress] = useState(false)

  const [user, setUser] = useState({
    firstName: "Virgil",
    lastName: "Kon",
    email: "sotorot419@erapk.com",
  })

  const [address, setAddress] = useState({
    street: "Hoooland St",
    city: "Athens",
    state: "GA",
    zipCode: "30601",
  })

  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: 1,
      cardHolder: "Virgil Kon",
      cardNumber: "$2a$10$s.ruQ.TkI0AlyhFskEVHe3dvmMh8XTEoUkz53aZ6FgWa63uiXBG2",
      address: "Hoooland St, Athens, GA 30601",
    },
    {
      id: 2,
      cardHolder: "Virgil Kon",
      cardNumber: "$2a$10$PcCVaVvc4UOX5Nh5YY5AdOe3ixyMFgWqQenZ6ioW0pbuETr/t4aP6",
      address: "Hoooland St, Athens, GA 30601",
    },
  ])

  const maskCardNumber = (cardNumber) => {
    // Show only last 4 characters
    return "•••• •••• •••• " + cardNumber.slice(-4)
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
              {user.firstName} {user.lastName}
            </h1>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid grid-cols-3 w-full md:w-[400px] mb-8">
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
                        value={user.firstName}
                        onChange={(e) => setUser({ ...user, firstName: e.target.value })}
                        readOnly={!editingPersonal}
                        className={!editingPersonal ? "opacity-70" : ""}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={user.lastName}
                        onChange={(e) => setUser({ ...user, lastName: e.target.value })}
                        readOnly={!editingPersonal}
                        className={!editingPersonal ? "opacity-70" : ""}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={user.email} readOnly className="opacity-70" />
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
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="current">Current Password</Label>
                          <Input id="current" type="password" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="new">New Password</Label>
                          <Input id="new" type="password" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirm">Confirm New Password</Label>
                          <Input id="confirm" type="password" />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit">Save Changes</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
              {editingPersonal && (
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => setEditingPersonal(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setEditingPersonal(false)}>Save Changes</Button>
                </CardFooter>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="address">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Address Information</CardTitle>
                  <CardDescription>Manage your shipping and billing address</CardDescription>
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
                    <Label htmlFor="street">Street Address</Label>
                    <Input
                      id="street"
                      value={address.street}
                      onChange={(e) => setAddress({ ...address, street: e.target.value })}
                      readOnly={!editingAddress}
                      className={!editingAddress ? "opacity-70" : ""}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={address.city}
                        onChange={(e) => setAddress({ ...address, city: e.target.value })}
                        readOnly={!editingAddress}
                        className={!editingAddress ? "opacity-70" : ""}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={address.state}
                        onChange={(e) => setAddress({ ...address, state: e.target.value })}
                        readOnly={!editingAddress}
                        className={!editingAddress ? "opacity-70" : ""}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">ZIP Code</Label>
                      <Input
                        id="zipCode"
                        value={address.zipCode}
                        onChange={(e) => setAddress({ ...address, zipCode: e.target.value })}
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
                  <Button onClick={() => setEditingAddress(false)}>Save Address</Button>
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
                {paymentMethods.length < 3 && (
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
                          <Label htmlFor="cardHolder">Card Holder</Label>
                          <Input id="cardHolder" placeholder="Name on card" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cardNumber">Card Number</Label>
                          <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="expiry">Expiry Date</Label>
                            <Input id="expiry" placeholder="MM/YY" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="cvc">CVC</Label>
                            <Input id="cvc" placeholder="123" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="billingAddress">Billing Address</Label>
                          <Input id="billingAddress" placeholder="Enter your billing address" />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit">Add Payment Method</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                {paymentMethods.map((method) => (
                  <div key={method.id} className="flex flex-col md:flex-row gap-4 p-4 border rounded-lg">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">{maskCardNumber(method.cardNumber)}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <div>{method.cardHolder}</div>
                        <div>{method.address}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-end md:self-center">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="flex items-center gap-2">
                            <Edit className="h-4 w-4" />
                            <span className="hidden sm:inline">Edit</span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Payment Method</DialogTitle>
                            <DialogDescription>Update your card details or billing address.</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="editCardHolder">Card Holder</Label>
                              <Input id="editCardHolder" defaultValue={method.cardHolder} />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="editAddress">Billing Address</Label>
                              <Input id="editAddress" defaultValue={method.address} />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button type="submit">Save Changes</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <Button variant="destructive" size="sm" className="flex items-center gap-2">
                        <Trash2 className="h-4 w-4" />
                        <span className="hidden sm:inline">Delete</span>
                      </Button>
                    </div>
                  </div>
                ))}
                {paymentMethods.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">No payment methods added yet.</div>
                )}
                {paymentMethods.length >= 3 && (
                  <div className="text-sm text-muted-foreground mt-2">Maximum of 3 payment methods allowed.</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}

