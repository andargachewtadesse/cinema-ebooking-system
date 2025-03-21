import { useState, useEffect, useCallback } from "react";

interface PaymentCard {
  id: number;
  cardholderName: string;
  cardNumber: string;
  cardAddress: string;
  expirationDate: string;
}

export function usePaymentCards() {
  const [cards, setCards] = useState<PaymentCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPaymentCards = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:8080/api/cards/activeCards");
      
      if (!response.ok) {
        throw new Error("Failed to fetch payment cards");
      }
      
      const data = await response.json();
      setCards(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching payment cards:", err);
      setError("Failed to load payment cards. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPaymentCards();
  }, [fetchPaymentCards]);

  const refreshCards = () => {
    fetchPaymentCards();
  };

  return { cards, loading, error, refreshCards };
} 