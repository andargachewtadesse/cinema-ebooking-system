"use client"

import { useState, useEffect } from "react"
import { useAdmin } from "@/contexts/AdminContext" 
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea" // Import Textarea
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Plus, Trash2, Send } from "lucide-react"
import { Promotion } from "@/types/Promotion"
import {
  fetchAllPromotions,
  createPromotion,
  deletePromotion,
  sendPromotion,
} from "@/lib/api" // Import API functions
import { Progress } from "@/components/ui/progress"

export default function PromotionsPage() {
  const { isAdmin } = useAdmin() // Use admin context for access control
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [formError, setFormError] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = useState(false)
  const [promotionToDelete, setPromotionToDelete] = useState<Promotion | null>(null)
  const [newPromotion, setNewPromotion] = useState({
    code: "",
    discountPercentage: 0,
    description: "",
  })
  const [isConfirmSendDialogOpen, setIsConfirmSendDialogOpen] = useState(false)
  const [promotionToSend, setPromotionToSend] = useState<Promotion | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [sendProgress, setSendProgress] = useState(0)
  const [sendingMessage, setSendingMessage] = useState("")

  const fetchPromotions = async () => {
    try {
      setIsLoading(true)
      setError("")
      const data = await fetchAllPromotions()
      setPromotions(data)
    } catch (err: any) {
      console.error("Error fetching promotions:", err)
      setError(err.message || "Failed to load promotions. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Always fetch promotions, even if isAdmin is false
    fetchPromotions();
    
    console.log("Page loaded, admin status:", isAdmin);
  }, [isAdmin]); // Keep isAdmin in the dependency array

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setNewPromotion(prev => ({
      ...prev,
      [id]: id === "discountPercentage" ? parseFloat(value) || 0 : value,
    }))
  }

  const validateForm = () => {
    if (!newPromotion.description || !newPromotion.code || newPromotion.discountPercentage <= 0 || newPromotion.discountPercentage > 100) {
      setFormError("Please enter a valid code, description and discount percentage (1-100).")
      return false
    }
    setFormError("")
    return true
  }

  const handleCreatePromotion = async () => {
    if (!validateForm()) return

    try {
      await createPromotion(newPromotion)
      setNewPromotion({ code: "", discountPercentage: 0, description: "" }) // Reset form
      setIsAddDialogOpen(false)
      fetchPromotions() // Refresh list
    } catch (err: any) {
      console.error("Error creating promotion:", err)
      setFormError(err.message || "Failed to create promotion. Please try again.")
    }
  }

  const handleDeleteClick = (promotion: Promotion) => {
    setPromotionToDelete(promotion)
    setIsConfirmDeleteDialogOpen(true)
  }

  const confirmDeletePromotion = async () => {
    if (!promotionToDelete) return

    try {
      await deletePromotion(promotionToDelete.promotionId)
      setPromotionToDelete(null)
      setIsConfirmDeleteDialogOpen(false)
      fetchPromotions() // Refresh list
    } catch (err: any) {
      console.error("Error deleting promotion:", err)
      setError(err.message || "Failed to delete promotion. Please try again.") // Show error in main area
      setIsConfirmDeleteDialogOpen(false)
    }
  }

  const handleSendClick = (promotion: Promotion) => {
    setPromotionToSend(promotion)
    setIsConfirmSendDialogOpen(true)
  }

  const confirmSendPromotion = async () => {
    if (!promotionToSend) return;

    try {
      setIsSending(true);
      setSendProgress(0);
      setSendingMessage("Preparing to send emails...");
      
      // Start progress simulation
      const simulateProgress = () => {
        const interval = setInterval(() => {
          setSendProgress(prev => {
            if (prev >= 90) {
              clearInterval(interval);
              return 90; // Cap at 90% until we get confirmation
            }
            return prev + 10;
          });
          
          // Update messages based on progress
          setSendingMessage(prev => {
            if (sendProgress < 30) return "Connecting to email server...";
            if (sendProgress < 60) return "Sending promotion emails...";
            return "Finalizing email delivery...";
          });
        }, 500);
        
        return interval;
      };
      
      const progressInterval = simulateProgress();
      
      // Actually send emails
      await sendPromotion(promotionToSend.promotionId);
      
      // Complete the progress
      clearInterval(progressInterval);
      setSendProgress(100);
      setSendingMessage("Emails sent successfully!");
      
      // Don't auto-close or refresh
      
    } catch (err: any) {
      console.error("Error sending promotion:", err);
      setError(err.message || "Failed to send promotion. Please try again.");
      setIsSending(false);
      setSendProgress(0);
      setSendingMessage("");
      setIsConfirmSendDialogOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Manage Promotions</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Promotion
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Promotion</DialogTitle>
              <DialogDescription>
                Enter the details for the new promotion. The description will be shown to customers.
              </DialogDescription>
            </DialogHeader>
            {formError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="code">Promotion Code</Label>
                <Input
                  id="code"
                  placeholder="e.g., SUMMER25"
                  value={newPromotion.code}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="discountPercentage">Discount Percentage</Label>
                <Input
                  id="discountPercentage"
                  type="number"
                  min="1"
                  max="100"
                  placeholder="e.g., 25"
                  value={newPromotion.discountPercentage === 0 ? '' : newPromotion.discountPercentage}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description / Title</Label>
                <Textarea
                  id="description"
                  placeholder="e.g., Summer Sale - 25% off all tickets!"
                  value={newPromotion.description}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreatePromotion}>Save Promotion</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
         <div className="text-center py-4">Loading promotions...</div>
      ) : promotions.length === 0 && !error ? (
         <div className="text-center py-4 text-muted-foreground">No promotions found.</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Created On</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {promotions.map((promo) => (
              <TableRow key={promo.promotionId}>
                <TableCell className="font-medium">{promo.code}</TableCell>
                <TableCell>
                  <div className="tooltip" title={promo.description}>
                    {promo.description}
                  </div>
                </TableCell>
                <TableCell>{promo.discountPercentage}%</TableCell>
                <TableCell>{new Date(promo.creationDate).toLocaleDateString()}</TableCell>
                <TableCell>{promo.sent ? "Sent" : "Not Sent"}</TableCell>
                <TableCell className="text-right space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleSendClick(promo)}
                    disabled={promo.sent}
                    title={promo.sent ? "Already sent" : "Send Promotion"}
                  >
                    <Send className={`h-4 w-4 ${promo.sent ? 'text-gray-400' : ''}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteClick(promo)}
                    title="Delete Promotion"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Confirmation Dialog for Delete */}
      <Dialog open={isConfirmDeleteDialogOpen} onOpenChange={setIsConfirmDeleteDialogOpen}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>Confirm Deletion</DialogTitle>
                  <DialogDescription>
                      Are you sure you want to delete the promotion: "{promotionToDelete?.description}"? This action cannot be undone.
                  </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                  <Button variant="outline" onClick={() => setIsConfirmDeleteDialogOpen(false)}>
                      Cancel
                  </Button>
                  <Button variant="destructive" onClick={confirmDeletePromotion}>
                      Delete
                  </Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>

      {/* Confirmation Dialog for Send */}
      <Dialog open={isConfirmSendDialogOpen} onOpenChange={(open) => {
        if (!isSending) setIsConfirmSendDialogOpen(open);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isSending ? "Sending Promotion..." : "Confirm Sending Promotion"}
            </DialogTitle>
            {!isSending && (
              <DialogDescription>
                Are you sure you want to send the promotion "{promotionToSend?.description}" to all subscribed users?
                This will send emails with the promotion code: {promotionToSend?.code}
              </DialogDescription>
            )}
          </DialogHeader>
          
          {isSending && (
            <div className="my-4 space-y-3">
              <Progress value={sendProgress} className="w-full h-2" />
              <div className="text-sm text-center">{sendingMessage}</div>
              <div className="text-xs text-center text-gray-500">
                {sendProgress < 100 ? "Please don't close this dialog." : "Complete!"}
              </div>
            </div>
          )}
          
          <DialogFooter>
            {!isSending ? (
              <>
                <Button variant="outline" onClick={() => setIsConfirmSendDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={confirmSendPromotion}>
                  Send Promotion
                </Button>
              </>
            ) : sendProgress === 100 ? (
              <Button onClick={() => {
                setIsSending(false);
                setIsConfirmSendDialogOpen(false);
                // No automatic refresh here
              }}>
                Close
              </Button>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

