import { useQuery, useMutation } from "@tanstack/react-query";
import { MainLayout } from "@/components/layouts/MainLayout";
import { ProfitSlider } from "@/components/profits/ProfitSlider";
import { ProfitSplitChart } from "@/components/profits/ProfitSplitChart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Save } from "lucide-react";
import { useState, useEffect } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/hooks/use-currency";
import { ProfitSplit } from "@shared/schema";

interface ProfitSplitFormState {
  ownerPay: number;
  reinvestment: number;
  savings: number;
  taxReserve: number;
}

export default function ProfitSplitPage() {
  const { toast } = useToast();
  const { formatCurrency } = useCurrency();
  const [isModified, setIsModified] = useState(false);
  const [profitSplit, setProfitSplit] = useState<ProfitSplitFormState>({
    ownerPay: 40,
    reinvestment: 30,
    savings: 20,
    taxReserve: 10,
  });

  // Fetch profit split and dashboard data
  const { data: profitSplitData, isLoading: isLoadingProfitSplit } = useQuery<ProfitSplit>({
    queryKey: ["/api/profit-split"],
  });
  
  // Update profit split state when data changes
  useEffect(() => {
    if (profitSplitData) {
      setProfitSplit({
        ownerPay: profitSplitData.ownerPay,
        reinvestment: profitSplitData.reinvestment,
        savings: profitSplitData.savings,
        taxReserve: profitSplitData.taxReserve,
      });
    }
  }, [profitSplitData]);

  interface DashboardSummary {
    summary: {
      profit: number;
      revenue: number;
      expenses: number;
    };
  }

  const { data: dashboardData, isLoading: isLoadingDashboard } = useQuery<DashboardSummary>({
    queryKey: ["/api/dashboard/summary"],
  });

  // Update profit split mutation
  const updateProfitSplit = useMutation({
    mutationFn: async (data: ProfitSplitFormState) => {
      const res = await apiRequest("PUT", "/api/profit-split", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profit-split"] });
      toast({
        title: "Profit split updated",
        description: "Your profit allocation has been updated successfully.",
      });
      setIsModified(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to update profit split",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateProfitSplit.mutate(profitSplit);
  };

  const handleSliderChange = (key: keyof ProfitSplitFormState, value: number) => {
    const newSplit = { ...profitSplit, [key]: value };
    
    // Adjust other values to ensure total is 100%
    const total = Object.values(newSplit).reduce((sum, val) => sum + val, 0);
    
    if (total !== 100) {
      const diff = 100 - total;
      const keysToAdjust = Object.keys(newSplit).filter(k => k !== key) as Array<keyof ProfitSplitFormState>;
      
      // Distribute difference proportionally
      const currentSum = keysToAdjust.reduce((sum, k) => sum + newSplit[k], 0);
      
      if (currentSum > 0) {
        keysToAdjust.forEach(k => {
          const proportion = newSplit[k] / currentSum;
          newSplit[k] = Math.max(0, Math.round(newSplit[k] + diff * proportion));
        });
      }
      
      // Ensure we have exactly 100%
      const finalTotal = Object.values(newSplit).reduce((sum, val) => sum + val, 0);
      if (finalTotal !== 100) {
        const lastKey = keysToAdjust[keysToAdjust.length - 1];
        newSplit[lastKey] += (100 - finalTotal);
      }
    }
    
    setProfitSplit(newSplit);
    setIsModified(true);
  };

  const isLoading = isLoadingProfitSplit || isLoadingDashboard;
  const currentMonthProfit = dashboardData?.summary?.profit || 0;

  return (
    <MainLayout title="Profit Split">
      <div className="max-w-4xl mx-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#27AE60]" />
          </div>
        ) : (
          <>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Monthly Profit Allocation</CardTitle>
                <CardDescription>
                  Distribute your monthly profit across these categories to help your business grow sustainably.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-medium">This Month's Profit</h3>
                    <span className="text-2xl font-semibold text-[#27AE60]">
                      {formatCurrency(currentMonthProfit)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    Allocate your profit using the sliders below. Changes will be reflected in the chart.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <ProfitSlider
                      label="Owner Pay"
                      value={profitSplit.ownerPay}
                      onChange={(value) => handleSliderChange("ownerPay", value)}
                      description="Your personal compensation"
                      amount={currentMonthProfit * (profitSplit.ownerPay / 100)}
                    />
                    
                    <ProfitSlider
                      label="Reinvestment"
                      value={profitSplit.reinvestment}
                      onChange={(value) => handleSliderChange("reinvestment", value)}
                      description="For growing your business"
                      amount={currentMonthProfit * (profitSplit.reinvestment / 100)}
                    />
                    
                    <ProfitSlider
                      label="Savings"
                      value={profitSplit.savings}
                      onChange={(value) => handleSliderChange("savings", value)}
                      description="Emergency fund and future opportunities"
                      amount={currentMonthProfit * (profitSplit.savings / 100)}
                    />
                    
                    <ProfitSlider
                      label="Tax Reserve"
                      value={profitSplit.taxReserve}
                      onChange={(value) => handleSliderChange("taxReserve", value)}
                      description="Set aside for taxes"
                      amount={currentMonthProfit * (profitSplit.taxReserve / 100)}
                    />
                  </div>
                  
                  <div className="flex flex-col justify-center">
                    <ProfitSplitChart
                      data={[
                        { name: "Owner Pay", value: profitSplit.ownerPay, amount: currentMonthProfit * (profitSplit.ownerPay / 100) },
                        { name: "Reinvestment", value: profitSplit.reinvestment, amount: currentMonthProfit * (profitSplit.reinvestment / 100) },
                        { name: "Savings", value: profitSplit.savings, amount: currentMonthProfit * (profitSplit.savings / 100) },
                        { name: "Tax Reserve", value: profitSplit.taxReserve, amount: currentMonthProfit * (profitSplit.taxReserve / 100) },
                      ]}
                    />
                  </div>
                </div>

                <div className="mt-8">
                  <Button
                    className="bg-[#27AE60] hover:bg-[#219653]"
                    onClick={handleSave}
                    disabled={!isModified || updateProfitSplit.isPending}
                  >
                    {updateProfitSplit.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Allocation
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tips for Healthy Profit Allocation</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="h-5 w-5 bg-[#27AE60]/20 rounded-full flex items-center justify-center text-[#27AE60] mr-2 flex-shrink-0">•</span>
                    <span className="text-sm">
                      <strong>Owner Pay (30-50%):</strong> Pay yourself consistently to maintain personal financial stability.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="h-5 w-5 bg-[#27AE60]/20 rounded-full flex items-center justify-center text-[#27AE60] mr-2 flex-shrink-0">•</span>
                    <span className="text-sm">
                      <strong>Reinvestment (20-40%):</strong> Fuel growth by allocating funds to marketing, equipment, or hiring.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="h-5 w-5 bg-[#27AE60]/20 rounded-full flex items-center justify-center text-[#27AE60] mr-2 flex-shrink-0">•</span>
                    <span className="text-sm">
                      <strong>Savings (10-25%):</strong> Build a 3-6 month operating expense cushion for emergencies.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="h-5 w-5 bg-[#27AE60]/20 rounded-full flex items-center justify-center text-[#27AE60] mr-2 flex-shrink-0">•</span>
                    <span className="text-sm">
                      <strong>Tax Reserve (10-20%):</strong> Set aside money for quarterly or annual tax payments to avoid surprises.
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </MainLayout>
  );
}
