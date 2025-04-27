import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface OnboardingFormProps {
  step: number;
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
  initialData?: any;
}

export function OnboardingForm({
  step,
  onSubmit,
  isSubmitting,
  initialData
}: OnboardingFormProps) {
  // Business Info Form State (Step 2)
  const [businessName, setBusinessName] = useState("");
  const [industry, setIndustry] = useState("");
  const [monthlyRevenue, setMonthlyRevenue] = useState("");

  // Financial Goals Form State (Step 3)
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  // Bank Connection State (Step 4)
  const [bankConnected, setBankConnected] = useState(false);

  // Profit Split Form State (Step 5)
  const [ownerPay, setOwnerPay] = useState(40);
  const [reinvestment, setReinvestment] = useState(30);
  const [savings, setSavings] = useState(20);
  const [taxReserve, setTaxReserve] = useState(10);

  // Initialize form with initial data if available
  useEffect(() => {
    if (initialData) {
      if (initialData.businessName) setBusinessName(initialData.businessName);
      if (initialData.industry) setIndustry(initialData.industry);
      if (initialData.monthlyRevenue) setMonthlyRevenue(initialData.monthlyRevenue);
      if (initialData.financialGoals) {
        try {
          const goalsArray = JSON.parse(initialData.financialGoals);
          setSelectedGoals(goalsArray);
        } catch (e) {
          // Handle parsing error
        }
      }
      if (initialData.bankConnected) setBankConnected(initialData.bankConnected);
      
      // Get profit split percentages if available
      const profitSplit = initialData.profitSplit;
      if (profitSplit) {
        if (profitSplit.ownerPay !== undefined) setOwnerPay(profitSplit.ownerPay);
        if (profitSplit.reinvestment !== undefined) setReinvestment(profitSplit.reinvestment);
        if (profitSplit.savings !== undefined) setSavings(profitSplit.savings);
        if (profitSplit.taxReserve !== undefined) setTaxReserve(profitSplit.taxReserve);
      }
    }
  }, [initialData]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let formData = {};
    
    switch (step) {
      case 2: // Business Info
        formData = {
          businessName,
          industry,
          monthlyRevenue,
        };
        break;
      case 3: // Financial Goals
        formData = {
          financialGoals: JSON.stringify(selectedGoals),
        };
        break;
      case 4: // Bank Connection
        formData = {
          bankConnected,
        };
        break;
      case 5: // Profit Split
        formData = {
          profitSplit: {
            ownerPay,
            reinvestment,
            savings,
            taxReserve,
          },
        };
        break;
      default:
        formData = {};
    }
    
    onSubmit(formData);
  };

  // Handle goal selection
  const toggleGoal = (goal: string) => {
    if (selectedGoals.includes(goal)) {
      setSelectedGoals(selectedGoals.filter(g => g !== goal));
    } else {
      // Limit to 3 selections
      if (selectedGoals.length < 3) {
        setSelectedGoals([...selectedGoals, goal]);
      }
    }
  };

  // Handle profit split slider changes
  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<number>>) => {
    setter(Number(event.target.value));
  };

  // Function to skip bank connection
  const skipBankConnection = () => {
    onSubmit({ bankConnected: false });
  };

  // Goal options for Step 3
  const goalOptions = [
    {
      id: "stability",
      label: "Increase business stability",
      description: "Build cash reserves and create predictable income",
    },
    {
      id: "growth",
      label: "Grow revenue aggressively",
      description: "Reinvest profits into marketing and sales",
    },
    {
      id: "major-purchase",
      label: "Save for a major purchase",
      description: "Equipment, expansion, or other big investments",
    },
    {
      id: "owner-pay",
      label: "Increase owner pay",
      description: "Take home more predictable income",
    },
    {
      id: "reduce-debt",
      label: "Reduce business debt",
      description: "Pay down loans or credit lines",
    },
  ];

  // Calculate total percentage for profit split (should equal 100%)
  const totalPercentage = ownerPay + reinvestment + savings + taxReserve;
  const isValidProfitSplit = totalPercentage === 100;

  // Simulate monthly profit for profit split preview
  const monthlyProfit = 5000;

  return (
    <form onSubmit={handleSubmit}>
      {/* Business Info Step (Step 2) */}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="business-name">Business Name</Label>
            <Input
              id="business-name"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Coastal Design Studio"
              required
            />
          </div>
          <div>
            <Label htmlFor="business-industry">Industry</Label>
            <select
              id="business-industry"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#27AE60] focus:border-[#27AE60] bg-white"
              required
            >
              <option value="" disabled>Select your industry</option>
              <option value="retail">Retail</option>
              <option value="services">Professional Services</option>
              <option value="tech">Technology</option>
              <option value="food">Food & Beverage</option>
              <option value="health">Health & Wellness</option>
              <option value="creative">Creative & Design</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <Label htmlFor="monthly-revenue">Approximate Monthly Revenue</Label>
            <select
              id="monthly-revenue"
              value={monthlyRevenue}
              onChange={(e) => setMonthlyRevenue(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#27AE60] focus:border-[#27AE60] bg-white"
              required
            >
              <option value="" disabled>Select a range</option>
              <option value="range1">Less than $1,000</option>
              <option value="range2">$1,000 - $5,000</option>
              <option value="range3">$5,000 - $10,000</option>
              <option value="range4">$10,000 - $25,000</option>
              <option value="range5">$25,000 - $50,000</option>
              <option value="range6">More than $50,000</option>
            </select>
          </div>
          <div className="pt-4">
            <Button
              type="submit"
              className="bg-[#27AE60] hover:bg-[#219653]"
              disabled={isSubmitting || !businessName || !industry || !monthlyRevenue}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Continue"
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Financial Goals Step (Step 3) */}
      {step === 3 && (
        <div>
          <p className="text-gray-600 mb-4">Select 1-3 that matter most to your business right now.</p>
          
          <div className="space-y-3">
            {goalOptions.map((goal) => (
              <label
                key={goal.id}
                className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedGoals.includes(goal.id)
                    ? "border-[#27AE60] bg-[#27AE60]/5"
                    : "border-gray-200 hover:border-[#27AE60]"
                }`}
              >
                <Checkbox
                  checked={selectedGoals.includes(goal.id)}
                  onCheckedChange={() => toggleGoal(goal.id)}
                  className="h-5 w-5 mt-0.5 data-[state=checked]:bg-[#27AE60] data-[state=checked]:text-white"
                />
                <div className="ml-3">
                  <span className="block font-medium">{goal.label}</span>
                  <span className="text-sm text-gray-600">{goal.description}</span>
                </div>
              </label>
            ))}
          </div>
          
          <div className="pt-6">
            <Button
              type="submit"
              className="bg-[#27AE60] hover:bg-[#219653]"
              disabled={isSubmitting || selectedGoals.length === 0}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Continue"
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Bank Connection Step (Step 4) */}
      {step === 4 && (
        <div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-blue-500 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="ml-3">
                <p className="text-sm text-blue-800">
                  This is secure and read-only. GrowWise can't move money or make changes.
                </p>
              </div>
            </div>
          </div>
          
          <button
            type="button"
            className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors mb-4"
            onClick={() => {
              setBankConnected(true);
              onSubmit({ bankConnected: true });
            }}
            disabled={isSubmitting}
          >
            <svg
              className="h-6 w-6 mr-2"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20 4H4C2.89 4 2 4.89 2 6V18C2 19.11 2.89 20 4 20H20C21.11 20 22 19.11 22 18V6C22 4.89 21.11 4 20 4Z"
                stroke="#4A5568"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 10H22"
                stroke="#4A5568"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Connect bank accounts
          </button>
          
          <div className="text-center">
            <button
              type="button"
              className="text-[#27AE60] hover:text-[#219653] font-medium"
              onClick={skipBankConnection}
              disabled={isSubmitting}
            >
              Skip for now, I'll add manually
            </button>
          </div>
        </div>
      )}

      {/* Profit Split Setup (Step 5) */}
      {step === 5 && (
        <div className="space-y-6">
          <div>
            <div className="flex justify-between mb-1">
              <Label htmlFor="owner-pay">Owner Pay</Label>
              <div className="flex flex-col items-end">
                <span className="text-sm font-medium text-[#27AE60]">{ownerPay}%</span>
                <span className="text-xs text-gray-500">
                  {formatCurrency(monthlyProfit * (ownerPay / 100))}
                </span>
              </div>
            </div>
            <input
              type="range"
              id="owner-pay"
              min="0"
              max="100"
              value={ownerPay}
              onChange={(e) => handleSliderChange(e, setOwnerPay)}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <p className="text-xs text-gray-500 mt-1">Your personal compensation</p>
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <Label htmlFor="reinvestment">Reinvestment</Label>
              <div className="flex flex-col items-end">
                <span className="text-sm font-medium text-[#27AE60]">{reinvestment}%</span>
                <span className="text-xs text-gray-500">
                  {formatCurrency(monthlyProfit * (reinvestment / 100))}
                </span>
              </div>
            </div>
            <input
              type="range"
              id="reinvestment"
              min="0"
              max="100"
              value={reinvestment}
              onChange={(e) => handleSliderChange(e, setReinvestment)}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <p className="text-xs text-gray-500 mt-1">For growing your business</p>
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <Label htmlFor="savings">Savings</Label>
              <div className="flex flex-col items-end">
                <span className="text-sm font-medium text-[#27AE60]">{savings}%</span>
                <span className="text-xs text-gray-500">
                  {formatCurrency(monthlyProfit * (savings / 100))}
                </span>
              </div>
            </div>
            <input
              type="range"
              id="savings"
              min="0"
              max="100"
              value={savings}
              onChange={(e) => handleSliderChange(e, setSavings)}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <p className="text-xs text-gray-500 mt-1">Emergency fund and future opportunities</p>
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <Label htmlFor="tax">Tax Reserve</Label>
              <div className="flex flex-col items-end">
                <span className="text-sm font-medium text-[#27AE60]">{taxReserve}%</span>
                <span className="text-xs text-gray-500">
                  {formatCurrency(monthlyProfit * (taxReserve / 100))}
                </span>
              </div>
            </div>
            <input
              type="range"
              id="tax"
              min="0"
              max="100"
              value={taxReserve}
              onChange={(e) => handleSliderChange(e, setTaxReserve)}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <p className="text-xs text-gray-500 mt-1">Set aside for taxes</p>
          </div>
          
          {!isValidProfitSplit && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-sm text-amber-800">
                Your total allocation should equal 100% (currently {totalPercentage}%)
              </p>
            </div>
          )}
          
          {isValidProfitSplit && (
            <div className="bg-[#27AE60]/10 border border-[#27AE60]/30 rounded-lg p-3">
              <div className="flex">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-[#27AE60] mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="ml-3">
                  <p className="text-sm text-[#219653]">
                    Great balance! This allocation gives you solid owner pay while building for the future.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="pt-4">
            <Button
              type="submit"
              className="bg-[#27AE60] hover:bg-[#219653]"
              disabled={isSubmitting || !isValidProfitSplit}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save & Continue"
              )}
            </Button>
          </div>
        </div>
      )}
    </form>
  );
}
