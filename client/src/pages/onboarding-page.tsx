import { MainLayout } from "@/components/layouts/MainLayout";
import { OnboardingForm } from "@/components/onboarding/OnboardingForm";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useParams, useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Smile, LucideIcon } from "lucide-react";
import { useState } from "react";

// Define all possible steps
const ONBOARDING_STEPS = {
  WELCOME: "1",
  BUSINESS_INFO: "2",
  FINANCIAL_GOALS: "3",
  BANK_CONNECTION: "4",
  PROFIT_SPLIT: "5",
};

// Content for each step
const stepContent = {
  [ONBOARDING_STEPS.WELCOME]: {
    title: "Welcome to GrowWise!",
    description: "Let's set up your account to help your business grow smarter. This will only take a few minutes.",
    icon: Smile,
  },
  [ONBOARDING_STEPS.BUSINESS_INFO]: {
    title: "Tell us about your business",
    description: "This information helps us customize GrowWise for your specific needs.",
  },
  [ONBOARDING_STEPS.FINANCIAL_GOALS]: {
    title: "What are your financial goals?",
    description: "Select 1-3 that matter most to your business right now.",
  },
  [ONBOARDING_STEPS.BANK_CONNECTION]: {
    title: "Connect your business accounts",
    description: "Link your business bank accounts to automatically import transactions. Your data is secured with bank-level encryption.",
  },
  [ONBOARDING_STEPS.PROFIT_SPLIT]: {
    title: "How would you like to split your profits?",
    description: "We recommend the Profit First method to help your business grow sustainably. You can adjust these later.",
  },
};

export default function OnboardingPage() {
  const { step } = useParams<{ step: string }>();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch existing onboarding data
  const { data: onboarding, isLoading } = useQuery({
    queryKey: ["/api/onboarding"],
  });

  // Update onboarding mutation
  const updateOnboarding = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("PUT", "/api/onboarding", data);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/onboarding"] });
      toast({
        title: "Progress saved",
        description: "Your onboarding progress has been saved.",
      });

      // Move to next step or finish
      const currentStep = Number(step);
      if (currentStep < 5) {
        setLocation(`/onboarding/step/${currentStep + 1}`);
      } else {
        // Onboarding complete, go to dashboard
        setLocation("/dashboard");
      }
    },
    onError: (error) => {
      toast({
        title: "Failed to save progress",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  // Handle step navigation
  const handleNext = (data?: any) => {
    setIsSubmitting(true);
    const currentStep = Number(step);
    
    // Update onboarding status
    updateOnboarding.mutate({
      step: currentStep + 1,
      completed: currentStep === 5,
      ...data,
    });
  };

  const handlePrevious = () => {
    const currentStep = Number(step);
    if (currentStep > 1) {
      setLocation(`/onboarding/step/${currentStep - 1}`);
    }
  };

  // Calculate progress percentage
  const currentStep = Number(step);
  const progressPercentage = (currentStep / 5) * 100;

  // Get current step content
  const currentStepContent = stepContent[step as keyof typeof stepContent] || stepContent["1"];
  const StepIcon = currentStepContent.icon as LucideIcon | undefined;

  return (
    <MainLayout>
      <div className="max-w-xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-[#27AE60]">Setup progress</span>
            <span className="text-sm font-medium text-gray-600">
              Step {currentStep} of 5
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-xl shadow-md p-6">
          {currentStep === 1 ? (
            // Welcome Step
            <div className="text-center py-8">
              {StepIcon && (
                <div className="h-20 w-20 rounded-full bg-[#27AE60]/20 flex items-center justify-center mx-auto mb-6">
                  <StepIcon className="h-10 w-10 text-[#27AE60]" />
                </div>
              )}
              <h2 className="text-2xl font-heading font-semibold mb-4">
                {currentStepContent.title}
              </h2>
              <p className="text-gray-600 mb-8">
                {currentStepContent.description}
              </p>
              <Button 
                className="bg-[#27AE60] hover:bg-[#219653]"
                onClick={() => handleNext()}
                disabled={isSubmitting}
              >
                Let's get started
              </Button>
            </div>
          ) : (
            // Other steps with form
            <>
              <h2 className="text-xl font-heading font-semibold mb-4">
                {currentStepContent.title}
              </h2>
              <p className="text-gray-600 mb-6">
                {currentStepContent.description}
              </p>

              <OnboardingForm
                step={currentStep}
                onSubmit={handleNext}
                isSubmitting={isSubmitting || updateOnboarding.isPending}
                initialData={onboarding}
              />

              <div className="pt-6 flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={handlePrevious}
                  disabled={isSubmitting || updateOnboarding.isPending}
                >
                  Back
                </Button>
                {currentStep === 5 ? (
                  <Button
                    className="bg-[#27AE60] hover:bg-[#219653]"
                    onClick={() => handleNext()}
                    disabled={isSubmitting || updateOnboarding.isPending}
                  >
                    Finish & Go to Dashboard
                  </Button>
                ) : null}
              </div>
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
