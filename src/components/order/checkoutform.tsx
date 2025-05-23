"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox" 
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"


interface SavedCard {
  id: number;
  cardholderName: string;
  cardNumber: string; 
  expiration_date: string; 
  cardAddress: string;
}


interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

// Make payment/address fields optional for schema validation when using saved card
const checkoutFormSchema = z.object({
  // Personal Information (always required)
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  
  // New Card Info
  cardNumber: z.string().optional(),
  expiryMonth: z.string().optional(),
  expiryYear: z.string().optional(),
  cvv: z.string().optional(),
  cardholderName: z.string().optional(),

  // Billing Address for New Card
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),

  // Additional Options
  savePaymentInfo: z.boolean().optional(),
  
  // Promotion Code (optional)
  promotionCode: z.string().optional(), 
}).refine(data => {
    // If card number is present, other card details are required
    if (data.cardNumber) {
        return !!data.expiryMonth && !!data.expiryYear && !!data.cvv && !!data.cardholderName;
    }
    return true;
}, {
    message: "Expiry date, CVV, and cardholder name are required for new cards",
    path: ["cardNumber"],
}).refine(data => {
    // If card number is present, billing address details are required
     if (data.cardNumber) {
        return !!data.address && !!data.city && !!data.state && !!data.zipCode;
    }
    return true;
}, {
    message: "Billing address details are required for new cards",
    path: ["address"],
});

type CheckoutFormValues = z.infer<typeof checkoutFormSchema>


export interface SubmitData {
    firstName: string;
    lastName: string;
    email: string;
    total: number; // Original total before discount
    selectedCardId?: number; // ID of the saved card if used
    newCardDetails?: { // New card details if used
        cardholderName: string;
        cardNumber: string;
        expiryMonth: string;
        expiryYear: string;
        cvv: string;
        address: string;
        city: string;
        state: string;
        zipCode: string;
        saveCard: boolean;
    };

    promoCode?: string;
    appliedDiscount?: number; // Discount percentage
}

interface CheckoutFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  total: number // Original total
  onSubmit: (data: SubmitData) => void
  userData: UserData | null
  userCards: SavedCard[]
}

const maskCardNumber = (cardNumber: string) => {
    return `•••• ${cardNumber.slice(-4)}`;
}

export function CheckoutForm({ 
    open, 
    onOpenChange, 
    total, 
    onSubmit, 
    userData, 
    userCards 
}: CheckoutFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('new')
  const [showFullCardNumber, setShowFullCardNumber] = useState(false);
  
  // Promotion state
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<number | null>(null);
  const [appliedPromoCode, setAppliedPromoCode] = useState<string | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      cardNumber: "",
      expiryMonth: "",
      expiryYear: "",
      cvv: "",
      cardholderName: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      savePaymentInfo: false,
      promotionCode: "", // Initialize promotion code
    },
    mode: "onChange"
  })

  // Effect to pre-populate form and reset promo state
  useEffect(() => {
    if (open) {
       if (userData) {
         form.reset({
            firstName: userData.firstName || "",
            lastName: userData.lastName || "",
            email: userData.email || "",
            address: selectedPaymentMethod === 'new' ? (userData.streetAddress || "") : "",
            city: selectedPaymentMethod === 'new' ? (userData.city || "") : "",
            state: selectedPaymentMethod === 'new' ? (userData.state || "") : "",
            zipCode: selectedPaymentMethod === 'new' ? (userData.zipCode || "") : "",
            cardNumber: "",
            expiryMonth: "",
            expiryYear: "",
            cvv: "",
            cardholderName: "",
            savePaymentInfo: false,
            promotionCode: "", // Clear promo code on open/user change
         });
         // Default to first saved card if available
         setSelectedPaymentMethod(userCards && userCards.length > 0 ? userCards[0].id.toString() : 'new');
       }
       // Reset promo state when dialog opens
       setPromoCodeInput("");
       setAppliedDiscount(null);
       setAppliedPromoCode(null);
       setPromoError(null);
       setIsApplyingPromo(false);
    } else {
       form.reset();
       setSelectedPaymentMethod('new');
       // Reset promo state when dialog closes
       setPromoCodeInput("");
       setAppliedDiscount(null);
       setAppliedPromoCode(null);
       setPromoError(null);
       setIsApplyingPromo(false);
    }
  }, [open, userData, form, userCards]); 

  // Handle payment method selection
  const handlePaymentMethodChange = (value: string) => {
    setSelectedPaymentMethod(value);
    
    if (value !== 'new') {
      // Clear card fields when using saved card
      form.setValue('cardNumber', '', { shouldValidate: true });
      form.setValue('expiryMonth', '', { shouldValidate: true });
      form.setValue('expiryYear', '', { shouldValidate: true });
      form.setValue('cvv', '', { shouldValidate: true });
      form.setValue('cardholderName', '', { shouldValidate: true });
      form.setValue('address', '', { shouldValidate: true });
      form.setValue('city', '', { shouldValidate: true });
      form.setValue('state', '', { shouldValidate: true });
      form.setValue('zipCode', '', { shouldValidate: true });
      form.setValue('savePaymentInfo', false);
    } else {
      // Pre-fill address from userData if using new card
      form.setValue('address', userData?.streetAddress || '', { shouldValidate: true });
      form.setValue('city', userData?.city || '', { shouldValidate: true });
      form.setValue('state', userData?.state || '', { shouldValidate: true });
      form.setValue('zipCode', userData?.zipCode || '', { shouldValidate: true });
    }
  };

  // Format card number display
  const formatCardNumberDisplay = (value: string | undefined) => {
    if (!value) return '';
    const cleaned = value.replace(/\D/g, '');
    if (showFullCardNumber) {
      return cleaned.replace(/(.{4})/g, '$1 ').trim();
    } else {
      const masked = '•••• •••• •••• ' + cleaned.slice(-4);
      return masked.substring(0, 19);
    }
  };

  // Calculate discounted total
  const discountedTotal = useMemo(() => {
    if (appliedDiscount !== null && total > 0) {
      const discountAmount = total * (appliedDiscount / 100);
      return Math.max(0, total - discountAmount); // Ensure total doesn't go below 0
    }
    return total;
  }, [total, appliedDiscount]);

  // Handle applying promotion code
  const handleApplyPromo = async () => {
    if (!promoCodeInput.trim()) {
      setPromoError("Please enter a promotion code.");
      return;
    }
    
    setIsApplyingPromo(true);
    setPromoError(null);
    setAppliedDiscount(null); // Clear previous discount
    setAppliedPromoCode(null);

    try {

      const response = await fetch(`/api/promotions/validate/${promoCodeInput.trim()}`);
      const data = await response.json();

      if (response.ok) {
        setAppliedDiscount(data.discountPercentage);
        setAppliedPromoCode(promoCodeInput.trim());
        setPromoError(null); // Clear error on success
      } else {
        setPromoError(data.error || "Invalid or unavailable promotion code.");
        setAppliedDiscount(null);
        setAppliedPromoCode(null);
      }
    } catch (error) {
      console.error("Error validating promo code:", error);
      setPromoError("Failed to validate code. Please try again.");
      setAppliedDiscount(null);
       setAppliedPromoCode(null);
    } finally {
      setIsApplyingPromo(false);
    }
  };

  // Handle form submission
  const handleSubmitForm = async (data: CheckoutFormValues) => {
    setIsSubmitting(true);
    
    // Construct the payload with potential promotion details
    let submitPayload: SubmitData = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      total: total, // Send original total
      promoCode: appliedPromoCode || undefined, // Send code if applied
      appliedDiscount: appliedDiscount || undefined, // Send discount % if applied
    };

    if (selectedPaymentMethod === 'new') {
      // Validate new card fields
      if (!data.cardNumber || !data.expiryMonth || !data.expiryYear || !data.cvv || !data.cardholderName || 
          !data.address || !data.city || !data.state || !data.zipCode) {
        console.error("Missing required fields for new card submission.");
        form.trigger(); // Ensure validation messages show
        setIsSubmitting(false);
        return;
      }
      
      submitPayload.newCardDetails = {
        cardholderName: data.cardholderName!,
        cardNumber: data.cardNumber!.replace(/\s/g, ''), // Send cleaned number
        expiryMonth: data.expiryMonth!,
        expiryYear: data.expiryYear!,
        cvv: data.cvv!,
        address: data.address!,
        city: data.city!,
        state: data.state!,
        zipCode: data.zipCode!,
        saveCard: data.savePaymentInfo || false,
      };
    } else {
      submitPayload.selectedCardId = parseInt(selectedPaymentMethod, 10);
    }

    try {
      await onSubmit(submitPayload); // Pass the payload with promo info
    } catch (error) {
      console.error("Checkout submission error:", error);

    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">Complete Your Purchase</DialogTitle>
          <DialogDescription>Review your details and confirm payment.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form id="checkout-form" onSubmit={form.handleSubmit(handleSubmitForm)} className="space-y-8">
            
            {/* Personal Information Section */}
            <section className="space-y-4 border-b pb-6">
              <h3 className="text-lg font-semibold">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </section>

            {/* Payment Method Selection */}
            <section className="space-y-4 border-b pb-6">
              <h3 className="text-lg font-semibold">Payment Method</h3>
              <RadioGroup 
                value={selectedPaymentMethod} 
                onValueChange={handlePaymentMethodChange}
                className="space-y-2"
              >
                {userCards && userCards.length > 0 && userCards.map((card) => (
                  <FormItem key={card.id} className="flex items-center space-x-3 space-y-0 p-3 border rounded-md has-[:checked]:bg-muted/50 has-[:checked]:border-primary">
                    <FormControl>
                      <RadioGroupItem value={card.id.toString()} />
                    </FormControl>
                    <FormLabel className="font-normal flex-grow cursor-pointer">
                      <div className="flex justify-between items-center">
                        <span>{maskCardNumber(card.cardNumber)}</span>
                        <span className="text-sm text-muted-foreground">{card.expiration_date}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">{card.cardholderName}</div>
                    </FormLabel>
                  </FormItem>
                ))}
                <FormItem className="flex items-center space-x-3 space-y-0 p-3 border rounded-md has-[:checked]:bg-muted/50 has-[:checked]:border-primary">
                  <FormControl>
                    <RadioGroupItem value="new" />
                  </FormControl>
                  <FormLabel className="font-normal flex-grow cursor-pointer">
                    Use a new payment card
                  </FormLabel>
                </FormItem>
              </RadioGroup>
            </section>
            
            {/* Conditional Sections for New Card */}
            {selectedPaymentMethod === 'new' && (
              <>
                {/* New Card Details */}
                <section className="space-y-4 border-b pb-6">
                  <h3 className="text-lg font-semibold">New Card Details</h3>
                  <FormField
                    control={form.control}
                    name="cardholderName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cardholder Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Name on card" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="cardNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Card Number *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="•••• •••• •••• 1234"
                            value={formatCardNumberDisplay(field.value)}
                            onChange={(e) => field.onChange(e.target.value.replace(/\s/g, '').slice(0, 16))}
                            onFocus={() => setShowFullCardNumber(true)}
                            onBlur={() => setShowFullCardNumber(false)}
                            maxLength={19}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="expiryMonth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expiry Month *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="MM" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, "0")).map((month) => (
                                <SelectItem key={month} value={month}>{month}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="expiryYear"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expiry Year *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="YYYY" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Array.from({ length: 10 }, (_, i) => (new Date().getFullYear() + i).toString()).map((year) => (
                                <SelectItem key={year} value={year}>{year}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="cvv"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CVV *</FormLabel>
                          <FormControl>
                            <Input placeholder="123" {...field} maxLength={4} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="savePaymentInfo"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-4">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Save payment information for next time</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </section>

                {/* Billing Address */}
                <section className="space-y-4 border-b pb-6">
                  <h3 className="text-lg font-semibold">Billing Address</h3>
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street Address *</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City *</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State *</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ZIP Code *</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </section>
              </>
            )}

            {/* Promotion Code Section */}
            <section className="space-y-4 border-b pb-6">
              <h3 className="text-lg font-semibold">Promotion Code (Optional)</h3>
              <div className="flex items-start gap-2">
                <Input 
                  placeholder="Enter code" 
                  value={promoCodeInput}
                  onChange={(e) => {
                     setPromoCodeInput(e.target.value);
                     // Clear errors/status if user types again
                     setPromoError(null);
                     if (appliedDiscount) { // Clear applied discount if user types new code
                        setAppliedDiscount(null);
                        setAppliedPromoCode(null);
                     }
                  }}
                  className="flex-grow"
                  disabled={isApplyingPromo || !!appliedPromoCode} // Disable if applying or already applied
                />
                <Button 
                  type="button" 
                  onClick={handleApplyPromo} 
                  disabled={isApplyingPromo || !promoCodeInput.trim() || !!appliedPromoCode}
                  variant="outline"
                  className="min-w-[80px]"
                >
                  {isApplyingPromo ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                </Button>
              </div>
              {/* Display Promo Status */}
              {promoError && (
                <p className="text-sm text-destructive">{promoError}</p>
              )}
              {appliedDiscount !== null && appliedPromoCode && (
                 <div className="flex items-center gap-2 text-sm text-green-600">
                   <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">Applied</Badge>
                   <span>Code '{appliedPromoCode}' applied ({appliedDiscount}% discount)</span>
                   <Button 
                     type="button" 
                     variant="ghost" 
                     size="sm" 
                     onClick={() => {
                       setPromoCodeInput("");
                       setAppliedDiscount(null);
                       setAppliedPromoCode(null);
                       setPromoError(null);
                     }}
                     className="h-auto p-0 text-destructive hover:bg-transparent hover:text-destructive/80"
                   >
                     Remove
                   </Button>
                 </div>
              )}
            </section>

            {/* Order Total */}
            <div className="pt-4 space-y-2 text-right">
              {appliedDiscount !== null && (
                 <>
                   <p className="text-muted-foreground text-sm">Original Total: ${total.toFixed(2)}</p>
                   <p className="text-muted-foreground text-sm">Discount ({appliedDiscount}%): -${(total - discountedTotal).toFixed(2)}</p>
                 </>
              )}
              <p className="text-xl font-bold">
                Total: ${discountedTotal.toFixed(2)}
              </p>
            </div>

            {/* Submit Button */}
            <DialogFooter className="pt-6">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isSubmitting ? "Processing..." : `Pay $${discountedTotal.toFixed(2)}`} {/* Update button text */}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}