import { Promotion } from "@/types/Promotion" 

const API_BASE_URL = "http://localhost:8080/api"

const getAuthHeaders = () => {
  const token = localStorage.getItem("authToken")
  return {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json",
  }
}

// Fetch all promotions (for admin)
export const fetchAllPromotions = async (): Promise<Promotion[]> => {
  const response = await fetch(`${API_BASE_URL}/promotions/admin/all`, {
    headers: getAuthHeaders(),
  })
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || "Failed to fetch promotions")
  }
  return response.json()
}

// Create a new promotion (for admin)
export const createPromotion = async (
  promotionData: Omit<Promotion, "promotionId" | "creationDate" | "sent">
): Promise<Promotion> => {
  const response = await fetch(`${API_BASE_URL}/promotions/admin/create`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(promotionData),
  })
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || "Failed to create promotion")
  }
  const result = await response.json()
  return result.promotion
}

// Delete a promotion (for admin)
export const deletePromotion = async (promotionId: number): Promise<void> => {
  console.log("Attempting to delete promotion with ID:", promotionId);
  const headers = getAuthHeaders();
  console.log("Using headers:", headers);
  
  const response = await fetch(`${API_BASE_URL}/promotions/admin/delete/${promotionId}`, {
    method: "DELETE",
    headers: headers,
  });
  
  console.log("Delete response status:", response.status);
  
  if (!response.ok) {
    let errorMessage = "Failed to delete promotion";
    try {
      const errorData = await response.json();
      console.error("Error data:", errorData);
      errorMessage = errorData.error || errorMessage;
    } catch (e) {
      console.error("Could not parse error response:", e);
    }
    throw new Error(errorMessage);
  }
  
  console.log("Successfully deleted promotion");
}


export const sendPromotion = async (promotionId: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/promotions/admin/send/${promotionId}`, {
    method: "POST",
    headers: getAuthHeaders(),
  })
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || "Failed to send promotion")
  }
}
