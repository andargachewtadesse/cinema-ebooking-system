import { useState, useEffect, useCallback } from "react";
import { usePaymentCards } from "./usePaymentCards";
import { isAuthenticated } from "@/utils/auth";

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  promotionSubscription: boolean;
}

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { cards, loading: cardsLoading } = usePaymentCards();

  const fetchUserProfile = useCallback(async () => {
    try {
      setLoading(true);
      
      // Check authentication first before making API calls
      if (!isAuthenticated()) {
        setError("User not authenticated");
        return;
      }
      
      // Continue with profile fetch if authenticated
      const response = await fetch("http://localhost:8080/api/users/profileLoad");
      
      if (!response.ok) {
        throw new Error("Failed to fetch profile data");
      }
      
      const data = await response.json();
      
      // Create basic profile with user data
      let userProfile: UserProfile = {
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        email: data.email || "",
        streetAddress: data.streetAddress || "",
        city: data.city || "",
        state: data.state || "",
        zipCode: data.zipCode || "",
        promotionSubscription: Boolean(data.promotionSubscription)
      };
      
      setProfile(userProfile);
      
    } catch (err) {
      console.error("Error fetching user profile:", err);
      setError("Failed to load profile data. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  // pdate the profile locally (without API call)
  const updateProfileLocally = useCallback((updatedFields: Partial<UserProfile>) => {
    setProfile(prevProfile => {
      if (!prevProfile) return null;
      
      // Create a new object with the updated fields
      const newProfile = {...prevProfile, ...updatedFields};
      
      console.log("Profile updated locally:", newProfile);
      
      return newProfile;
    });
  }, []);

  // function to refresh the profile data
  const refreshProfile = useCallback(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  return { 
    profile, 
    loading: loading || cardsLoading, 
    error, 
    updateProfileLocally,
    refreshProfile
  };
} 