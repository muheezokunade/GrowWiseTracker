import { useAuth } from "@/hooks/use-auth";
import { formatCurrency as formatCurrencyUtil } from "@/lib/utils";

/**
 * Custom hook to format currency based on the user's preferred currency
 * Falls back to USD if no user or no currency preference is set
 */
export function useCurrency() {
  const { user } = useAuth();
  
  const currencyCode = user?.currency || "USD";
  
  // Format function that uses the user's currency preference
  const formatCurrency = (amount: number) => {
    return formatCurrencyUtil(amount, currencyCode);
  };
  
  return {
    currencyCode,
    formatCurrency,
  };
}