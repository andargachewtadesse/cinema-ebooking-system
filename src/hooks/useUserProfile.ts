import { useState, useEffect } from "react";
import { usePaymentCards } from "./usePaymentCards";

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
}

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { cards, loading: cardsLoading } = usePaymentCards();

  useEffect(() => {
    async function fetchUserProfile() {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:8080/api/users/profileLoad");
        
        if (!response.ok) {
          throw new Error("Failed to fetch profile data");
        }
        
        const data = await response.json();
        
        // Create basic profile with user data
        let userProfile = {
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
          streetAddress: "",
          city: "",
          state: "",
          zipCode: ""
        };
        
        setProfile(userProfile);
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setError("Failed to load profile data. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchUserProfile();
  }, []);

  // Secondary effect to fetch address from address API endpoint
  useEffect(() => {
    if (profile && profile.email && !profile.streetAddress) {
      async function fetchUserAddress() {
        try {
          // Try to get address from a direct API call
          const response = await fetch("http://localhost:8080/api/users/userAddress");
          
          if (response.ok) {
            const addressData = await response.json();
            
            setProfile(prev => ({
              ...prev!,
              streetAddress: addressData.streetAddress || "",
              city: addressData.city || "",
              state: addressData.state || "",
              zipCode: addressData.zipCode || ""
            }));
          } else {
            // No direct address API, try to extract from card address
            if (cards && cards.length > 0 && cards[0].cardAddress) {
              // Assuming address format: "Street, City, State ZIP"
              const addressParts = cards[0].cardAddress.split(', ');
              if (addressParts.length >= 3) {
                const street = addressParts[0];
                const city = addressParts[1];
                // Last part might be "State ZIP"
                const stateZipParts = addressParts[2].split(' ');
                const state = stateZipParts[0];
                const zip = stateZipParts.length > 1 ? stateZipParts[1] : "";
                
                setProfile(prev => ({
                  ...prev!,
                  streetAddress: street,
                  city: city,
                  state: state,
                  zipCode: zip
                }));
              }
            }
          }
        } catch (err) {
          console.error("Error fetching user address:", err);
          // We don't set the main error since the profile still loaded
        }
      }
      
      fetchUserAddress();
    }
  }, [profile, cards]);

  return { profile, loading: loading || cardsLoading, error };
} 